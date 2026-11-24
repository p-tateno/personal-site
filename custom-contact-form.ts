import { readFileSync } from "node:fs"
import { join } from "node:path"
import type { QuartzTransformerPlugin } from "./quartz/plugins/types"

export const CustomContactForm: QuartzTransformerPlugin = () => ({
  name: "CustomContactForm",
  externalResources({ argv }) {
    const settings = JSON.parse(readFileSync(join(argv.directory, "..", "contact-form.json"), "utf8"))
    const endpoint = typeof settings.endpoint === "string" ? settings.endpoint.trim() : ""
    if (endpoint && !/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint)) {
      throw new Error("contact-form.json: FormspreeのフォームURLを指定してください")
    }
    return {
      css: [{ inline: true, content: `
        body[data-slug="contact"] .content-meta { display: none; }
        .center .contact-form { margin-top: 2rem; max-width: 100%; }
        .center .contact-form fieldset { border: 0; padding: 0; margin: 0; min-width: 0; }
        .center .contact-field { margin-bottom: 1.5rem; }
        .center .contact-field label { display: block; margin-bottom: 0.5rem; font-size: 1rem; color: var(--darkgray); }
        .center .contact-field label span { margin-left: 0.5rem; font-size: 0.75rem; color: var(--gray); }
        .center .contact-form input:not([type="hidden"]), .center .contact-form textarea {
          box-sizing: border-box; display: block; width: 100%; padding: 0.8rem 1rem;
          border: 1px solid var(--lightgray); border-radius: 6px; background: var(--light);
          color: var(--dark); font: inherit; line-height: 1.6;
        }
        .center .contact-form textarea { resize: vertical; min-height: 10rem; }
        .center .contact-form :focus-visible { outline: 2px solid var(--secondary); outline-offset: 3px; }
        .center .contact-form button {
          padding: 0.7rem 1.5rem; border: 1px solid var(--darkgray); border-radius: 6px;
          color: var(--light); background: var(--darkgray); font: inherit; cursor: pointer;
        }
        .center .contact-form fieldset:disabled { opacity: 0.5; }
        .center .contact-form button:disabled, .center .contact-form fieldset:disabled button { cursor: default; }
        .center .contact-form .contact-honeypot { display: none; }
        .center .contact-form .contact-status { font-size: 1rem; line-height: 1.7; text-align: start; }
        .center .contact-form .contact-note { font-size: 0.85rem; line-height: 1.7; text-align: start; }
      ` }],
      js: [{ contentType: "inline", loadTime: "afterDOMReady", spaPreserve: true, script: `(() => {
        const endpoint = ${JSON.stringify(endpoint)};
        function setupContactForm() {
          const form = document.getElementById("contact-form");
          if (!form || form.dataset.initialized) return;
          form.dataset.initialized = "true";
          const fieldset = form.querySelector("fieldset");
          const status = form.querySelector(".contact-status");
          const button = form.querySelector('button[type="submit"]');
          form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!endpoint || form.dataset.sending === "true" || !form.reportValidity()) return;
            const data = new FormData(form);
            form.dataset.sending = "true";
            fieldset.disabled = true;
            form.setAttribute("aria-busy", "true");
            button.textContent = "送信中…";
            status.textContent = "メッセージを送信しています。";
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);
            try {
              const response = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" }, signal: controller.signal });
              if (!response.ok) throw new Error("send failed");
              form.reset();
              status.textContent = "メッセージを送信しました。ありがとうございます。";
            } catch {
              status.textContent = "送信できませんでした。通信環境を確認し、少し時間をおいてもう一度お試しください。入力内容は残っています。";
            } finally {
              clearTimeout(timeout);
              fieldset.disabled = false;
              button.textContent = "送信する";
              delete form.dataset.sending;
              form.removeAttribute("aria-busy");
            }
          });
          if (endpoint) {
            form.action = endpoint;
            fieldset.disabled = false;
            status.textContent = "";
          }
        }
        setupContactForm(); document.addEventListener("nav", setupContactForm);
      })();` }],
    }
  },
})

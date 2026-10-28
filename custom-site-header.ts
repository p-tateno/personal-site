import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { parse } from "yaml"
import { slugifyFilePath } from "@quartz-community/utils"
import type { QuartzTransformerPlugin } from "./quartz/plugins/types"

export const CustomSiteHeader: QuartzTransformerPlugin = () => ({
  name: "CustomSiteHeader",
  externalResources({ argv, cfg }) {
    const base = new URL(`https://${cfg.configuration.baseUrl}`).pathname.replace(/\/$/, "")
    const source = readFileSync(join(argv.directory, "index.md"), "utf8").replace(/^\uFEFF/, "")
    const frontmatter = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(source)
    const metadata = frontmatter ? parse(frontmatter[1]) : undefined
    const siteTitle = typeof metadata?.title === "string" && metadata.title.trim()
      ? metadata.title.trim()
      : cfg.configuration.pageTitle
    const names = readdirSync(argv.directory, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && !entry.name.startsWith("."))
      .map(entry => entry.name)
    const sections = names.map(name => ({
      label: name,
      slug: slugifyFilePath(`${name}/index.md` as Parameters<typeof slugifyFilePath>[0]).replace(/\/index$/, ""),
    }))
    return {
      css: [{ inline: true, content: `
        #site-topbar {
          box-sizing: border-box; width: 100%; max-width: none; min-height: 76px;
          margin: 0 auto; padding: 60px var(--header-content-right, 24px) 16px var(--header-content-left, 80px);
          display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;
          color: var(--dark); font-size: 1rem; line-height: 1.5;
        }
        #site-topbar a { background: none; text-decoration: none; font-weight: 400; }
        #site-topbar .site-identity { display: flex; align-items: baseline; gap: 0.5em; min-width: 0; white-space: nowrap; }
        #site-topbar .site-name { color: var(--dark); font-size: 1.6em; font-weight: 700; }
        #site-topbar .site-section { color: var(--gray); font-weight: 400; }
        #site-topbar .site-links { display: flex; gap: 0.7em; align-items: center; white-space: nowrap; }
        #site-topbar .site-links a { color: var(--darkgray); }
        #site-topbar a:hover { color: var(--secondary); }
        #site-topbar a[aria-current] { color: var(--secondary); }
        #site-topbar .site-theme-switch {
          display: grid; place-items: center; flex: 0 0 auto; width: 36px; height: 36px;
          border: 1px solid var(--lightgray); border-radius: 18px; padding: 0;
          background: transparent; color: var(--darkgray); cursor: pointer;
        }
        #site-topbar .site-theme-switch svg { width: 20px; height: 20px; }
        #site-topbar :focus-visible { outline: 2px solid var(--secondary); outline-offset: 4px; }
        html body #quartz-root.page > #quartz-body > .center > .page-header { margin-top: 2rem; }
        body[data-slug="index"] .center .article-title { display: none; }
        @media (max-width: 800px) {
          #site-topbar { min-height: 76px; gap: 12px; padding-top: 24px; font-size: 0.9rem; }
          #site-topbar { flex-wrap: wrap; }
          #site-topbar .site-links { margin-left: auto; }
          #site-topbar .site-identity { overflow: hidden; }
          #site-topbar .site-section { overflow: hidden; text-overflow: ellipsis; }
        }
      ` }],
      js: [{
        contentType: "inline", loadTime: "afterDOMReady", spaPreserve: true,
        script: `(() => {
          const base = ${JSON.stringify(base)};
          const sections = ${JSON.stringify(sections)};
          const name = ${JSON.stringify(siteTitle)};
          // Lucide Sun, ISC License: see custom-sidebar-menu.ts for the license notice.
          const sun = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42m0-14.14-1.42 1.42M6.35 17.65l-1.42 1.42"/></svg>';
          let contentObserver;
          function renderHeader() {
            const root = document.getElementById("quartz-root");
            if (!root) return;
            document.getElementById("site-topbar")?.remove();
            const nav = document.createElement("nav");
            nav.id = "site-topbar";
            nav.setAttribute("aria-label", "サイトナビゲーション");
            const identity = document.createElement("div"); identity.className = "site-identity";
            const home = document.createElement("a"); home.className = "site-name";
            home.href = base + "/"; home.textContent = name; identity.appendChild(home);
            const slug = document.body.dataset.slug || "index";
            const current = sections.find(section => slug === section.slug || slug.startsWith(section.slug + "/"));
            if (current) {
              const separator = document.createElement("span"); separator.className = "site-section";
              separator.textContent = "/"; separator.setAttribute("aria-hidden", "true");
              const category = document.createElement("a"); category.className = "site-section";
              category.href = base + "/" + current.slug + "/"; category.textContent = current.label;
              identity.append(separator, category);
            }
            const links = document.createElement("div"); links.className = "site-links";
            const destinations = [
              { label: "プロフィール", path: "/profile" },
              { label: "コンタクト", path: "/contact" },
            ];
            destinations.forEach((destination, index) => {
              if (index) {
                const divider = document.createElement("span");
                divider.textContent = "｜"; divider.setAttribute("aria-hidden", "true");
                links.appendChild(divider);
              }
              const link = document.createElement("a");
              link.href = base + destination.path; link.textContent = destination.label;
              links.appendChild(link);
            });
            const theme = document.createElement("button"); theme.type = "button";
            theme.className = "site-theme-switch"; theme.setAttribute("aria-label", "明暗を切り替える");
            theme.innerHTML = sun;
            theme.addEventListener("click", () => document.querySelector(".sidebar.left button.darkmode")?.click());
            links.appendChild(theme); nav.append(identity, links); root.before(nav);
            alignHeader();
            requestAnimationFrame(alignHeader);
            contentObserver?.disconnect();
            const content = document.querySelector("#quartz-body > .center");
            if (content && typeof ResizeObserver !== "undefined") {
              contentObserver = new ResizeObserver(alignHeader);
              contentObserver.observe(content);
            }
          }
          function alignHeader() {
            const nav = document.getElementById("site-topbar");
            const content = document.querySelector("#quartz-body > .center > article .markdown-preview-view, #quartz-body > .center > .popover-hint > article .markdown-preview-view")
              || document.querySelector("#quartz-body > .center > article, #quartz-body > .center > .popover-hint > article")
              || document.querySelector("#quartz-body > .center");
            if (!nav || !content) return;
            const rect = content.getBoundingClientRect();
            const frame = nav.getBoundingClientRect();
            const style = getComputedStyle(content);
            const left = rect.left + (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.borderLeftWidth) || 0);
            const right = rect.right - (parseFloat(style.paddingRight) || 0) - (parseFloat(style.borderRightWidth) || 0);
            nav.style.setProperty("--header-content-left", Math.max(0, left - frame.left) + "px");
            nav.style.setProperty("--header-content-right", Math.max(0, frame.right - right) + "px");
          }
          window.addEventListener("resize", alignHeader);
          document.fonts?.ready.then(alignHeader);
          renderHeader(); document.addEventListener("nav", renderHeader);
        })();`,
      }],
    }
  },
})

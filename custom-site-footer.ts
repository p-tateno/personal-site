import { h } from "preact"
import type { QuartzTransformerPlugin } from "./quartz/plugins/types"

export const CustomSiteFooter: QuartzTransformerPlugin = () => ({
  name: "CustomSiteFooter",
  externalResources() {
    return {
      additionalHead: [h("style", {}, `#quartz-body > footer:not([data-custom-footer]) { visibility: hidden; }`)],
      js: [{
        contentType: "inline", loadTime: "afterDOMReady", spaPreserve: true,
        script: `(() => {
          function updateFooter() {
            document.querySelectorAll("#quartz-body > footer").forEach(footer => {
              const text = document.createElement("p");
              text.textContent = "TATENO Mitsuhiro © 2026";
              footer.replaceChildren(text);
              footer.setAttribute("data-custom-footer", "true");
            });
          }
          updateFooter();
          document.addEventListener("nav", updateFooter);
        })();`,
      }],
    }
  },
})

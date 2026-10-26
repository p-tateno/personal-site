import { readdirSync } from "node:fs"
import { join } from "node:path"
import { slugifyFilePath } from "@quartz-community/utils"
import type { QuartzTransformerPlugin } from "./quartz/plugins/types"

export const CustomSiteLinks: QuartzTransformerPlugin = () => ({
  name: "CustomSiteLinks",
  externalResources({ argv, cfg }) {
    const base = new URL(`https://${cfg.configuration.baseUrl}`).pathname.replace(/\/$/, "")
    const folders: string[] = []
    function scan(relative = "") {
      for (const item of readdirSync(join(argv.directory, relative), { withFileTypes: true })) {
        if (!item.isDirectory() || item.name.startsWith(".")) continue
        const path = relative ? `${relative}/${item.name}` : item.name
        folders.push(slugifyFilePath(`${path}/index.md` as Parameters<typeof slugifyFilePath>[0]).replace(/\/index$/, ""))
        scan(path)
      }
    }
    scan()
    return { js: [{
      contentType: "inline", loadTime: "afterDOMReady", spaPreserve: true,
      script: `(() => {
        const base = ${JSON.stringify(base)};
        const folders = ${JSON.stringify(folders)};
        const normalize = path => decodeURIComponent(path).replace(/\\/+$|\\.html$/g, "").replace(/\\/index$/, "").normalize("NFC");
        function fixLinks() {
          const canonical = new URL(base + "/" + (document.body.dataset.slug || "index"), location.origin);
          document.querySelectorAll("a[href]").forEach(link => {
            const href = link.getAttribute("href") || "";
            if (!href || href.startsWith("#")) return;
            let url;
            try { url = new URL(href, canonical); } catch { return; }
            if (url.origin !== location.origin) return;
            const path = normalize(url.pathname);
            const folder = folders.find(folder => path === base + "/" + folder || path.endsWith("/" + folder));
            if (folder) link.setAttribute("href", base + "/" + folder + "/" + url.search + url.hash);
          });
          const home = document.querySelector(".breadcrumb-container .breadcrumb-element:first-child a");
          if (home) home.setAttribute("href", base + "/");
        }
        fixLinks();
        document.addEventListener("nav", fixLinks);
        document.addEventListener("render", fixLinks);
      })();`,
    }] }
  },
})

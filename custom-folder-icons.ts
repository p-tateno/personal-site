import { readdirSync } from "node:fs"
import { join } from "node:path"
import { slugifyFilePath } from "@quartz-community/utils"
import type { QuartzTransformerPlugin } from "./quartz/plugins/types"

export const CustomFolderIcons: QuartzTransformerPlugin = () => ({
  name: "CustomFolderIcons",
  externalResources({ argv, cfg }) {
    const base = new URL(`https://${cfg.configuration.baseUrl}`).pathname.replace(/\/$/, "")
    const folders: string[] = []
    function scan(relative = "") {
      for (const entry of readdirSync(join(argv.directory, relative), { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.startsWith(".")) continue
        const path = relative ? `${relative}/${entry.name}` : entry.name
        const slug = slugifyFilePath(`${path}/index.md` as Parameters<typeof slugifyFilePath>[0])
        folders.push(`${base}/${slug.replace(/\/index$/, "")}`)
        scan(path)
      }
    }
    scan()
    return {
      css: [{ inline: true, content: `
        .center .section-ul .folder-list-link::before {
          content: "📁";
          display: inline-block;
          margin-inline-end: 0.4em;
          font-size: 0.85em;
        }
      ` }],
      js: [{
        contentType: "inline",
        loadTime: "afterDOMReady",
        spaPreserve: true,
        script: `(() => {
          const folders = new Set(${JSON.stringify(folders)});
          function markFolders() {
            document.querySelectorAll(".center .section-ul .desc > h3 > a").forEach((link) => {
              const url = new URL(link.getAttribute("href"), window.location.href);
              const path = decodeURIComponent(url.pathname).replace(/\\/index(?:\\.html)?$/, "").replace(/\\/$/, "");
              link.classList.toggle("folder-list-link", folders.has(path));
            });
          }
          markFolders();
          document.addEventListener("nav", markFolders);
        })();`,
      }],
    }
  },
})

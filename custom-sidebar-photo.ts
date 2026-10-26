import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import type { QuartzTransformerPlugin } from "./quartz/plugins/types"

// PUBLIC/p-images/sidebar.jpg を差し替えて publish するだけで写真を交換できます。
export const CustomSidebarPhoto: QuartzTransformerPlugin = () => ({
  name: "CustomSidebarPhoto",
  externalResources({ argv, cfg }) {
    const imagePath = "p-images/sidebar.jpg"
    if (!existsSync(join(argv.directory, imagePath))) return {}
    const version = createHash("sha256")
      .update(readFileSync(join(argv.directory, imagePath)))
      .digest("hex").slice(0, 12)
    const basePath = new URL(`https://${cfg.configuration.baseUrl}`).pathname.replace(/\/$/, "")
    const src = `${basePath}/${imagePath}?v=${version}`
    return {
      css: [{ inline: true, content: `
        .sidebar.left .sidebar-photo {
          width: 100%;
          max-width: 100%;
          margin: 0;
          flex: 0 0 auto;
        }
        .sidebar.left .sidebar-photo img {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 1;
          object-fit: cover;
        }
        @media (max-width: 800px) {
          .sidebar.left .sidebar-photo { display: none; }
        }
      ` }],
      js: [{
        contentType: "inline",
        loadTime: "afterDOMReady",
        spaPreserve: true,
        script: `(() => {
          function showSidebarPhoto() {
            const explorer = document.querySelector(".sidebar.left .explorer");
            if (!explorer || document.querySelector(".sidebar.left .sidebar-photo")) return;
            const frame = document.createElement("figure");
            frame.className = "sidebar-photo";
            const image = document.createElement("img");
            image.src = ${JSON.stringify(src)};
            image.alt = "舘野光洋の写真";
            image.width = 180;
            image.height = 180;
            image.loading = "lazy";
            frame.appendChild(image);
            const anchor = document.querySelector(".sidebar.left .graph") || explorer;
            anchor.insertAdjacentElement("afterend", frame);
          }
          showSidebarPhoto();
          document.addEventListener("nav", showSidebarPhoto);
        })();`,
      }],
    }
  },
})

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
/*! Lucide Folder — https://lucide.dev/icons/folder
 * ISC License
 * Copyright (c) 2026 Lucide Icons and Contributors
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

        .center .section-ul .folder-list-link::before {
          content: "";
          display: inline-block;
          margin-inline-end: 0.4em;
          width: 0.9em;
          height: 0.9em;
          vertical-align: -0.08em;
          background-color: currentColor;
          -webkit-mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2020H4a2%202%200%200%201-2-2V6a2%202%200%200%201%202-2h3.9a2%202%200%200%201%201.69.9l.81%201.2a2%202%200%200%200%201.67.9H20a2%202%200%200%201%202%202v9a2%202%200%200%201-2%202Z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat;
          mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2020H4a2%202%200%200%201-2-2V6a2%202%200%200%201%202-2h3.9a2%202%200%200%201%201.69.9l.81%201.2a2%202%200%200%200%201.67.9H20a2%202%200%200%201%202%202v9a2%202%200%200%201-2%202Z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat;
        }
      ` }],
      js: [{
        contentType: "inline",
        loadTime: "afterDOMReady",
        spaPreserve: true,
        script: `(() => {
          const folders = ${JSON.stringify(folders)};
          const base = ${JSON.stringify(base)};
          function normalizePath(path) {
            return decodeURIComponent(path).replace(/\\/+$|\\.html$/g, "").replace(/\\/index$/, "").normalize("NFC");
          }
          function markFolders() {
            const canonical = new URL(base + "/" + (document.body.dataset.slug || "index"), window.location.origin);
            document.querySelectorAll(".center .section-ul .desc > h3 > a").forEach((link) => {
              const href = link.getAttribute("href") || "";
              const paths = [new URL(href, canonical), new URL(href, window.location.href)]
                .filter(url => url.origin === window.location.origin)
                .map(url => normalizePath(url.pathname));
              const folder = folders.find(folder => {
                const expected = normalizePath(folder);
                const relative = expected.slice(base.length);
                return paths.some(path => path === expected || path.endsWith(relative));
              });
              link.classList.toggle("folder-list-link", Boolean(folder));
              if (folder) link.setAttribute("href", folder + "/");
            });
          }
          markFolders();
          document.addEventListener("nav", markFolders);
        })();`,
      }],
    }
  },
})

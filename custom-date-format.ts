import { execFileSync } from "node:child_process"
import { dirname, resolve } from "node:path"
import type { QuartzTransformerPlugin } from "./quartz/plugins/types"

// 日付の取得元や並び順は変更せず、画面上の表記だけを YYYY-MM-DD にします。
export const dateFormatScript = `(() => {
  function formatDates() {
    document.querySelectorAll(".center time[datetime]").forEach((element) => {
      const value = element.getAttribute("datetime") || "";
      const match = /^(\\d{4}-\\d{2}-\\d{2})(?:T|$)/.exec(value);
      if (match) element.textContent = match[1];
    });
  }
  formatDates();
  document.addEventListener("nav", formatDates);
})();`

export const CustomDateFormat: QuartzTransformerPlugin = () => ({
  name: "CustomDateFormat",
  htmlPlugins() {
    return [() => (_tree, file) => {
      const slug = file.data.slug || ""
      if (!slug.startsWith("走る/") || !slug.includes("練習記録")) return
      const path = file.data.filePath
      if (!path) return
      let timestamp = ""
      try {
        timestamp = execFileSync("git", ["log", "-1", "--format=%cI", "--", resolve(path)], {
          cwd: dirname(resolve(path)), encoding: "utf8",
        }).trim()
      } catch { return }
      if (!timestamp) return
      const date = new Date(timestamp)
      if (Number.isNaN(date.getTime()) || !file.data.dates) return
      file.data.dates.modified = date
      file.data.defaultDateType = "modified"
    }]
  },
  externalResources() {
    return {
      js: [{
        contentType: "inline",
        loadTime: "afterDOMReady",
        spaPreserve: true,
        script: dateFormatScript,
      }],
    }
  },
})

import { execFileSync } from "node:child_process"
import { dirname, resolve } from "node:path"
import type { QuartzTransformerPlugin } from "./quartz/plugins/types"

// 日付の取得元や並び順は変更せず、画面上の表記だけを YYYY-MM-DD にします。
export const dateFormatScript = `(() => {
  function formatDates() {
    document.querySelectorAll(".center time[datetime]").forEach((element) => {
      const value = element.getAttribute("datetime") || "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return;
      const parts = new Intl.DateTimeFormat("en", {
        timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
      }).formatToParts(date);
      const part = type => parts.find(p => p.type === type).value;
      element.textContent = part("year") + "-" + part("month") + "-" + part("day");
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

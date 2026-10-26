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

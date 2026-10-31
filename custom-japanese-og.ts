import { readFileSync } from "node:fs"
import { h } from "preact"
import { CustomOgImages } from "@quartz-community/og-image"

// Bundle the Japanese font so previews do not depend on the build machine's fonts.
export const JapaneseOgImages = () => {
  const data = readFileSync("quartz/static/fonts/NotoSansJP.ttf")
  return CustomOgImages({
    imageStructure({ title, description, fonts, cfg }) {
      if (!fonts.some(font => font.name === "Noto Sans JP")) {
        fonts.push({ name: "Noto Sans JP", data, weight: 400, style: "normal" })
      }
      return h("div", {
        style: {
          display: "flex", flexDirection: "column", width: "100%", height: "100%",
          background: "#ffffff", color: "#222222", padding: "56px 64px",
          fontFamily: "Noto Sans JP", fontWeight: 400,
        },
      }, [
        h("div", { style: { display: "flex", fontSize: 24, color: "#777777", marginBottom: 36 } }, cfg.baseUrl || "mtateno.com"),
        h("div", { style: { display: "flex", fontSize: 56, lineHeight: 1.4, marginBottom: 28 } }, title.slice(0, 65)),
        h("div", { style: { display: "flex", fontSize: 28, color: "#5c5c5c", lineHeight: 1.6 } }, description.slice(0, 110)),
      ])
    },
  })
}

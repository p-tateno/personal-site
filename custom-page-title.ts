import type { QuartzTransformerPlugin } from "./quartz/plugins/types"

export const CustomPageTitle: QuartzTransformerPlugin = () => ({
  name: "CustomPageTitle",
  htmlPlugins() {
    return [() => (_tree, file) => {
      const metadata = file.data.frontmatter
      const pageTitle = metadata?.pageTitle
      if (metadata && typeof pageTitle === "string" && pageTitle.trim()) {
        metadata.title = pageTitle.trim()
      }
    }]
  },
})

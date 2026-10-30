import type { QuartzTransformerPlugin } from "./quartz/plugins/types"
import { resolveRelative } from "./quartz/util/path"
import type { FullSlug } from "./quartz/util/path"
import type { Root, Element } from "hast"

export const CustomArticleTags: QuartzTransformerPlugin = () => ({
  name: "CustomArticleTags",
  htmlPlugins() {
    return [() => (tree: Root, file) => {
      const tags = file.data.frontmatter?.tags
      const slug = file.data.slug
      if (!slug || !Array.isArray(tags) || tags.length === 0) return
      const unique = [...new Set(tags.filter((tag): tag is string => typeof tag === "string" && tag.length > 0))]
      if (!unique.length) return
      const list: Element = {
        type: "element", tagName: "ul", properties: { className: ["article-tags"], ariaLabel: "タグ" },
        children: unique.map(tag => ({
          type: "element", tagName: "li", properties: {}, children: [{
            type: "element", tagName: "a",
            properties: { className: ["internal", "tag-link"], href: resolveRelative(slug, `tags/${tag}` as FullSlug) },
            children: [{ type: "text", value: tag }],
          }],
        })),
      }
      tree.children.push(list)
    }]
  },
})

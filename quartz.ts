import { CustomSiteHeader } from "./custom-site-header"
import { CustomSidebarMenu } from "./custom-sidebar-menu"
import { CustomFolderIcons } from "./custom-folder-icons"
import { CustomSidebarPhoto } from "./custom-sidebar-photo"
import { CustomDateFormat } from "./custom-date-format"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

const config = await loadQuartzConfig()
config.plugins.transformers.push(CustomDateFormat(), CustomSidebarPhoto(), CustomFolderIcons(), CustomSidebarMenu(), CustomSiteHeader())
export default config
export const layout = await loadQuartzLayout()

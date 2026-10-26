import { CustomSidebarPhoto } from "./custom-sidebar-photo"
import { CustomDateFormat } from "./custom-date-format"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

const config = await loadQuartzConfig()
config.plugins.transformers.push(CustomDateFormat(), CustomSidebarPhoto())
export default config
export const layout = await loadQuartzLayout()

import {
  ElButton,
  ElContainer,
  ElHeader,
  ElAside,
  ElMain,
  ElRadioGroup,
  ElRadioButton,
  ElMenu,
  ElMenuItem,
  ElMenuItemGroup,
  ElSubmenu,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElTabs,
  ElTabPane,
  ElInput,
  ElRow,
  ElCol,
  ElTable,
  ElTableColumn,
  ElTag,
  ElPagination,
  ElDialog,
  ElForm,
  ElFormItem,
  ElPopconfirm,
  ElSelect,
  ElOption,
  ElTooltip
} from 'element-plus'
import lang from 'element-plus/lib/locale/lang/zh-cn'
import locale from 'element-plus/lib/locale'

export default app => {
  locale.use(lang)
  app.use(ElButton)
  app.use(ElContainer)
  app.use(ElHeader)
  app.use(ElAside)
  app.use(ElMain)
  app.use(ElRadioButton)
  app.use(ElRadioGroup)
  app.use(ElMenu)
  app.use(ElMenuItem)
  app.use(ElMenuItemGroup)
  app.use(ElSubmenu)
  app.use(ElBreadcrumb)
  app.use(ElBreadcrumbItem)
  app.use(ElTabs)
  app.use(ElTabPane)
  app.use(ElInput)
  app.use(ElRow)
  app.use(ElCol)
  app.use(ElTable)
  app.use(ElTableColumn)
  app.use(ElTag)
  app.use(ElPagination)
  app.use(ElDialog)
  app.use(ElForm)
  app.use(ElFormItem)
  app.use(ElPopconfirm)
  app.use(ElSelect)
  app.use(ElOption)
  app.use(ElTooltip)
}

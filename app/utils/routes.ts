export interface TabItem {
  path: string
  labelKey: string
  icon: string
  nested?: string[]
}

export const TAB_ITEMS: readonly TabItem[] = [
  { path: '/today', labelKey: 'tabbar.today', icon: 'i-lucide-sun', nested: ['/habits'] },
  { path: '/tasks', labelKey: 'tabbar.tasks', icon: 'i-lucide-list-todo' },
  { path: '/finance', labelKey: 'tabbar.finance', icon: 'i-lucide-wallet' },
  { path: '/settings', labelKey: 'tabbar.settings', icon: 'i-lucide-settings' }
]

export function isTabActive(tab: TabItem, path: string): boolean {
  return [tab.path, ...(tab.nested ?? [])].some(prefix => path.startsWith(prefix))
}

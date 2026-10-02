export interface LabelledCategory {
  name: string
  key?: string | null
}

export function categoryLabel(category: LabelledCategory, t: (key: string) => string): string {
  if (!category.key) return category.name

  const path = `categories.${category.key}`
  const translated = t(path)

  return translated === path ? category.name : translated
}

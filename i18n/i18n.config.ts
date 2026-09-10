import { russianPlural } from './pluralRules'

export default defineI18nConfig(() => ({
  legacy: false,
  pluralRules: {
    ru: russianPlural
  }
}))

// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    vue: true,
    typescript: true,
    stylistic: false,
    ignores: ['CLAUDE.md', 'DESIGN.md', 'design_handoff_myday/**']
  }),
  {
    rules: {
      'jsonc/sort-keys': 'off',
      'pnpm/yaml-enforce-settings': 'off'
    }
  }
)

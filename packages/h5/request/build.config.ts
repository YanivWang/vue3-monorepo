import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: false
  },
  externals: ['vant', '@vue3-mono/request', '@vue3-mono/utils', 'vue']
})

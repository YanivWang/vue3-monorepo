import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: false,
    inlineDependencies: false
  },
  externals: ['vue', 'vant', '@vue3-mono/hooks']
})

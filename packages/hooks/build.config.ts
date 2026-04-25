import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: false,
    inlineDependencies: false
  },
  externals: ['vue', 'vue-router', '@vueuse/core', '@vue3-mono/shared', '@vue3-mono/utils']
})

import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: false,
    inlineDependencies: false
  },
  externals: ['vue', 'element-plus', 'echarts', /^echarts\//, '@vue3-mono/hooks', '@vue3-mono/utils']
})

import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: false
  },
  externals: ['@vue3-mono/shared', 'dayjs', 'lodash-es', 'js-cookie', 'web-vitals', /^echarts($|\/)/]
})

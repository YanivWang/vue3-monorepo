/**
 * ECharts 按需引入封装
 * 集中注册常用图表 / 组件 / 渲染器，避免全量引入
 * 新增图表类型时在此补充 echarts.use([...]) 列表
 */
import * as echarts from 'echarts/core'

import { BarChart, LineChart, PieChart, RadarChart, ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  TitleComponent,
  MarkLineComponent,
  MarkPointComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  TitleComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer
])

export { echarts }
export type { EChartsOption } from 'echarts'

/**
 * ECharts 按需引入封装
 * 在此文件中统一注册所需组件，避免全量引入导致体积过大
 * 新增图表类型时在此补充对应组件的引入和注册
 */
import * as echarts from 'echarts/core'

// 图表类型
import { BarChart, LineChart, PieChart, RadarChart, ScatterChart } from 'echarts/charts'

// 组件
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

// 渲染器（CanvasRenderer 体积更小，SVGRenderer 适合导出）
import { CanvasRenderer } from 'echarts/renderers'

// 注册
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

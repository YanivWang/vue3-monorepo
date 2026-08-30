<script setup lang="ts">
import { onMounted, nextTick, useTemplateRef } from 'vue'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { useECharts } from '@/composables/useECharts'

// Vue 3.5+ 的模板引用写法：useTemplateRef('名字') 对应模板里的 ref="名字"。
// 不用「声明同名 ref 让它被隐式填充」那套——那种写法下变量在 script 里没有任何
// 显式使用，vue-tsc 3 会按 noUnusedLocals 判它未使用。
const lineEl = useTemplateRef<HTMLElement>('lineEl')
const barEl = useTemplateRef<HTMLElement>('barEl')
const pieEl = useTemplateRef<HTMLElement>('pieEl')
const radarEl = useTemplateRef<HTMLElement>('radarEl')

const { setOption: setLineOption } = useECharts(lineEl)
const { setOption: setBarOption } = useECharts(barEl)
const { setOption: setPieOption } = useECharts(pieEl)
const { setOption: setRadarOption } = useECharts(radarEl)

onMounted(async () => {
  // nextTick 确保容器元素已挂载、尺寸稳定
  await nextTick()

  // ── 折线图 ────────────────────────────────────────────────
  setLineOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['访问量', '注册量'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        areaStyle: { opacity: 0.1 },
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' },
          ],
        },
      },
      {
        name: '注册量',
        type: 'line',
        smooth: true,
        data: [120, 282, 191, 134, 290, 330, 310],
        areaStyle: { opacity: 0.1 },
      },
    ],
  })

  // ── 柱状图 ────────────────────────────────────────────────
  setBarOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {},
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: { type: 'value' },
    series: [
      { name: '直接访问', type: 'bar', data: [320, 332, 301, 334, 390, 330, 320], barMaxWidth: 40 },
      { name: '邮件营销', type: 'bar', data: [120, 132, 101, 134, 90, 230, 210], barMaxWidth: 40 },
      { name: '联盟广告', type: 'bar', data: [220, 182, 191, 234, 290, 330, 310], barMaxWidth: 40 },
    ],
  })

  // ── 饼图 ──────────────────────────────────────────────────
  setPieOption({
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '流量来源',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        data: [
          { value: 1048, name: '搜索引擎' },
          { value: 735, name: '直接访问' },
          { value: 580, name: '邮件营销' },
          { value: 484, name: '联盟广告' },
          { value: 300, name: '视频广告' },
        ],
      },
    ],
  })

  // ── 雷达图 ────────────────────────────────────────────────
  setRadarOption({
    tooltip: {},
    legend: { data: ['预算分配', '实际支出'] },
    radar: {
      indicator: [
        { name: '销售', max: 6500 },
        { name: '管理', max: 16000 },
        { name: '技术', max: 30000 },
        { name: '客服', max: 38000 },
        { name: '研发', max: 52000 },
        { name: '市场', max: 25000 },
      ],
    },
    series: [
      {
        name: '预算 vs 实际',
        type: 'radar',
        data: [
          { value: [4200, 3000, 20000, 35000, 50000, 18000], name: '预算分配' },
          { value: [5000, 14000, 28000, 26000, 42000, 21000], name: '实际支出' },
        ],
      },
    ],
  })
})
</script>

<template>
  <PageContainer title="图表示例" subtitle="基于 ECharts 按需引入，支持暗黑模式自动切换">
    <el-row :gutter="16">
      <!-- 折线图 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>折线图 — 访问趋势</span>
          </template>
          <div ref="lineEl" class="chart" />
        </el-card>
      </el-col>

      <!-- 柱状图 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>柱状图 — 周流量分布</span>
          </template>
          <div ref="barEl" class="chart" />
        </el-card>
      </el-col>

      <!-- 环形饼图 -->
      <el-col :xs="24" :lg="12" class="mt-md">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>饼图 — 流量来源</span>
          </template>
          <div ref="pieEl" class="chart" />
        </el-card>
      </el-col>

      <!-- 雷达图 -->
      <el-col :xs="24" :lg="12" class="mt-md">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>雷达图 — 部门预算对比</span>
          </template>
          <div ref="radarEl" class="chart" />
        </el-card>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<style lang="scss" scoped>
.chart-card {
  :deep(.el-card__header) {
    padding: $spacing-md;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-border-subtle);
  }
}

.chart {
  width: 100%;
  height: 300px;
}
</style>

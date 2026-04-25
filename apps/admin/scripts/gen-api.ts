/**
 * OpenAPI TypeScript 类型生成脚本
 *
 * 用法：
 *   pnpm run gen:api              # 从本地 openapi/api.yaml 生成
 *   pnpm run gen:api --remote     # 从远程 API 文档地址生成（需设置 OPENAPI_URL）
 *
 * 生成产物：src/types/api-schema.d.ts
 */
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import openapiTS, { astToString } from 'openapi-typescript'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')
const OUTPUT = resolve(ROOT, 'src/types/api-schema.d.ts')

const args = process.argv.slice(2)
const useRemote = args.includes('--remote')

async function generate() {
  const remoteUrl = process.env['OPENAPI_URL'] ?? ''
  let source: string | URL

  if (useRemote) {
    if (!remoteUrl) {
      console.error('❌  请设置环境变量 OPENAPI_URL，例如：')
      console.error('   OPENAPI_URL=https://api.your-domain.com/openapi.json pnpm run gen:api --remote')
      process.exit(1)
    }
    source = new URL(remoteUrl)
    console.log(`📡  从远程地址生成：${remoteUrl}`)
  } else {
    const localPath = resolve(ROOT, 'openapi/api.yaml')
    source = new URL(`file://${localPath}`)
    console.log(`📄  从本地 schema 生成：openapi/api.yaml`)
  }

  const ast = await openapiTS(source, {
    transform(schemaObject) {
      // 将 nullable: true 的字段转换为 T | null
      if ('nullable' in schemaObject && schemaObject.nullable) {
        return undefined
      }
    }
  })

  const content = [
    '/**',
    ' * ⚠️  此文件由 scripts/gen-api.ts 自动生成，请勿手动修改',
    ' * 修改 openapi/api.yaml 后执行 pnpm run gen:api 重新生成',
    ' */',
    '',
    astToString(ast)
  ].join('\n')

  writeFileSync(OUTPUT, content, 'utf-8')
  console.log(`✅  类型已生成：src/types/api-schema.d.ts`)

  // 输出统计信息
  const lines = content.split('\n').length
  console.log(`   共 ${lines} 行`)
}

generate().catch(err => {
  console.error('❌  生成失败：', err)
  process.exit(1)
})

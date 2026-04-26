import type { ResponseData, RequestConfig, NormalizedError } from './types'

export function isSuccessPayload<T>(data: unknown): data is ResponseData<T> {
  return typeof data === 'object' && data !== null && 'code' in data && 'data' in data
}

/** 指数退避延迟 */
export function retryDelay(times: number, baseDelay = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, times - 1)))
}

/** 创建统一的 NormalizedError */
export function createNormalizedError(message: string, init: Partial<NormalizedError> = {}): NormalizedError {
  const err = new Error(message) as NormalizedError
  Object.assign(err, init)
  return err
}

/** 生成请求唯一键 */
export function getRequestKey(config: RequestConfig): string {
  return config.requestKey ?? `${(config.method ?? 'get').toUpperCase()}:${config.url ?? ''}`
}

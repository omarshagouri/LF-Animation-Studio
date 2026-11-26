import type { ConfigContext } from 'expo/config'

export default function configure({ config }: ConfigContext) {
  const baseUrl = process.env.OMAR_WEB_BASE_PATH
  return {
    ...config,
    ...(baseUrl ? { experiments: { ...config.experiments, baseUrl } } : {}),
  }
}

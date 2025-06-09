import { WorkflowData } from '@/lib/types'
import api from '../api-client'

export async function getOrquestrationByMerchantId(
  merchantId: string,
): Promise<WorkflowData> {
  return await api.get(`orquestration/${merchantId}`).json<WorkflowData>()
}

import { WorkflowNodeData } from '@/lib/types'
import api from '../api-client'

export async function createOrquestration(
  requestData: WorkflowNodeData,
): Promise<void> {
  return await api
    .post(`orquestration`, {
      json: requestData,
    })
    .json<void>()
}

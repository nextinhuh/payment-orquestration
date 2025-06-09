import { WorkFlowListData } from '@/lib/types'
import api from '../api-client'

export async function getAllOrquestrations(): Promise<WorkFlowListData[]> {
  return await api.get(`orquestration`).json<WorkFlowListData[]>()
}

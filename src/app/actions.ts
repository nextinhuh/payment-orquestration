/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { WorkflowData, WorkFlowListData, WorkflowNodeData } from '@/lib/types'
import { createOrquestration } from '@/service/orquestration/create-orquestration'
import { getAllOrquestrations } from '@/service/orquestration/get-all-orquestrations'
import { getOrquestrationByMerchantId } from '@/service/orquestration/get-orquestration-by-merchant-id'
import { testOrquestration } from '@/service/orquestration/test-orquestration'
import { HTTPError } from 'ky'

export async function createOrquestrationAction(requestData: WorkflowNodeData) {
  try {
    await createOrquestration(requestData)
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()
      return { success: false, message, errors: null }
    }
    console.error('Erro ao cadastrar workflow', err)
    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos.',
      errors: null,
    }
  }
  return { success: true, message: null, errors: null }
}

export async function testOrquestrationTestAction(testData: {
  merchantId: string
  amount: string
  brand: string
  installments: string
}): Promise<{
  success: boolean
  message: string | null
  errors: any | null
  data: string[] | null
}> {
  try {
    const result = await testOrquestration(testData)
    return { success: true, message: null, errors: null, data: result }
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()
      return { success: false, message, errors: null, data: null }
    }
    console.error('Erro ao testar workflow', err)
    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos.',
      errors: null,
      data: null,
    }
  }
}

export async function getAllOrquestrationsAction(): Promise<{
  data: WorkFlowListData[] | null
  success: boolean
  message: string | null
  errors: any | null
}> {
  try {
    const response = await getAllOrquestrations()
    return { success: true, message: null, errors: null, data: response }
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()
      return { success: false, message, errors: null, data: null }
    }
    console.error('Erro ao buscar lista de workflows', err)
    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos.',
      errors: null,
      data: null,
    }
  }
}

export async function getOrquestrationByMerchantIdAction(
  merchantId: string,
): Promise<{
  data: WorkflowData | null
  success: boolean
  message: string | null
  errors: any | null
}> {
  try {
    const response = await getOrquestrationByMerchantId(merchantId)
    return { success: true, message: null, errors: null, data: response }
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()
      return { success: false, message, errors: null, data: null }
    }
    console.error('Erro ao buscar workflow', err)
    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos.',
      errors: null,
      data: null,
    }
  }
}

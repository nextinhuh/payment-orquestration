import api from '../api-client'

export async function testOrquestration(requestData: {
  merchantId: string
  amount: string
  brand: string
  installments: string
}): Promise<string[]> {
  return await api
    .post(`orquestration/${requestData.merchantId}/decode`, {
      json: {
        amount: requestData.amount,
        brand: requestData.brand,
        installments: requestData.installments,
      },
    })
    .json<string[]>()
}

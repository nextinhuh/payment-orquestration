'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { testOrquestrationTestAction } from '@/app/actions'

interface WorkflowTestProps {
  isOpen?: boolean
  merchantId: string
}

export interface WorkflowTestDialogRef {
  handleOpenDialog: () => void
  handleCloseDialog: () => void
}

export const WorkflowTestDialog = forwardRef<
  WorkflowTestDialogRef,
  WorkflowTestProps
>(({ isOpen = false, merchantId }: WorkflowTestProps, ref) => {
  const [open, setOpen] = useState<boolean>(isOpen)
  const [brand, setBrand] = useState<string>('MASTER')
  const [inputValue, setInputValue] = useState<string>('')
  const [inputInstallments, setInputInstallments] = useState<string>('')
  const [testResult, setTestResult] = useState<string[]>([])

  useImperativeHandle(ref, () => ({
    handleOpenDialog(): void {
      setOpen(true)
    },
    handleCloseDialog(): void {
      setOpen(false)
    },
  }))

  function handleCloseDialog(): void {
    setOpen(!open)
  }

  async function handleSentTestWorkflow(): Promise<void> {
    const result = await testOrquestrationTestAction({
      brand,
      merchantId,
      amount: inputValue,
      installments: inputInstallments,
    })

    if (result.success) {
      setTestResult(result.data || [])
    } else {
      console.error('Error testing workflow:', result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Teste o workflow atual</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-3 pt-2 border-t">
          <div className="flex gap-3">
            <div className="flex flex-col w-full gap-2">
              <Label htmlFor="operator" className="text-xs">
                Bandeira do cartão
              </Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger id="operator" className="h-7 text-xs">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="master" value="MASTER" className="text-xs">
                    MASTER
                  </SelectItem>
                  <SelectItem key="visa" value="VISA" className="text-xs">
                    VISA
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col w-full gap-2">
              <Label htmlFor="value" className="text-xs">
                Valor da transação
              </Label>
              <Input
                id="value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="h-9 text-xs"
                placeholder="Valor"
              />
            </div>
            <div className="flex flex-col w-full gap-2">
              <Label htmlFor="value" className="text-xs">
                Número de parcelas
              </Label>
              <Input
                id="value"
                value={inputInstallments}
                onChange={(e) => setInputInstallments(e.target.value)}
                className="h-9 text-xs"
                placeholder="Valor"
              />
            </div>
          </div>

          <div className="flex w-full items-center justify-end mt-8">
            <Button onClick={handleSentTestWorkflow}>Enviar</Button>
          </div>
        </div>

        {testResult.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Resultado do teste:</h3>
            <ul className="list-disc pl-5 mt-2">
              {testResult.map((item, index) => (
                <li key={index} className="text-xs text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
})

WorkflowTestDialog.displayName = 'WorkflowTestDialog'

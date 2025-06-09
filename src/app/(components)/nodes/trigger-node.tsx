'use client'

import type React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Node, NodeProps } from '@xyflow/react'

import '@xyflow/react/dist/style.css'
import AddNodeMenu from '../add-node-menu'
import { NodeTypeDefinition } from '@/lib/types'

export type InitialNodeProps = Node<
  {
    label: string
    icon: React.ReactNode
    color: string
    isStartNode?: boolean
    onDeleteNode: (nodeId: string) => void
    onAddNode?: (
      nodeType: NodeTypeDefinition,
      sourceNodeId: string,
      handleId?: string,
    ) => void
  } & NodeProps,
  'initial'
>

export default function TriggerNode({ id, data }: NodeProps<InitialNodeProps>) {
  const handleAddNode = (nodeType: NodeTypeDefinition) => {
    if (data.onAddNode) {
      data.onAddNode(nodeType, id)
    }
  }

  return (
    <Card className="hover:shadow-md ring-3 ring-green-500 p-3">
      <CardHeader className="p-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className={`p-1.5 rounded ${data.color} text-white relative`}>
            {data.icon}
            {data.isStartNode && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white" />
            )}
          </div>
          <div>{data.label}</div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        <div className="text-center">
          <div className="text-xs text-gray-500">
            Entrada do fluxo de pagamento
          </div>
        </div>
      </CardContent>

      <AddNodeMenu nodeId={id} handleAddNode={handleAddNode} />
    </Card>
  )
}

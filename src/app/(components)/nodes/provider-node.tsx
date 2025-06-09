'use client'

import type React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Trash2 } from 'lucide-react'
import { Handle, NodeProps, Position } from '@xyflow/react'

interface ProviderNodeData {
  label: string
  icon: React.ReactNode
  color: string
  [key: string]: unknown
}

interface ProviderNodeProps extends NodeProps {
  data: ProviderNodeData
  onDeleteNode: (nodeId: string) => void
}

export default function ProviderNode({
  data,
  selected,
  id,
  onDeleteNode,
}: ProviderNodeProps) {
  const handleDelete = () => {
    onDeleteNode(id)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          className={`w-48 transition-all ${selected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
        >
          <Handle
            type="target"
            position={Position.Left}
            id="input"
            className="w-3 h-3 bg-gray-400 border-2 border-white"
          />

          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className={`p-1.5 rounded ${data.color} text-white`}>
                {data.icon}
              </div>
              <div className="flex-1 min-w-0 truncate">{data.label}</div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-3 pt-0">
            <div className="text-center">
              <div className="text-xs text-gray-500">Payment Provider</div>
              <div className="text-xs text-gray-400 mt-1">
                Final destination
              </div>
            </div>
          </CardContent>
        </Card>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Node
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

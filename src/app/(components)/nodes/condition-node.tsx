'use client'

import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronRight, ChevronLeft, Equal, X, Trash2 } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { NodeProps, Position, Handle, Node, useReactFlow } from '@xyflow/react'
import AddNodeMenu from '../add-node-menu'
import { NodeTypeDefinition } from '@/lib/types'

type ConditionNodeProps = Node<
  {
    label: string
    icon: React.ReactNode
    color: string
    hasOperator?: boolean
    operatorOptions?: string[]
    operator?: string
    value?: string
    nodeType?: string
    onDeleteNode: (nodeId: string) => void
    onAddNode?: (
      nodeType: NodeTypeDefinition,
      sourceNodeId: string,
      handleId?: string,
    ) => void
  } & NodeProps,
  'condition'
>

export default function ConditionNode({
  id,
  data,
  selected,
}: NodeProps<ConditionNodeProps>) {
  const { updateNodeData, deleteElements, getEdges } = useReactFlow()
  const inputRef = useRef<HTMLInputElement>(null)
  const [operator, setOperator] = useState(data.operator || '=')
  const [inputValue, setInputValue] = useState(data.value || '')
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleAddNode = (nodeType: NodeTypeDefinition, handleId?: string) => {
    if (data.onAddNode) {
      data.onAddNode(nodeType, id, handleId)
    }
  }

  const getOperatorIcon = (op: string) => {
    switch (op) {
      case '>':
        return <ChevronRight className="w-4 h-4" />
      case '<':
        return <ChevronLeft className="w-4 h-4" />
      case '=':
        return <Equal className="w-4 h-4" />
      case '>=':
        return (
          <div className="flex items-center">
            <ChevronRight className="w-3 h-3" />
            <Equal className="w-3 h-3" />
          </div>
        )
      case '<=':
        return (
          <div className="flex items-center">
            <ChevronLeft className="w-3 h-3" />
            <Equal className="w-3 h-3" />
          </div>
        )
      case '!=':
        return (
          <div className="flex items-center">
            <Equal className="w-3 h-3" />
            <X className="w-3 h-3 text-red-500" />
          </div>
        )
      default:
        return <Equal className="w-4 h-4" />
    }
  }

  const handleDelete = useCallback(() => {
    const edges = getEdges()

    const elementsToDelete = {
      nodes: [] as { id: string }[],
      edges: [] as { id: string }[],
    }

    const findAllChildNodes = (nodeId: string): string[] => {
      const childNodes: string[] = []

      const outgoingEdges = edges.filter((edge) => edge.source === nodeId)

      outgoingEdges.forEach((edge) => {
        childNodes.push(edge.target)

        if (!elementsToDelete.edges.find((e) => e.id === edge.id)) {
          elementsToDelete.edges.push({ id: edge.id })
        }

        const grandChildren = findAllChildNodes(edge.target)
        childNodes.push(...grandChildren)
      })

      return childNodes
    }

    const incomingEdges = edges.filter((edge) => edge.target === id)
    incomingEdges.forEach((edge) => {
      elementsToDelete.edges.push({ id: edge.id })
    })

    const allChildNodeIds = findAllChildNodes(id)

    const uniqueChildNodeIds = [...new Set(allChildNodeIds)]
    uniqueChildNodeIds.forEach((childNodeId) => {
      if (!elementsToDelete.nodes.find((n) => n.id === childNodeId)) {
        elementsToDelete.nodes.push({ id: childNodeId })
      }
    })

    const childNodeSet = new Set(uniqueChildNodeIds)
    edges.forEach((edge) => {
      if (childNodeSet.has(edge.source) && childNodeSet.has(edge.target)) {
        if (!elementsToDelete.edges.find((e) => e.id === edge.id)) {
          elementsToDelete.edges.push({ id: edge.id })
        }
      }
    })

    elementsToDelete.nodes.push({ id })

    if (
      elementsToDelete.nodes.length > 0 ||
      elementsToDelete.edges.length > 0
    ) {
      deleteElements(elementsToDelete)
    }

    if (data.onDeleteNode) {
      data.onDeleteNode(id)
    }
  }, [data, getEdges, deleteElements, id])

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputValue(data.value || '')
    }
  }, [data.value])

  useEffect(() => {
    if (data.operator && data.operator !== operator) {
      setOperator(data.operator)
    }
  }, [data.operator, operator])

  function handleOperationChange(operation: string) {
    setOperator(operation)
    updateNodeData(id, { operator: operation })
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      updateNodeData(id, { value: newValue })
    }, 300)
  }

  const handleBlur = () => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    updateNodeData(id, { value: inputValue })
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
            id={`input-${id}`}
            style={{
              backgroundColor: 'transparent',
            }}
            isConnectable={false}
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
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full  flex items-center justify-center">
                  {getOperatorIcon(operator)}
                </div>
                <div className="text-sm font-medium">{data.value || '?'}</div>
              </div>

              {selected && (
                <div className="space-y-2 mt-3 pt-2 border-t">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`operator-${id}`} className="text-xs">
                        Operator
                      </Label>
                      <Select
                        value={operator}
                        onValueChange={handleOperationChange}
                      >
                        <SelectTrigger
                          id={`operator-${id}`}
                          className="h-7 text-xs"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.operatorOptions?.map((op) => (
                            <SelectItem key={op} value={op} className="text-xs">
                              {op}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`value-${id}`} className="text-xs">
                        Value
                      </Label>
                      <Input
                        id={`value-${id}`}
                        value={inputValue}
                        onChange={handleValueChange}
                        onBlur={handleBlur}
                        className="h-7 text-xs"
                        placeholder="Enter value"
                        ref={inputRef}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <AddNodeMenu
            nodeId={id}
            handleAddNode={handleAddNode}
            withTwoOptions
            firstHandleLabel="Condição Verdadeira"
            secondHandleLabel="Condição Falsa"
          />
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

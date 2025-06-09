'use client'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { nodeTypeDefinitions } from '@/lib/mocks/nodes-mock'
import { NodeTypeDefinition } from '@/lib/types'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { useCallback, useMemo, useState } from 'react'

interface AddNodeMenuProps {
  nodeId: string
  withTwoOptions?: boolean
  handleAddNode: (nodeType: NodeTypeDefinition, handleId?: string) => void
  firstHandleLabel?: string
  secondHandleLabel?: string
}

export default function AddNodeMenu({
  nodeId,
  handleAddNode,
  withTwoOptions = false,
  firstHandleLabel = 'Adicione o próximo nó',
  secondHandleLabel = 'Adicione o próximo nó',
}: AddNodeMenuProps) {
  const { getEdges } = useReactFlow()
  const firstHandleId = useMemo(() => `${nodeId}-handle-1`, [nodeId])
  const secondHandleId = useMemo(() => `${nodeId}-handle-2`, [nodeId])
  const [isHandleMenuOpen, setIsHandleMenuOpen] = useState(false)
  const [isHandleMenuOpen2, setIsHandleMenuOpen2] = useState(false)

  const checkHandleConnected = useCallback(
    (handleId?: string): boolean => {
      const edges = getEdges()
      if (handleId) {
        return edges.some(
          (edge) => edge.source === nodeId && edge.sourceHandle === handleId,
        )
      } else {
        return edges.some((edge) => edge.source === nodeId)
      }
    },
    [nodeId, getEdges],
  )

  const isFirstHandleConnected = useMemo(() => {
    if (withTwoOptions) {
      return checkHandleConnected(firstHandleId)
    } else {
      return checkHandleConnected()
    }
  }, [withTwoOptions, checkHandleConnected, firstHandleId])

  const isSecondHandleConnected = useMemo(() => {
    return withTwoOptions ? checkHandleConnected(secondHandleId) : false
  }, [withTwoOptions, checkHandleConnected, secondHandleId])

  return (
    <>
      {withTwoOptions ? (
        <>
          <Popover open={isHandleMenuOpen} onOpenChange={setIsHandleMenuOpen}>
            <PopoverTrigger asChild>
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-8 z-10">
                <Tooltip>
                  <TooltipTrigger>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={firstHandleId}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (!isFirstHandleConnected) {
                          setIsHandleMenuOpen(true)
                        }
                      }}
                      style={{
                        width: 62,
                        height: 62,
                        right: -13,
                        backgroundColor: isFirstHandleConnected
                          ? '#6b7280'
                          : '#059669',
                        cursor: isFirstHandleConnected
                          ? 'not-allowed'
                          : 'pointer',
                        opacity: isFirstHandleConnected ? 0.6 : 1,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="end"
                    sideOffset={10}
                    alignOffset={-2500}
                  >
                    <p className="text-lg">
                      {isFirstHandleConnected
                        ? 'Já conectado'
                        : firstHandleLabel}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              className="w-64 p-2 right-5"
              sideOffset={25}
            >
              <h3 className="text-md font-medium mb-2">{firstHandleLabel}</h3>
              <Separator className="mb-2 border-1" />
              <div className="space-y-1">
                {nodeTypeDefinitions
                  .filter((nodeDef) => {
                    return nodeDef.id !== 'initial'
                  })
                  .map((nodeDef) => (
                    <Button
                      key={nodeDef.id}
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => {
                        handleAddNode(nodeDef, firstHandleId)
                        setIsHandleMenuOpen(false)
                      }}
                    >
                      <div
                        className={`p-1 rounded ${nodeDef.color} text-white mr-2`}
                      >
                        {nodeDef.icon}
                      </div>
                      {nodeDef.label}
                    </Button>
                  ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={isHandleMenuOpen2} onOpenChange={setIsHandleMenuOpen2}>
            <PopoverTrigger asChild>
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 translate-y-8 z-10">
                <Tooltip>
                  <TooltipTrigger>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={secondHandleId}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (!isSecondHandleConnected) {
                          setIsHandleMenuOpen2(true)
                        }
                      }}
                      style={{
                        width: 62,
                        height: 62,
                        right: -13,
                        backgroundColor: isSecondHandleConnected
                          ? '#6b7280'
                          : '#db2777',
                        cursor: isSecondHandleConnected
                          ? 'not-allowed'
                          : 'pointer',
                        opacity: isSecondHandleConnected ? 0.6 : 1,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="end"
                    sideOffset={10}
                    alignOffset={-2500}
                  >
                    <p className="text-lg">
                      {isSecondHandleConnected
                        ? 'Já conectado'
                        : secondHandleLabel}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              className="w-64 p-2 right-5"
              sideOffset={25}
            >
              <h3 className="text-md font-medium mb-2">{secondHandleLabel}</h3>
              <Separator className="mb-2 border-1" />
              <div className="space-y-1">
                {nodeTypeDefinitions
                  .filter((nodeDef) => {
                    return nodeDef.id !== 'initial'
                  })
                  .map((nodeDef) => (
                    <Button
                      key={nodeDef.id}
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => {
                        handleAddNode(nodeDef, secondHandleId)
                        setIsHandleMenuOpen2(false)
                      }}
                    >
                      <div
                        className={`p-1 rounded ${nodeDef.color} text-white mr-2`}
                      >
                        {nodeDef.icon}
                      </div>
                      {nodeDef.label}
                    </Button>
                  ))}
              </div>
            </PopoverContent>
          </Popover>
        </>
      ) : (
        <Popover open={isHandleMenuOpen} onOpenChange={setIsHandleMenuOpen}>
          <PopoverTrigger asChild>
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 z-10">
              <Tooltip>
                <TooltipTrigger>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={firstHandleId}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      if (!isFirstHandleConnected) {
                        setIsHandleMenuOpen(true)
                      }
                    }}
                    style={{
                      width: 62,
                      height: 62,
                      right: -13,
                      backgroundColor: isFirstHandleConnected
                        ? '#6b7280'
                        : '#db2777',
                      cursor: isFirstHandleConnected
                        ? 'not-allowed'
                        : 'pointer',
                      opacity: isFirstHandleConnected ? 0.6 : 1,
                    }}
                    isConnectable={!isFirstHandleConnected}
                  />
                </TooltipTrigger>
                <TooltipContent side="right" align="end" sideOffset={25}>
                  <p className="text-lg">
                    {isFirstHandleConnected
                      ? 'Já conectado'
                      : 'Adicione o próximo nó'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            className="w-64 p-2 right-5"
            sideOffset={25}
          >
            <h3 className="text-md font-medium mb-2">Adicione o próximo nó</h3>
            <Separator className="mb-2 border-1" />
            <div className="space-y-1">
              {nodeTypeDefinitions
                .filter((nodeDef) => {
                  return nodeDef.id !== 'initial'
                })
                .map((nodeDef) => (
                  <Button
                    key={nodeDef.id}
                    variant="ghost"
                    className="w-full justify-start text-sm h-8"
                    onClick={() => {
                      handleAddNode(nodeDef, firstHandleId)
                      setIsHandleMenuOpen(false)
                    }}
                  >
                    <div
                      className={`p-1 rounded ${nodeDef.color} text-white mr-2`}
                    >
                      {nodeDef.icon}
                    </div>
                    {nodeDef.label}
                  </Button>
                ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  )
}

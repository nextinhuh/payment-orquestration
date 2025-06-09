'use client'

import type React from 'react'

import { EdgeProps, getBezierPath, Node } from '@xyflow/react'

interface CustomEdgeProps extends EdgeProps {
  onDeleteEdge: (edgeId: string) => void
  nodes: Node[]
}

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  onDeleteEdge,
}: CustomEdgeProps) {
  const strokeColor = '#db2777' // azul mais vibrante
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteEdge(id)
  }

  return (
    <>
      <path
        id={id}
        style={{ stroke: strokeColor, strokeWidth: 3 }}
        className="react-flow__edge-path"
        d={edgePath}
        onContextMenu={(e) => {
          e.preventDefault()
          handleDelete(e)
        }}
      />

      <circle cx={targetX} cy={targetY} r="5" fill={strokeColor} />
    </>
  )
}

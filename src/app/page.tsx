'use client'

import { ReactFlowProvider } from '@xyflow/react'
import Component from './(components)/workflow-builder'

export default function Home() {
  return (
    <ReactFlowProvider>
      <Component />
    </ReactFlowProvider>
  )
}

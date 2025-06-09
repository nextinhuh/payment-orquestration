/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  EdgeTypes,
  MarkerType,
  Node,
  NodeTypes,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { Play } from 'lucide-react'
import ConditionNode from './nodes/condition-node'
import TriggerNode from './nodes/trigger-node'
import ProviderNode from './nodes/provider-node'
import CustomEdge from './custom-edge'
import {
  FlowConditionNode,
  FlowItem,
  FlowProvider,
  NodeTypeDefinition,
  WorkFlowListData,
} from '@/lib/types'
import {
  createOrquestrationAction,
  getAllOrquestrationsAction,
} from '../actions'
import WorkflowList from './workflow-list'
import Header from '@/components/layout/header/header'
import { Button } from '@/components/ui/button'
import { nodeTypeDefinitions } from '@/lib/mocks/nodes-mock'
import {
  WorkflowTestDialog,
  WorkflowTestDialogRef,
} from '@/components/workflow-test-dialog'

export default function Component() {
  const initialEdges: Edge[] = []
  const initialNodes: Node[] = [
    {
      id: 'transaction-1',
      type: 'initial',
      position: { x: 150, y: 100 },
      data: {
        label: 'Início da transação',
        icon: <Play className="w-4 h-4" />,
        color: 'bg-green-500',
        nodeType: 'transaction',
        isStartNode: true,
        onDeleteNode: (nodeId: string) => deleteNode(nodeId),
      },
    },
  ]
  const reactFlowInstance = useReactFlow()
  const [workFlowList, setWorkFlowList] = useState<WorkFlowListData[]>([])
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeType, setSelectedNodeType] =
    useState<NodeTypeDefinition | null>(null)
  const [nodeIdCounter, setNodeIdCounter] = useState(1)
  const [workflowIdSelected, setWorkflowIdSelected] = useState<string>('')
  const workflowDialogRef = useRef<WorkflowTestDialogRef>(null)

  function handleOpenWorkflowTestDialog(): void {
    return workflowDialogRef.current?.handleOpenDialog()
  }

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      initial: (props) => (
        <TriggerNode
          {...props}
          data={{
            ...props.data,
            onAddNode: handleAddConnectedNode,
          }}
        />
      ),
      condition: (props) => (
        <ConditionNode
          {...props}
          data={{
            ...props.data,
            onDeleteNode: deleteNode,
            onAddNode: handleAddConnectedNode,
          }}
        />
      ),
      provider: (props) => (
        <ProviderNode {...props} onDeleteNode={deleteNode} />
      ),
    }),
    [nodes, edges],
  )

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      custom: (props) => (
        <CustomEdge {...props} onDeleteEdge={deleteEdge} nodes={nodes} />
      ),
    }),
    [nodes],
  )

  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'default',
        deletable: true,
        selected: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10,
        },
      }
      setEdges((eds) => addEdge(edge, eds))
    },
    [setEdges],
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      )
    },
    [setNodes, setEdges],
  )

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId))
    },
    [setEdges],
  )

  const isPositionOccupied = useCallback(
    (
      position: { x: number; y: number },
      nodeWidth = 200,
      nodeHeight = 120,
      minDistance = 50,
    ) => {
      return nodes.some((node) => {
        const dx = Math.abs(node.position.x - position.x)
        const dy = Math.abs(node.position.y - position.y)
        return dx < nodeWidth + minDistance && dy < nodeHeight + minDistance
      })
    },
    [nodes],
  )

  const findBestPosition = useCallback(
    (basePosition: { x: number; y: number }, handleType?: string) => {
      const nodeWidth = 200
      const nodeHeight = 120
      const horizontalSpacing = 350
      const verticalSpacing = 150

      // Posições candidatas baseadas no tipo de handle
      const candidatePositions = []

      if (handleType?.includes('handle-1')) {
        // Handle superior - prioriza posições acima
        candidatePositions.push(
          {
            x: basePosition.x + horizontalSpacing,
            y: basePosition.y - verticalSpacing,
          },
          { x: basePosition.x + horizontalSpacing, y: basePosition.y },
          {
            x: basePosition.x + horizontalSpacing,
            y: basePosition.y + verticalSpacing,
          },
          {
            x: basePosition.x + horizontalSpacing * 1.5,
            y: basePosition.y - verticalSpacing,
          },
          { x: basePosition.x + horizontalSpacing * 1.5, y: basePosition.y },
        )
      } else if (handleType?.includes('handle-2')) {
        // Handle inferior - prioriza posições abaixo
        candidatePositions.push(
          {
            x: basePosition.x + horizontalSpacing,
            y: basePosition.y + verticalSpacing,
          },
          { x: basePosition.x + horizontalSpacing, y: basePosition.y },
          {
            x: basePosition.x + horizontalSpacing,
            y: basePosition.y - verticalSpacing,
          },
          {
            x: basePosition.x + horizontalSpacing * 1.5,
            y: basePosition.y + verticalSpacing,
          },
          { x: basePosition.x + horizontalSpacing * 1.5, y: basePosition.y },
        )
      } else {
        // Handle único - posicionamento padrão
        candidatePositions.push(
          { x: basePosition.x + horizontalSpacing, y: basePosition.y },
          {
            x: basePosition.x + horizontalSpacing,
            y: basePosition.y - verticalSpacing,
          },
          {
            x: basePosition.x + horizontalSpacing,
            y: basePosition.y + verticalSpacing,
          },
          { x: basePosition.x + horizontalSpacing * 1.5, y: basePosition.y },
        )
      }

      // Encontra a primeira posição livre
      for (const position of candidatePositions) {
        if (!isPositionOccupied(position, nodeWidth, nodeHeight)) {
          return position
        }
      }

      // Se nenhuma posição candidata estiver livre, usa um algoritmo de espiral
      let radius = horizontalSpacing
      let angle = 0
      const angleStep = Math.PI / 4 // 45 graus

      for (let i = 0; i < 16; i++) {
        const spiralPosition = {
          x: basePosition.x + Math.cos(angle) * radius,
          y: basePosition.y + Math.sin(angle) * radius,
        }

        if (!isPositionOccupied(spiralPosition, nodeWidth, nodeHeight)) {
          return spiralPosition
        }

        angle += angleStep
        if (angle >= 2 * Math.PI) {
          angle = 0
          radius += horizontalSpacing * 0.5
        }
      }

      // Fallback: posição original com offset aleatório
      return {
        x: basePosition.x + horizontalSpacing + Math.random() * 100,
        y: basePosition.y + (Math.random() - 0.5) * 200,
      }
    },
    [isPositionOccupied],
  )

  const autoLayout = useCallback(() => {
    const layoutNodes = [...nodes]
    const startNode = layoutNodes.find((node) => node.data.isStartNode)

    if (!startNode) return

    // Configurações de layout
    const horizontalSpacing = 350
    const verticalSpacing = 250
    const nodeSpacing = 80 // Espaçamento entre nós na mesma linha/nível
    const startX = 150
    const startY = 300

    // Estrutura para mapear nós
    const nodePositions = new Map<
      string,
      { x: number; y: number; level: number; line: number }
    >()

    // Controle das linhas falsas - linha 0 é sempre verdadeira
    let nextFalseLine = 1

    // Posicionar o nó inicial na linha 0 (linha verdadeira principal)
    nodePositions.set(startNode.id, { x: startX, y: startY, level: 0, line: 0 })

    // Função para obter próxima posição Y baseada na linha
    const getYPositionForLine = (line: number): number => {
      if (line === 0) {
        // Linha verdadeira (principal) - sempre na mesma altura
        return startY
      } else {
        // Linhas falsas - cada uma abaixo da anterior
        return startY + line * verticalSpacing
      }
    }

    // Função para obter próxima posição X no mesmo nível/linha
    const getNextXPosition = (line: number, level: number): number => {
      // Contar quantos nós já existem nesta linha e nível
      const nodesInSameLevelAndLine = Array.from(nodePositions.values()).filter(
        (pos) => pos.level === level && pos.line === line,
      )

      const baseX = startX + level * horizontalSpacing
      return baseX + nodesInSameLevelAndLine.length * 50 // Pequeno offset horizontal se necessário
    }

    // Função para verificar se há sobreposição
    const hasOverlap = (
      pos1: { x: number; y: number },
      pos2: { x: number; y: number },
    ): boolean => {
      const minDistanceX = 220 // largura do nó + margem
      const minDistanceY = 140 // altura do nó + margem

      const dx = Math.abs(pos1.x - pos2.x)
      const dy = Math.abs(pos1.y - pos2.y)

      return dx < minDistanceX && dy < minDistanceY
    }

    // Função para ajustar posições e evitar sobreposição
    const adjustForOverlap = (
      newPos: { x: number; y: number },
      level: number,
      line: number,
    ): { x: number; y: number } => {
      const adjustedPos = { ...newPos }
      let attempts = 0
      const maxAttempts = 10

      while (attempts < maxAttempts) {
        let hasConflict = false

        // Verificar conflito com todas as posições existentes
        for (const [, existingPos] of nodePositions.entries()) {
          if (hasOverlap(adjustedPos, existingPos)) {
            hasConflict = true

            // Estratégia de ajuste baseada na situação
            if (existingPos.level === level && existingPos.line === line) {
              // Mesmo nível e linha: mover verticalmente um pouco
              adjustedPos.y += nodeSpacing
            } else if (existingPos.level === level) {
              // Mesmo nível, linha diferente: mover horizontalmente
              adjustedPos.x += 50
            } else {
              // Nível diferente: ajuste mínimo
              adjustedPos.y += 30
            }
            break
          }
        }

        if (!hasConflict) break
        attempts++
      }

      return adjustedPos
    }

    // Função recursiva para posicionar nós
    const positionNodesRecursively = (
      nodeId: string,
      level: number,
      currentLine: number,
    ) => {
      const outgoingEdges = edges.filter((edge) => edge.source === nodeId)

      // Separar edges por tipo de handle
      const trueEdges = outgoingEdges.filter(
        (edge) => edge.sourceHandle?.includes('handle-1') || !edge.sourceHandle,
      )
      const falseEdges = outgoingEdges.filter((edge) =>
        edge.sourceHandle?.includes('handle-2'),
      )

      // Posicionar nós verdadeiros (SEMPRE continuam na mesma linha)
      trueEdges.forEach((edge) => {
        if (!nodePositions.has(edge.target)) {
          const basePos = {
            x: getNextXPosition(currentLine, level + 1),
            y: getYPositionForLine(currentLine),
          }

          const adjustedPos = adjustForOverlap(basePos, level + 1, currentLine)

          nodePositions.set(edge.target, {
            x: adjustedPos.x,
            y: adjustedPos.y,
            level: level + 1,
            line: currentLine, // Mantém a mesma linha
          })

          // Continua recursivamente na mesma linha
          positionNodesRecursively(edge.target, level + 1, currentLine)
        }
      })

      // Posicionar nós falsos (SEMPRE criam nova linha abaixo)
      falseEdges.forEach((edge) => {
        if (!nodePositions.has(edge.target)) {
          // Sempre cria uma nova linha falsa
          const targetLine = nextFalseLine++

          const basePos = {
            x: getNextXPosition(targetLine, level + 1),
            y: getYPositionForLine(targetLine),
          }

          const adjustedPos = adjustForOverlap(basePos, level + 1, targetLine)

          nodePositions.set(edge.target, {
            x: adjustedPos.x,
            y: adjustedPos.y,
            level: level + 1,
            line: targetLine, // Nova linha falsa
          })

          // Continua recursivamente na nova linha falsa
          positionNodesRecursively(edge.target, level + 1, targetLine)
        }
      })
    }

    // Iniciar o posicionamento recursivo
    positionNodesRecursively(startNode.id, 0, 0)

    // Ajuste final para garantir que não há sobreposições
    const finalAdjustment = () => {
      const positions = Array.from(nodePositions.entries())

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const [, pos1] = positions[i]
          const [, pos2] = positions[j]

          if (hasOverlap(pos1, pos2)) {
            // Ajustar o nó com maior nível (mais à direita)
            if (pos2.level >= pos1.level) {
              if (pos2.line === pos1.line) {
                // Mesma linha: ajustar verticalmente
                pos2.y += nodeSpacing
              } else {
                // Linhas diferentes: ajustar horizontalmente
                pos2.x += 30
              }
            } else {
              if (pos1.line === pos2.line) {
                // Mesma linha: ajustar verticalmente
                pos1.y += nodeSpacing
              } else {
                // Linhas diferentes: ajustar horizontalmente
                pos1.x += 30
              }
            }
          }
        }
      }
    }

    finalAdjustment()

    // Aplicar as novas posições aos nós
    const newNodes = layoutNodes.map((node) => {
      const position = nodePositions.get(node.id)
      if (position) {
        return {
          ...node,
          position: { x: position.x, y: position.y },
        }
      }

      // Fallback para nós não conectados
      const unconnectedIndex = layoutNodes.findIndex((n) => n.id === node.id)
      return {
        ...node,
        position: {
          x: startX + Math.floor(unconnectedIndex / 5) * horizontalSpacing,
          y:
            startY +
            (nextFalseLine + 1) * verticalSpacing +
            (unconnectedIndex % 5) * 100,
        },
      }
    })

    setNodes(newNodes)
  }, [nodes, edges, setNodes])

  function handleAddConnectedNode(
    nodeType: NodeTypeDefinition,
    sourceNodeId: string,
    handleId?: string,
  ) {
    const sourceNode = nodes.find((node) => node.id === sourceNodeId)
    if (!sourceNode) return

    // Verifica se o handle já está conectado
    const existingConnection = edges.find(
      (edge) => edge.source === sourceNodeId && edge.sourceHandle === handleId,
    )

    if (existingConnection) {
      return
    }

    // Calcula posição base
    let baseYOffset = 0
    if (handleId?.includes('handle-1')) {
      baseYOffset = -100 // Handle superior
    } else if (handleId?.includes('handle-2')) {
      baseYOffset = 100 // Handle inferior
    }

    const basePosition = {
      x: sourceNode.position.x,
      y: sourceNode.position.y + baseYOffset,
    }

    // Encontra a melhor posição disponível
    const position = findBestPosition(basePosition, handleId)

    const newNodeId = `${nodeType.id}-${nodeIdCounter}`
    const newNode: Node = {
      id: newNodeId,
      type: nodeType.type,
      position,
      data: {
        label: nodeType.label,
        icon: nodeType.icon,
        color: nodeType.color,
        nodeType: nodeType.id,
        hasOperator: nodeType.hasOperator,
        operatorOptions: nodeType.operatorOptions,
        operator: nodeType.hasOperator ? '=' : undefined,
        value: nodeType.defaultValue || '',
        onDeleteNode: deleteNode,
        onAddNode: handleAddConnectedNode,
      },
    }

    setNodes((nds) => nds.concat(newNode))
    setNodeIdCounter((counter) => counter + 1)

    // Cria a conexão
    const newEdge: Edge = {
      id: `edge-${sourceNodeId}-${newNodeId}-${Date.now()}`,
      source: sourceNodeId,
      target: newNodeId,
      sourceHandle: handleId,
      type: 'custom',
      data: {
        handleType: handleId?.includes('handle-1') ? 'primary' : 'secondary',
        label: getHandleLabelByType(sourceNode.id, handleId),
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 10,
        height: 10,
      },
    }

    setEdges((eds) => eds.concat(newEdge))
    setTimeout(() => {
      reactFlowInstance.fitView({
        padding: 50,
        duration: 500,
        minZoom: 0.3,
        maxZoom: 1.5,
      })
    }, 100)
  }

  const addNode = useCallback(
    (nodeTypeDef: NodeTypeDefinition, position: { x: number; y: number }) => {
      const newNode: Node = {
        id: `${nodeTypeDef.id}-${nodeIdCounter}`,
        type: nodeTypeDef.type,
        position,
        data: {
          label: nodeTypeDef.label,
          icon: nodeTypeDef.icon,
          color: nodeTypeDef.color,
          nodeType: nodeTypeDef.id,
          hasOperator: nodeTypeDef.hasOperator,
          operatorOptions: nodeTypeDef.operatorOptions,
          operator: nodeTypeDef.hasOperator ? '=' : undefined,
          value: '',
          isStartNode: nodes.length === 0 && nodeTypeDef.type === 'initial',
        },
      }

      setNodes((nds) => nds.concat(newNode))
      setNodeIdCounter((counter) => counter + 1)
    },
    [nodes.length, nodeIdCounter, setNodes],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!selectedNodeType) return

      const reactFlowBounds = (event.target as Element).getBoundingClientRect()
      const { zoom, x: panX, y: panY } = reactFlowInstance.getViewport()
      const position = {
        x: (event.clientX - reactFlowBounds.left) / zoom - panX / zoom,
        y: (event.clientY - reactFlowBounds.top) / zoom - panY / zoom,
      }

      addNode(selectedNodeType, position)
      setSelectedNodeType(null)
    },
    [selectedNodeType, addNode],
  )

  const generateWorkflowRules = (name: string, description: string) => {
    const startNode = nodes.find((node) => node.data.isStartNode)
    if (!startNode) return null

    // Função para mapear operadores do frontend para o backend
    const mapOperator = (operator: string): string => {
      const operatorMap: { [key: string]: string } = {
        '=': 'EQUALS',
        '!=': 'NOT_EQUALS',
        '>': 'GREATER_THAN',
        '>=': 'GREATER_THAN_OR_EQUAL_TO',
        '<': 'LESS_THAN',
        '<=': 'LESS_THAN_OR_EQUAL_TO',
        in: 'IN',
        not_in: 'NOT_IN',
        contains: 'CONTAINS',
        not_contains: 'NOT_CONTAINS',
      }
      return operatorMap[operator] || 'EQUALS'
    }

    // Função para mapear tipos de nós do frontend para o backend
    const mapNodeType = (nodeType: string): string => {
      const typeMap: { [key: string]: string } = {
        amount: 'AMOUNT',
        brand: 'BRAND',
        installments: 'INSTALLMENT',
        metadata: 'METADATA',
        paymentMethod: 'PAYMENT_METHOD',
        country: 'COUNTRY',
        currency: 'CURRENCY',
        card: 'BRAND',
      }
      return typeMap[nodeType] || nodeType.toUpperCase()
    }

    // Função recursiva para construir o fluxo
    const buildFlow = (nodeId: string): any[] => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return []

      const outgoingEdges = edges.filter((edge) => edge.source === nodeId)

      // Se for um nó provider (final), retorna apenas o provider
      if (node.type === 'provider') {
        return [
          {
            typeFlow: 'PROVIDER',
            providerName: node.data.value || node.data.label,
          },
        ]
      }

      // Se for um nó de condição
      if (node.type === 'condition') {
        // Separar edges por tipo de handle
        const trueEdges = outgoingEdges.filter(
          (edge) =>
            edge.sourceHandle?.includes('handle-1') || !edge.sourceHandle,
        )
        const falseEdges = outgoingEdges.filter((edge) =>
          edge.sourceHandle?.includes('handle-2'),
        )

        const flowItem: any = {
          typeFlow: 'CONDITION',
          condition: {
            field: mapNodeType(node.data.nodeType as string),
            operator: mapOperator((node.data.operator as string) || '='),
            value: node.data.value || '',
          },
        }

        // Construir trueFlow recursivamente
        if (trueEdges.length > 0) {
          const trueFlow: any[] = []
          trueEdges.forEach((edge) => {
            const childFlow = buildFlow(edge.target)
            trueFlow.push(...childFlow)
          })
          if (trueFlow.length > 0) {
            flowItem.trueFlow = trueFlow
          }
        }

        // Construir falseFlow recursivamente
        if (falseEdges.length > 0) {
          const falseFlow: any[] = []
          falseEdges.forEach((edge) => {
            const childFlow = buildFlow(edge.target)
            falseFlow.push(...childFlow)
          })
          if (falseFlow.length > 0) {
            flowItem.falseFlow = falseFlow
          }
        }

        return [flowItem]
      }

      // Para outros tipos de nós (como nó inicial), continuar para os próximos nós
      const nextFlow: any[] = []
      outgoingEdges.forEach((edge) => {
        const childFlow = buildFlow(edge.target)
        nextFlow.push(...childFlow)
      })

      return nextFlow
    }

    // Construir o payload completo
    const flow = buildFlow(startNode.id)

    return {
      name,
      description,
      flow,
    }
  }

  async function exportWorkflowJSON(
    name: string = 'Payment Gateway Flow',
    description: string = 'Generated payment gateway flow',
  ) {
    const workflowData = generateWorkflowRules(name, description)

    if (!workflowData) {
      console.error(
        'Não foi possível gerar o workflow - nó inicial não encontrado',
      )
      return
    }

    const result = await createOrquestrationAction({
      name: workflowData.name,
      description: workflowData.description,
      flow: workflowData.flow,
      decisionType: 'BTREE',
    })

    if (result.success) {
      alert('Workflow exportado com sucesso!')
    } else {
      alert(
        `Erro ao exportar workflow: ${result.message || 'Erro desconhecido'}`,
      )
    }

    /* const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'payment-gateway-flow.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url) */
  }

  const handleExportFlow = () => {
    // Aqui você pode abrir um modal para coletar nome e descrição
    const name =
      prompt('Nome do fluxo:', 'Payment Gateway Flow') || 'Payment Gateway Flow'
    const description =
      prompt('Descrição do fluxo:', 'Generated payment gateway flow') ||
      'Generated payment gateway flow'

    exportWorkflowJSON(name, description)
  }

  function getHandleLabelByType(nodeType: string, handleId?: string): string {
    if (!handleId) return ''

    switch (nodeType) {
      case 'condition':
        return handleId.includes('handle-1') ? 'Verdadeiro' : 'Falso'
      case 'amount':
        return handleId.includes('handle-1')
          ? 'Dentro do limite'
          : 'Acima do limite'
      case 'paymentMethod':
        return handleId.includes('handle-1') ? 'Cartão' : 'PIX/Boleto'
      default:
        return handleId.includes('handle-1') ? 'Opção A' : 'Opção B'
    }
  }

  useEffect(() => {
    handleGetAllWorkflows()
  }, [])

  // Hook para ajustar visualização quando nós mudarem
  useEffect(() => {
    if (nodes.length > 1) {
      // Aguardar um pouco para garantir que os nós foram renderizados
      const timer = setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.5,
          duration: 2000,
          includeHiddenNodes: false,
        })
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [nodes.length, reactFlowInstance])

  async function handleGetAllWorkflows() {
    const result = await getAllOrquestrationsAction()

    if (result.success && result.data) {
      setWorkFlowList(result.data)
    }
  }

  const loadWorkflowFromData = useCallback(
    (workflowData: WorkFlowListData) => {
      setWorkflowIdSelected(String(workflowData.merchantCode))
      const newNodes: Node[] = []
      const newEdges: Edge[] = []

      // Configurações de layout
      const horizontalSpacing = 350
      const verticalSpacing = 200
      const startX = 150
      const startY = 300

      // Contadores para IDs únicos
      let nodeIdCounter = 1
      let edgeIdCounter = 1
      let nextFalseLine = 1

      // Buscar definição do nó inicial no mock
      const initialNodeDef = nodeTypeDefinitions.find(
        (def) => def.id === 'initial',
      )

      // Criar nó inicial baseado no mock
      const startNodeId = `start-${nodeIdCounter++}`
      newNodes.push({
        id: startNodeId,
        type: initialNodeDef?.type || 'initial',
        position: { x: startX, y: startY },
        data: {
          label: initialNodeDef?.label || 'Início da transação',
          icon: initialNodeDef?.icon,
          color: initialNodeDef?.color || 'bg-green-500',
          nodeType: initialNodeDef?.id || 'initial',
          description: initialNodeDef?.description,
          category: initialNodeDef?.category,
          isStartNode: true,
          onDeleteNode: deleteNode,
          onAddNode: handleAddConnectedNode,
        },
      })

      // Mapeamento de tipos de campo do backend para IDs no mock
      const mapFieldToNodeId = (field: string): string => {
        const fieldMap: { [key: string]: string } = {
          AMOUNT: 'amount',
          BRAND: 'card',
          INSTALLMENT: 'installments',
          METADATA: 'metadata',
          PAYMENT_METHOD: 'paymentMethod',
          COUNTRY: 'country',
          CURRENCY: 'currency',
        }
        return fieldMap[field] || 'amount'
      }

      // Mapeamento de operadores do backend para frontend
      const mapOperatorFromBackend = (operator: string): string => {
        const operatorMap: { [key: string]: string } = {
          EQUALS: '=',
          NOT_EQUALS: '!=',
          GREATER_THAN: '>',
          GREATER_THAN_OR_EQUAL_TO: '>=',
          LESS_THAN: '<',
          LESS_THAN_OR_EQUAL_TO: '<=',
          IN: 'in',
          NOT_IN: 'not_in',
          CONTAINS: 'contains',
          NOT_CONTAINS: 'not_contains',
        }
        return operatorMap[operator] || '='
      }

      // Buscar definição de provider por nome
      const findProviderDefinition = (providerName: string) => {
        return nodeTypeDefinitions.find(
          (def) =>
            def.type === 'provider' &&
            (def.defaultValue === providerName ||
              def.label.includes(providerName)),
        )
      }

      // Estrutura para controlar posicionamento
      const nodePositions = new Map<
        string,
        {
          x: number
          y: number
          level: number
          line: number
          isTrue: boolean
        }
      >()

      // Função para calcular posição Y baseada na linha
      const calculateYPosition = (line: number): number => {
        if (line === 0) {
          return startY
        } else {
          return startY + line * verticalSpacing
        }
      }

      // Função para calcular posição X baseada no nível
      const calculateXPosition = (
        level: number,
        line: number,
        isTrue: boolean,
      ): number => {
        const existingNodes = Array.from(nodePositions.values()).filter(
          (pos) =>
            pos.level === level && pos.line === line && pos.isTrue === isTrue,
        )

        const baseX = startX + level * horizontalSpacing
        const offset = existingNodes.length * 80

        return baseX + offset
      }

      // Função para criar edge com validação
      const createEdge = (
        sourceNodeId: string,
        targetNodeId: string,
        isFromTrueFlow: boolean,
        sourceNodeType: string,
      ): Edge => {
        const edgeId = `edge-${edgeIdCounter++}`

        // Definir handles baseado no tipo do nó de origem
        let sourceHandle: string | undefined

        if (sourceNodeType === 'initial') {
          // Nó inicial não precisa de handle específico
          sourceHandle = undefined
        } else {
          // Nós de condição usam handles específicos
          sourceHandle = isFromTrueFlow
            ? `${sourceNodeId}-handle-1`
            : `${sourceNodeId}-handle-2`
        }

        const edge: Edge = {
          id: edgeId,
          source: sourceNodeId,
          target: targetNodeId,
          sourceHandle,
          type: 'custom',
          animated: false,
          data: {
            handleType: isFromTrueFlow ? 'primary' : 'secondary',
            label: isFromTrueFlow ? 'Verdadeiro' : 'Falso',
          },
          style: {
            stroke: isFromTrueFlow ? '#10b981' : '#ef4444',
            strokeWidth: 3,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 12,
            height: 12,
            color: isFromTrueFlow ? '#10b981' : '#ef4444',
          },
        }
        return edge
      }

      // Função recursiva principal para construir nós e arestas
      const buildNodesFromFlow = (
        flowItems: FlowItem[],
        parentNodeId: string,
        level: number,
        line: number,
        isFromTrueFlow: boolean = true,
      ): void => {
        flowItems.forEach((flowItem) => {
          if (flowItem.typeFlow === 'CONDITION') {
            const conditionNode = flowItem as FlowConditionNode
            const nodeId = `condition-${nodeIdCounter++}`

            // Buscar definição no mock baseado no campo
            const mockNodeId = mapFieldToNodeId(conditionNode.condition.field)
            const nodeDef = nodeTypeDefinitions.find(
              (def) => def.id === mockNodeId,
            )

            if (!nodeDef) {
              return
            }

            // Calcular posição
            const yPosition = calculateYPosition(line)
            const xPosition = calculateXPosition(level, line, isFromTrueFlow)

            // Criar nó de condição baseado no mock + dados do backend
            const conditionNodeData: Node = {
              id: nodeId,
              type: nodeDef.type,
              position: { x: xPosition, y: yPosition },
              data: {
                // Dados do mock
                label: nodeDef.label,
                icon: nodeDef.icon,
                color: nodeDef.color,
                description: nodeDef.description,
                category: nodeDef.category,
                hasOperator: nodeDef.hasOperator,
                operatorOptions: nodeDef.operatorOptions,

                // Dados do backend
                nodeType: nodeDef.id,
                operator: mapOperatorFromBackend(
                  conditionNode.condition.operator,
                ),
                value: conditionNode.condition.value,

                // Callbacks
                onDeleteNode: deleteNode,
                onAddNode: handleAddConnectedNode,
              },
            }

            newNodes.push(conditionNodeData)

            // Registrar posição
            nodePositions.set(nodeId, {
              x: xPosition,
              y: yPosition,
              level,
              line,
              isTrue: isFromTrueFlow,
            })

            // *** CORREÇÃO: BUSCAR TIPO DO NÓ PAI CORRETAMENTE ***
            if (parentNodeId) {
              // IMPORTANTE: Buscar no array completo de nós, não apenas nos recém-criados
              const parentNode = newNodes.find((n) => n.id === parentNodeId)
              let parentNodeType = 'unknown'

              if (parentNode) {
                parentNodeType = String(parentNode.type)
              } else if (parentNodeId === startNodeId) {
                parentNodeType = 'initial'
              }

              const edge = createEdge(
                parentNodeId,
                nodeId,
                isFromTrueFlow,
                parentNodeType,
              )
              newEdges.push(edge)
            }

            // Processar recursivamente fluxo verdadeiro (mesma linha)
            if (conditionNode.trueFlow && conditionNode.trueFlow.length > 0) {
              buildNodesFromFlow(
                conditionNode.trueFlow,
                nodeId, // IMPORTANTE: Este nó será o pai dos próximos
                level + 1,
                line, // Mantém a mesma linha
                true,
              )
            }

            // Processar recursivamente fluxo falso (nova linha)
            if (conditionNode.falseFlow && conditionNode.falseFlow.length > 0) {
              const falseLine = nextFalseLine++
              buildNodesFromFlow(
                conditionNode.falseFlow,
                nodeId, // IMPORTANTE: Este nó será o pai dos próximos
                level + 1,
                falseLine, // Nova linha
                false,
              )
            }
          } else if (flowItem.typeFlow === 'PROVIDER') {
            const providerNode = flowItem as FlowProvider
            const nodeId = `provider-${nodeIdCounter++}`

            // Buscar definição do provider no mock
            const providerDef = findProviderDefinition(
              providerNode.providerName,
            )

            // Calcular posição para provider
            const yPosition = calculateYPosition(line)
            const xPosition = calculateXPosition(level, line, isFromTrueFlow)

            // Ajustar posição Y se houver múltiplos providers na mesma posição
            const samePositionProviders = Array.from(
              nodePositions.values(),
            ).filter(
              (pos) =>
                pos.level === level &&
                pos.line === line &&
                pos.isTrue === isFromTrueFlow,
            )
            const yOffset = samePositionProviders.length * 90
            const finalYPosition = yPosition + yOffset

            // Criar nó provider baseado no mock + dados do backend
            const providerNodeData: Node = {
              id: nodeId,
              type: 'provider',
              position: { x: xPosition, y: finalYPosition },
              data: {
                // Dados do mock (se encontrado)
                label:
                  providerDef?.label || `Provedor ${providerNode.providerName}`,
                icon: providerDef?.icon,
                color: providerDef?.color || 'bg-gray-600',
                description:
                  providerDef?.description ||
                  `Provedor de pagamento ${providerNode.providerName}`,
                category: 'provider',

                // Dados do backend
                value: providerNode.providerName,
                defaultValue: providerNode.providerName,

                // Callbacks
                onDeleteNode: deleteNode,
              },
            }

            newNodes.push(providerNodeData)

            // Registrar posição
            nodePositions.set(nodeId, {
              x: xPosition,
              y: finalYPosition,
              level,
              line,
              isTrue: isFromTrueFlow,
            })

            // *** CORREÇÃO: BUSCAR TIPO DO NÓ PAI CORRETAMENTE ***
            if (parentNodeId) {
              // IMPORTANTE: Buscar no array completo de nós, não apenas nos recém-criados
              const parentNode = newNodes.find((n) => n.id === parentNodeId)
              let parentNodeType = 'unknown'

              if (parentNode) {
                parentNodeType = String(parentNode.type)
              } else if (parentNodeId === startNodeId) {
                parentNodeType = 'initial'
              }

              const edge = createEdge(
                parentNodeId,
                nodeId,
                isFromTrueFlow,
                parentNodeType,
              )
              newEdges.push(edge)
            }
          }
        })
      }

      // Iniciar construção do fluxo a partir do nó inicial
      if (workflowData.flow && workflowData.flow.length > 0) {
        buildNodesFromFlow(workflowData.flow, startNodeId, 1, 0, true)
      }

      // Aplicar todos de uma vez para evitar problemas de sincronização
      setNodes(newNodes)
      setEdges(newEdges)
    },
    [setNodes, setEdges, reactFlowInstance, deleteNode],
  )

  // Função para carregar workflow específico pelo ID
  /* const loadWorkflowById = useCallback(
    async (merchantCode: string) => {
      try {
        const result = await getOrquestrationByMerchantIdAction(merchantCode)

        if (result.success && result.data) {
          loadWorkflowFromData(result.data)
          console.log('Workflow carregado com sucesso:', result.data.name)
        } else {
          console.error('Erro ao carregar workflow:', result.message)
          alert(`Erro ao carregar workflow: ${result.message}`)
        }
      } catch (error) {
        console.error('Erro ao carregar workflow:', error)
        alert('Erro interno ao carregar workflow')
      }
    },
    [loadWorkflowFromData],
  ) */

  // Função para limpar o canvas
  const clearWorkflow = useCallback(() => {
    setWorkflowIdSelected('')
    setNodes([
      {
        id: 'transaction-1',
        type: 'initial',
        position: { x: 150, y: 100 },
        data: {
          label: 'Início da transação',
          icon: <Play className="w-4 h-4" />,
          color: 'bg-green-500',
          nodeType: 'transaction',
          isStartNode: true,
          onDeleteNode: (nodeId: string) => deleteNode(nodeId),
        },
      },
    ])
  }, [setNodes, deleteNode, setWorkflowIdSelected])

  return (
    <div className="flex h-screen bg-gray-50">
      <WorkflowTestDialog
        ref={workflowDialogRef}
        merchantId={workflowIdSelected}
      />
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Gateway de Pagamentos
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Construa suas regras de orquestração de pagamentos
          </p>
        </div>

        <div className="w-full p-4">
          <Button className="w-full" onClick={clearWorkflow}>
            Criar novo fluxo
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <WorkflowList
            workFlowList={workFlowList}
            onLoadWorkflow={loadWorkflowFromData}
            onDeleteWorkflow={() => {}}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <Header
          autoLayout={autoLayout}
          nodesCount={nodes.length}
          handleSaveWorkflow={handleExportFlow}
          handleOpenWorkflowTestDialog={handleOpenWorkflowTestDialog}
        />

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-left"
            deleteKeyCode={['Delete', 'Backspace']}
            colorMode="light"
            nodesDraggable={false}
          >
            <Background variant={BackgroundVariant.Cross} gap={20} size={1} />
          </ReactFlow>
        </div>
      </div>

      <style jsx global>{`
        .react-flow__handle {
          width: 12px !important;
          height: 12px !important;
        }

        .react-flow__handle-top,
        .react-flow__handle-bottom {
          left: 50% !important;
          transform: translateX(-50%) !important;
        }

        .react-flow__handle-left,
        .react-flow__handle-right {
          top: 50% !important;
          transform: translateY(-50%) !important;
        }

        /* Melhorias para as conexões */
        .react-flow__edge {
          z-index: 5;
        }

        .react-flow__edge-path {
          stroke-width: 3px;
        }

        .react-flow__edge-interaction {
          cursor: pointer;
        }

        .react-flow__edge:hover .react-flow__edge-path {
          stroke: #2563eb !important;
          stroke-width: 4px !important;
        }
      `}</style>
    </div>
  )
}

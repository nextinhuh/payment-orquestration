export interface WorkflowRule {
  id: string
  name: string
  path: string[]
  startNode: string
  endNode: string
}

export interface NodeTypeDefinition {
  id: string
  type: string
  label: string
  icon: React.ReactNode
  color: string
  description: string
  category: string
  hasOperator?: boolean
  operatorOptions?: string[]
  defaultValue?: string
}

export interface FlowCondition {
  field: string
  operator: string
  value: string
}

export interface FlowProvider {
  typeFlow: 'PROVIDER'
  providerName: string
}

export interface FlowConditionNode {
  typeFlow: 'CONDITION'
  condition: FlowCondition
  trueFlow?: FlowItem[]
  falseFlow?: FlowItem[]
}

export type FlowItem = FlowConditionNode | FlowProvider

export interface WorkflowData {
  merchantCode?: string
  name: string
  description?: string
  decisionType: 'RULES' | 'BTREE'
  flow: FlowItem[]
}

export interface WorkflowNodeData {
  flow: FlowItem[]
  name: string
  description?: string
  merchantCode?: string
  decisionType: 'RULES' | 'BTREE'
}

// Tipos para operadores disponíveis
export type OperatorType =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL_TO'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL_TO'
  | 'IN'
  | 'NOT_IN'
  | 'CONTAINS'
  | 'NOT_CONTAINS'

// Tipos para campos de condição
export type FieldType =
  | 'AMOUNT'
  | 'BRAND'
  | 'INSTALLMENT'
  | 'METADATA'
  | 'PAYMENT_METHOD'
  | 'COUNTRY'
  | 'CURRENCY'

// Tipos para decision type
export type DecisionType = 'RULES' | 'BTREE'

// Tipos para flow type
export type FlowType = 'CONDITION' | 'PROVIDER'

export interface WorkFlowListData {
  name: string
  flow: FlowItem[]
  description?: string
  merchantCode?: string
}

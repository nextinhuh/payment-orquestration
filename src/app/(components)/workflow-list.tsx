import { motion } from 'framer-motion'
import { WorkFlowListData } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WorkflowListProps {
  workFlowList: WorkFlowListData[]
  onLoadWorkflow?: (workflow: WorkFlowListData) => void
  onDeleteWorkflow?: (workflow: WorkFlowListData) => void
}

export default function WorkflowList({
  workFlowList,
  onLoadWorkflow,
  onDeleteWorkflow,
}: WorkflowListProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Workflows existentes ({workFlowList.length})
      </h3>

      <div className="flex flex-col gap-3">
        {workFlowList.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-gray-500 text-sm">
                Nenhum workflow encontrado
              </p>
            </CardContent>
          </Card>
        ) : (
          workFlowList.map((workFlow, index) => (
            <motion.div
              key={`${workFlow.merchantCode}-${index}`}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => onLoadWorkflow?.(workFlow)}
            >
              <Card className="hover:shadow-md transition-shadow py-2">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-600">
                      <Workflow className="text-white w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">
                        {workFlow.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {workFlow.description || 'Sem descrição'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteWorkflow?.(workFlow)
                        }}
                        className="h-6 w-6 p-0 text-red-600"
                        title="Excluir"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

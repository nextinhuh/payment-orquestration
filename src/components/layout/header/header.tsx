import { Button } from '@/components/ui/button'
import { FlaskConical, Save, SendToBack } from 'lucide-react'

interface HeaderProps {
  nodesCount: number
  autoLayout: () => void
  handleSaveWorkflow: () => void
  handleOpenWorkflowTestDialog?: () => void
}

export default function Header({
  autoLayout,
  nodesCount,
  handleSaveWorkflow,
  handleOpenWorkflowTestDialog,
}: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={autoLayout}
            disabled={nodesCount <= 1}
          >
            <SendToBack className="w-4 h-4 mr-2" />
            Auto ajuste do layout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenWorkflowTestDialog}
            disabled={nodesCount <= 1}
          >
            <FlaskConical className="w-4 h-4 mr-2" />
            Testar workflow
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveWorkflow}
            disabled={nodesCount === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar worlfow
          </Button>
        </div>
      </div>
    </div>
  )
}

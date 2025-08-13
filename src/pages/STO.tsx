import { AdminPanel, PartitionedTransfer } from '@/components/STO'
import { ControllerTransfer, DocsPanel, StatusBadge } from '@/components/STO'


export default function STO() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">STO Demo (ERC-1400 Lite)</h1>
      <StatusBadge />
      <AdminPanel />
      <PartitionedTransfer />
      <div className="mt-8 grid gap-6">
        <DocsPanel />
        <ControllerTransfer />
      </div>
    </div>
  )
}

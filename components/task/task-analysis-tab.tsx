'use client'

export default function TaskAnalysisTab({ taskUUID }: { taskUUID: string }) {
  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-semibold mb-2">Analysis</h2>
      <div className="text-muted-foreground text-sm">
        Analysis features coming soon for task ID: <code>{taskUUID}</code>
      </div>
    </div>
  )
}
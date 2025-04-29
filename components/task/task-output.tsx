'use client'

interface TaskOutputProps {
  executions: any[]
}

export default function TaskOutput({ executions }: TaskOutputProps) {
  return (
    <div className="relative overflow-hidden border rounded-xl bg-muted/50 flex flex-col min-h-[200px]">
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4 scrollbar-thin">
        {executions.length === 0 ? (
          <div className="flex justify-center items-center text-muted-foreground text-lg h-full min-h-[160px]">
            No Past Executions
          </div>
        ) : (
          executions.map((exec: any, idx: number) => (
            <div
              key={exec.id || idx}
              className="border bg-white px-4 py-3 rounded-md shadow-sm"
            >
              <div className="text-sm font-medium">
                Execution #{exec.sequence_number || idx + 1}
              </div>
              <div className="text-xs text-gray-600">
                {new Date(exec.creation_time).toLocaleString()}
              </div>
              <div className="mt-2">
                <strong>Prompt:</strong> {exec.input.query}
              </div>
              <div className="mt-1">
                <strong>Output:</strong>
                <pre className="text-sm mt-1 whitespace-pre-wrap">
                  {exec.output.output_text}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
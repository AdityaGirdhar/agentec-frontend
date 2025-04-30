'use client'

import HelpSkeleton from './help-skeleton'

const helpPages = [
  { image: "Part 1 Image", title: "Welcome to Tasks", description: "This is where your journey begins. Organize and manage your tasks effortlessly." },
  { image: "Part 2 Image", title: "Creating a Task", description: "Click 'New Task' to get started. Name it, and you're ready to go." },
  { image: "Part 3 Image", title: "Sharing a Task", description: "Tasks can be shared with your organization members securely and efficiently." },
  { image: "Part 4 Image", title: "Scheduling Tasks", description: "Automate execution with smart scheduling options available under each task." },
  { image: "Part 5 Image", title: "Analyzing Executions", description: "Use the analysis tab to view cost and usage metrics of task executions." },
]

export default function HelpTaskModal({ onClose }: { onClose: () => void }) {
  return <HelpSkeleton pages={helpPages} onClose={onClose} />
}
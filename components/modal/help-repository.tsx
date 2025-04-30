'use client'

import HelpSkeleton from './help-skeleton'

const helpPages = [
  {
    image: "Part 1 Image",
    title: "Welcome to Repository",
    description: "This is your personal space to manage saved agents and API keys across providers.",
  },
  {
    image: "Part 2 Image",
    title: "Your Saved Agents",
    description: "View all agents you've saved from the marketplace. Access details, usage, and share functionality.",
  },
  {
    image: "Part 3 Image",
    title: "Adding API Keys",
    description: "Securely add provider-specific keys (like OpenAI or Google) to use them during agent executions.",
  },
  {
    image: "Part 4 Image",
    title: "Revealing and Copying Keys",
    description: "Keys are hidden by default. You can reveal them or copy to clipboard securely when needed.",
  },
  {
    image: "Part 5 Image",
    title: "Agent Details and Usage",
    description: "Use the info and usage icons to inspect agent capabilities or see how often you’ve used them.",
  },
]

export default function HelpRepositoryModal({ onClose }: { onClose: () => void }) {
  return <HelpSkeleton pages={helpPages} onClose={onClose} />
}
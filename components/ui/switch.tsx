// components/ui/switch.tsx
'use client'

import React from 'react'

export function Switch({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      } transition-colors`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
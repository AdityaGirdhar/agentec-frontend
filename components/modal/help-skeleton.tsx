'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface HelpPage {
  image: string // placeholder string or path to image
  title: string
  description: string
}

interface HelpSkeletonProps {
  pages: HelpPage[]
  onClose: () => void
}

export default function HelpSkeleton({ pages, onClose }: HelpSkeletonProps) {
  const [page, setPage] = useState(0)
  const current = pages[page]

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl h-[600px] overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Help</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={20} />
          </button>
        </div>

        {/* Top Half - Image Area */}
        <div className="flex-1 flex items-center justify-center border-b relative bg-muted/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-gray-400 text-2xl font-semibold"
            >
              {current.image}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Half - Content */}
        <div className="p-6 space-y-4 flex flex-col justify-between h-[250px]">
          {/* Circle Pagination */}
          <div className="flex justify-center gap-2">
            {pages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx)}
                className={`w-3 h-3 rounded-full transition ${
                  idx === page ? "bg-black" : "bg-gray-300 hover:bg-gray-500"
                }`}
              />
            ))}
          </div>

          {/* Text Content */}
          <div className="text-center">
            <h3 className="text-lg font-semibold">{current.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{current.description}</p>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between">
            {page > 0 ? (
              <Button className="bg-black text-white" onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
            ) : (
              <div />
            )}

            {page < pages.length - 1 ? (
              <Button className="bg-black text-white" onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            ) : (
              <Button className="bg-black text-white" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
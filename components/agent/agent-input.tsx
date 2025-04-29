'use client'

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronUp, X } from "lucide-react"

interface AgentInputProps {
  baseApi: string
  inputFields: Record<string, any>
}

interface KeyItem {
  id: string
  name: string
}

export default function AgentInput({ baseApi, inputFields }: AgentInputProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({})
  const [query, setQuery] = useState("")
  const [keys, setKeys] = useState<KeyItem[]>([])
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const parsed = JSON.parse(user)
      fetch(`http://localhost:8000/users/get_keys?user_id=${parsed.id}`)
        .then(res => res.json())
        .then(setKeys)
        .catch(err => console.error("Failed to fetch keys", err))
    }
  }, [])

  const allFieldsSelected = () => {
    return Object.keys(inputFields).every(key => {
      if (inputFields[key].dropdown_select) return fieldValues[key]
      if (inputFields[key].key_select !== undefined) return fieldValues[key]
      return true
    }) && query.trim() !== ""
  }

  const handleSend = async () => {
    const payload = { ...fieldValues, query }
    try {
      const res = await fetch(`http://localhost:8000/${baseApi}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      console.log("Response:", data)
    } catch (err) {
      console.error("Failed to send data", err)
    }
  }

  const toggleDropdown = (key: string) => {
    if (dropdownOpen === key) {
      setDropdownOpen(null)
    } else {
      setDropdownOpen(key)
    }
  }

  const clearField = (key: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    setFieldValues(prev => ({ ...prev, [key]: undefined }))
    setDropdownOpen(null)
  }

  const formatLabel = (text: string) => {
    if (text.toLowerCase() === "key_id") return "Key"
    return text
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <Input
          placeholder="Enter your query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-base min-h-[48px] px-4"
        />
      </div>

      <div className="border-t p-3 flex items-center justify-between gap-2">
        <div className="flex gap-2 flex-wrap">
          {Object.keys(inputFields).map((key) => {
            const isDropdown = inputFields[key].dropdown_select
            const isKeySelect = inputFields[key].key_select !== undefined
            if (!isDropdown && !isKeySelect) return null

            return (
              <div key={key} className="relative flex flex-col items-center">
                {dropdownOpen === key && (
                  <div className="absolute bottom-12 w-52 bg-white border rounded-md shadow-md z-10">
                    {(isDropdown ? inputFields[key].dropdown_select : keys).map((item: any, idx: number) => (
                      <button
                        key={isDropdown ? idx : item.id}
                        className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                        onClick={() => {
                          setFieldValues(prev => ({ ...prev, [key]: isDropdown ? item : item.id }))
                          setDropdownOpen(null)
                        }}
                      >
                        {isDropdown ? item : item.name}
                      </button>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDropdown(key)}
                  className="flex items-center gap-1 relative"
                >
                  {fieldValues[key] ? `${formatLabel(key)}: ${
                    isDropdown
                      ? fieldValues[key]
                      : keys.find(k => k.id === fieldValues[key])?.name || "Selected"
                  }` : formatLabel(key)}
                  {fieldValues[key] && (
                    <button
                      onClick={(e) => clearField(key, e)}
                      className="ml-1 p-0.5 rounded-full hover:bg-gray-200"
                      type="button"
                    >
                      <X size={12} />
                    </button>
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        <Button
          size="icon"
          className="ml-auto"
          disabled={!allFieldsSelected()}
          onClick={handleSend}
        >
          <ChevronUp size={20} />
        </Button>
      </div>
    </div>
  )
}
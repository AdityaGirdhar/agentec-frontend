"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff, Trash, Edit } from "lucide-react"

interface KeyEntry {
  name: string
  key: string
  provider: string
}

export function KeysModal({ onClose }: { onClose: () => void }) {
  const [keys, setKeys] = React.useState<KeyEntry[]>(
    JSON.parse(localStorage.getItem("keys") || "[]")
  )
  const [showForm, setShowForm] = React.useState(false)
  const [formData, setFormData] = React.useState<KeyEntry>({
    name: "",
    key: "",
    provider: "",
  })
  const [visibleKeys, setVisibleKeys] = React.useState<Record<number, boolean>>({})
  const [editIndex, setEditIndex] = React.useState<number | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, provider: value })
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.key || !formData.provider) return
    let updatedKeys
    if (editIndex !== null) {
      updatedKeys = [...keys]
      updatedKeys[editIndex] = formData
    } else {
      updatedKeys = [...keys, formData]
    }
    setKeys(updatedKeys)
    setShowForm(false)
    setEditIndex(null)
    setFormData({ name: "", key: "", provider: "" })
  }

  const toggleKeyVisibility = (index: number) => {
    setVisibleKeys((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const handleDelete = (index: number) => {
    const updatedKeys = keys.filter((_, i) => i !== index)
    setKeys(updatedKeys)
  }

  const handleEdit = (index: number) => {
    setFormData(keys[index])
    setEditIndex(index)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setFormData({ name: "", key: "", provider: "" })
    setEditIndex(null)
    setShowForm(true)
  }

  const handleCloseAndSync = async () => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return

    const { email } = JSON.parse(storedUser)

    await Promise.all(
      keys.map((entry) =>
        fetch("http://localhost:8000/users/add_key", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            name: entry.name,
            provider: entry.provider,
            key: entry.key,
          }),
        })
      )
    )

    onClose()
  }

  return (
    <Card className="w-[500px] h-auto">
      <CardHeader>
        <CardTitle className="py-1 text-left">{showForm ? "Add Key" : "Your Keys"}</CardTitle>
        {!showForm && (
          <CardDescription className="text-left">
            Manage your AI provider keys.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {showForm ? (
          <div className="grid w-full items-center gap-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Give a memorable name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                type="password"
                placeholder="Enter your key"
                value={formData.key}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="provider">AI Provider</Label>
              <Select onValueChange={handleSelectChange} value={formData.provider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OpenAI">OpenAI</SelectItem>
                  <SelectItem value="Gemini">Google Gemini</SelectItem>
                  <SelectItem value="Anthropic">Anthropic</SelectItem>
                  <SelectItem value="DeepSeek">DeepSeek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse table-fixed text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-1 w-1/4">Name</th>
                <th className="p-1 w-1/4">Provider</th>
                <th className="p-1 w-1/4">Key</th>
                <th className="p-1 w-1/4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.length > 0 ? (
                keys.map((key, index) => (
                  <tr key={index} className="border-b text-sm">
                    <td className="p-1">{key.name}</td>
                    <td className="p-1">{key.provider}</td>
                    <td className="p-1 overflow-hidden truncate max-w-[150px]">
                      {visibleKeys[index] ? key.key : "••••••••"}
                    </td>
                    <td className="p-1 flex justify-center items-center space-x-2">
                      <button onClick={() => toggleKeyVisibility(index)}>
                        {visibleKeys[index] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => handleEdit(index)}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(index)} className="text-red-500">
                        <Trash size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-1 text-center text-gray-500">
                    No keys added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {showForm ? (
          <Button onClick={() => setShowForm(false)} variant="outline">
            Cancel
          </Button>
        ) : (
          <Button onClick={handleCloseAndSync} variant="outline">
            Close
          </Button>
        )}
        {showForm ? (
          <Button onClick={handleSubmit}>Submit</Button>
        ) : (
          <Button onClick={handleAddNew}>+ Add Key</Button>
        )}
      </CardFooter>
    </Card>
  )
}
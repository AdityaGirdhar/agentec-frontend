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

interface KeysModalProps {
  onClose: () => void;
}

export function KeysModal({ onClose }: KeysModalProps) {
  return (
    <Card className="w-[400px] h-auto">
      <CardHeader>
        <CardTitle className="py-1">Add your first key</CardTitle>
        <CardDescription>This connects us with your AI model provider.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Give a memorable name to this key" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Key</Label>
              <Input id="name" type="password" placeholder="Enter your key" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">AI Provider</Label>
              <Select>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </CardFooter>
    </Card>
  )
}

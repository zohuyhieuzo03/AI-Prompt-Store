import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/utils/supabase/client"
import { useUser } from "@/app/hooks/use-user"

interface PromptParameterFormProps {
  promptContent: string
  promptId: string
  onFilledPromptChange: (filledPrompt: string) => void
  onPromptSaved?: () => void
}

export function PromptParameterForm({ promptContent, promptId, onFilledPromptChange, onPromptSaved }: PromptParameterFormProps) {
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [parameterTypes, setParameterTypes] = useState<Record<string, string>>({})
  const [parameterLines, setParameterLines] = useState<string[]>([])
  const [filledPrompt, setFilledPrompt] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const { user } = useUser()

  // Extract parameters from prompt content
  useEffect(() => {
    const lines = promptContent.split('\n')
    const newParameters: Record<string, string> = {}
    const newParameterTypes: Record<string, string> = {}
    const newParameterLines: string[] = []

    lines.forEach(line => {
      const match = line.match(/\[([A-Z_]+)\]\s*=\s*(.*)/)
      if (match) {
        const key = match[1].toLowerCase()
        const defaultValue = match[2].trim()
        newParameters[key] = defaultValue
        
        // Determine parameter type based on key
        if (key.includes('level')) {
          newParameterTypes[key] = 'select'
        } else if (key.includes('time')) {
          newParameterTypes[key] = 'number'
        } else if (key.includes('style')) {
          newParameterTypes[key] = 'select'
        } else if (key.includes('goal')) {
          newParameterTypes[key] = 'textarea'
        } else {
          newParameterTypes[key] = 'text'
        }
        newParameterLines.push(line)
      }
    })

    setParameters(newParameters)
    setParameterTypes(newParameterTypes)
    setParameterLines(newParameterLines)
  }, [promptContent])

  // Update filled prompt when parameters change
  useEffect(() => {
    let filledContent = promptContent
    Object.entries(parameters).forEach(([key, value]) => {
      const regex = new RegExp(`\\[${key.toUpperCase()}\\]\\s*=\\s*.*`, 'g')
      filledContent = filledContent.replace(regex, `[${key.toUpperCase()}] = ${value}`)
    })
    setFilledPrompt(filledContent)
    onFilledPromptChange(filledContent)
  }, [parameters, promptContent, onFilledPromptChange])

  const handleParameterChange = (key: string, value: string) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSavePrompt = async () => {
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save prompts",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('/api/generated-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt_id: promptId,
          content: filledPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save prompt')
      }

      toast({
        title: "Success",
        description: "Prompt saved successfully",
      })
      onPromptSaved?.()
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getInputComponent = (key: string, type: string) => {
    const label = key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')

    switch (type) {
      case 'select':
        if (key.includes('level')) {
          return (
            <Select
              value={parameters[key]}
              onValueChange={(value) => handleParameterChange(key, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select your ${label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          )
        } else if (key.includes('style')) {
          return (
            <Select
              value={parameters[key]}
              onValueChange={(value) => handleParameterChange(key, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select your ${label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">Visual</SelectItem>
                <SelectItem value="auditory">Auditory</SelectItem>
                <SelectItem value="hands-on">Hands-on</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        return null

      case 'number':
        return (
          <Input
            type="number"
            value={parameters[key]}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            placeholder={`Enter ${label}`}
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={parameters[key]}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            placeholder={`Enter ${label}`}
          />
        )

      default:
        return (
          <Input
            value={parameters[key]}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            placeholder={`Enter ${label}`}
          />
        )
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Prompt Parameters</h3>
      <div className="grid gap-4">
        {Object.entries(parameterTypes).map(([key, type]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>
              {key.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Label>
            {getInputComponent(key, type)}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigator.clipboard.writeText(filledPrompt)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy Prompt
        </Button>
        {user && (
          <Button
            onClick={handleSavePrompt}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Generated Prompt"}
          </Button>
        )}
      </div>
    </div>
  )
} 
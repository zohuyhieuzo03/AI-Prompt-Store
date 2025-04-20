"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/hooks/use-user"

interface Prompt {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  user_id: string
}

export default function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [parameterTypes, setParameterTypes] = useState<Record<string, string>>({})
  const supabase = createClient()
  const router = useRouter()
  const { user } = useUser()

  // Extract parameters from prompt content
  useEffect(() => {
    if (!content) return

    const lines = content.split('\n')
    const newParameters: Record<string, string> = {}
    const newParameterTypes: Record<string, string> = {}

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
      }
    })

    setParameters(newParameters)
    setParameterTypes(newParameterTypes)
  }, [content])

  useEffect(() => {
    async function fetchPrompt() {
      const resolvedParams = await params
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("id", resolvedParams.id)
        .single()

      if (error) {
        console.error("Error fetching prompt:", error)
        setIsLoading(false)
        return
      }

      setPrompt(data)
      setTitle(data.title)
      setCategory(data.category)
      setContent(data.content)
      setIsLoading(false)
    }

    fetchPrompt()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("prompts")
        .update({
          title,
          category,
          content,
        })
        .eq("id", prompt?.id)

      if (error) {
        throw error
      }

      router.push(`/prompt/${prompt?.id}`)
    } catch (error) {
      console.error("Error updating prompt:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto py-6 px-4 md:px-6">
        <div>Loading...</div>
      </main>
    )
  }

  if (!prompt) {
    return (
      <main className="container mx-auto py-6 px-4 md:px-6">
        <div>Prompt not found</div>
      </main>
    )
  }

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/prompt/${prompt.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prompt
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Prompt</h1>
        <p className="text-muted-foreground mt-1">Update your prompt details</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Prompt Details</CardTitle>
          <CardDescription>Update the information for your AI prompt</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={category}
                onValueChange={setCategory}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Content</Label>
              <Textarea 
                id="prompt" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your prompt content here..." 
                className="min-h-[200px]" 
                required 
              />
            </div>

            {Object.keys(parameters).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Prompt Parameters</h3>
                <div className="grid gap-4">
                  {Object.entries(parameters).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>
                        {key.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Label>
                      <Input
                        id={key}
                        value={value}
                        onChange={(e) => {
                          const newParameters = { ...parameters }
                          newParameters[key] = e.target.value
                          setParameters(newParameters)
                        }}
                        placeholder={`Enter ${key}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <CardFooter className="flex justify-end gap-2 px-0 pb-0">
              <Button variant="outline" asChild>
                <Link href={`/prompt/${prompt.id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </main>
  )
} 
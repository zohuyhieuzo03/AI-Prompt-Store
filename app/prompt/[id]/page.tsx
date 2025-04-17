"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Copy, Edit, Trash, ExternalLink } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { PromptParameterForm } from "@/components/prompt-parameter-form"
import { useUser } from "@/app/hooks/use-user"

interface Prompt {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  user_id: string
}

interface GeneratedPrompt {
  id: string
  content: string
  created_at: string
}

export default function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filledPrompt, setFilledPrompt] = useState("")
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([])
  const supabase = createClient()
  const { user } = useUser()

  const fetchGeneratedPrompts = async (promptId: string) => {
    const { data: generatedData, error: generatedError } = await supabase
      .from("generated_prompts")
      .select("*")
      .eq("prompt_id", promptId)
      .order("created_at", { ascending: false })

    if (generatedError) {
      console.error("Error fetching generated prompts:", generatedError)
    } else {
      setGeneratedPrompts(generatedData)
    }
  }

  useEffect(() => {
    async function fetchData() {
      const resolvedParams = await params
      // Fetch prompt details
      const { data: promptData, error: promptError } = await supabase
        .from("prompts")
        .select("*")
        .eq("id", resolvedParams.id)
        .single()

      if (promptError) {
        console.error("Error fetching prompt:", promptError)
        setIsLoading(false)
        return
      }

      setPrompt(promptData)
      await fetchGeneratedPrompts(resolvedParams.id)
      setIsLoading(false)
    }

    fetchData()
  }, [params])

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
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Link>
      </Button>

      <Card className="max-w-3xl mx-auto mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{prompt.title}</CardTitle>
              <CardDescription>
                Added on {format(new Date(prompt.created_at), "MMM d, yyyy")}
              </CardDescription>
            </div>
            <Badge>{prompt.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <PromptParameterForm 
            promptContent={prompt.content}
            promptId={prompt.id}
            onFilledPromptChange={setFilledPrompt}
            onPromptSaved={() => fetchGeneratedPrompts(prompt.id)}
          />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Generated Prompt</h3>
            <div className="bg-muted p-4 rounded-md relative group">
              <p className="whitespace-pre-wrap">{filledPrompt || prompt.content}</p>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => navigator.clipboard.writeText(filledPrompt || prompt.content)}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy content</span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {user && user.id === prompt.user_id && (
            <>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button asChild>
                <Link href={`/prompt/${prompt.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Prompt
                </Link>
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {user && generatedPrompts.length > 0 && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Generated Prompts History</CardTitle>
            <CardDescription>Previously generated prompts for this template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedPrompts.map((generatedPrompt) => (
                <div key={generatedPrompt.id} className="flex items-center justify-between p-4 bg-muted rounded-md">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">
                      {format(new Date(generatedPrompt.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    <p className="text-sm truncate">{generatedPrompt.content}</p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/generated-prompt/${generatedPrompt.id}`}>
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View generated prompt</span>
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

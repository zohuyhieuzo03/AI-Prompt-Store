"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Copy } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { format } from "date-fns"

interface GeneratedPrompt {
  id: string
  prompt_id: string
  content: string
  created_at: string
  prompt: {
    title: string
    category: string
  }
}

export default function GeneratedPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchGeneratedPrompt() {
      const resolvedParams = await params
      const { data, error } = await supabase
        .from("generated_prompts")
        .select(`
          *,
          prompt:prompts(title, category)
        `)
        .eq("id", resolvedParams.id)
        .single()

      if (error) {
        console.error("Error fetching generated prompt:", error)
        setIsLoading(false)
        return
      }

      setGeneratedPrompt(data)
      setIsLoading(false)
    }

    fetchGeneratedPrompt()
  }, [params])

  if (isLoading) {
    return (
      <main className="container mx-auto py-6 px-4 md:px-6">
        <div>Loading...</div>
      </main>
    )
  }

  if (!generatedPrompt) {
    return (
      <main className="container mx-auto py-6 px-4 md:px-6">
        <div>Generated prompt not found</div>
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

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{generatedPrompt.prompt.title}</CardTitle>
              <CardContent className="text-sm text-muted-foreground">
                Generated on {format(new Date(generatedPrompt.created_at), "MMM d, yyyy 'at' h:mm a")}
              </CardContent>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md relative group">
            <p className="whitespace-pre-wrap">{generatedPrompt.content}</p>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => navigator.clipboard.writeText(generatedPrompt.content)}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy content</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
} 
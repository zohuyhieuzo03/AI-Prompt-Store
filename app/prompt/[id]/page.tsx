"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Copy, Edit, Trash } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { format } from "date-fns"

interface Prompt {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  user_id: string
}

export default function PromptDetailPage({ params }: { params: { id: string } }) {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPrompt() {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error) {
        console.error("Error fetching prompt:", error)
        setIsLoading(false)
        return
      }

      setPrompt(data)
      setIsLoading(false)
    }

    fetchPrompt()
  }, [params.id])

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

      <Card className="max-w-3xl mx-auto">
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
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Content</h3>
            <div className="bg-muted p-4 rounded-md relative group">
              <p className="whitespace-pre-wrap">{prompt.content}</p>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => navigator.clipboard.writeText(prompt.content)}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy content</span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
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
        </CardFooter>
      </Card>
    </main>
  )
}

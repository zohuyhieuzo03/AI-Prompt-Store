"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"
import Link from "next/link"

interface PromptCardProps {
  prompt: {
    id: string
    title: string
    content: string
    category: string
    createdAt: string
  }
}

export default function PromptCard({ prompt }: PromptCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{prompt.title}</CardTitle>
        <Badge>{prompt.category}</Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-4">{prompt.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => navigator.clipboard.writeText(prompt.content)}
        >
          <Copy className="h-3.5 w-3.5 mr-1" />
          Copy
        </Button>
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link href={`/prompt/${prompt.id}`}>
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            View
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

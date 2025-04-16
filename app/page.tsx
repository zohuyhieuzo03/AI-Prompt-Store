"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PromptCard from "@/components/prompt-card"
import { createBrowserClient } from "@supabase/ssr"
import { useState, useEffect } from "react"

interface Prompt {
  id: string
  title: string
  content: string
  category: string
  createdAt: string
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])

  useEffect(() => {
    const fetchPrompts = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data } = await supabase.from("prompts").select("*")
      const transformedData = (data || []).map((item: any) => ({
        ...item,
      }))
      setPrompts(transformedData)
      setFilteredPrompts(transformedData)
    }
    fetchPrompts()
  }, [])

  useEffect(() => {
    const filtered = prompts.filter((prompt) =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredPrompts(filtered)
  }, [searchQuery, prompts])

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Prompt Library</h1>
          <p className="text-muted-foreground mt-1">Store, organize, and retrieve your AI prompts</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input 
            placeholder="Search prompts..." 
            className="w-full md:w-[300px]" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button asChild>
            <Link href="/new">
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Prompts</TabsTrigger>
          <TabsTrigger value="creative">Creative</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="creative" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts
              .filter((prompt) => prompt.category === "creative")
              .map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="technical" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts
              .filter((prompt) => prompt.category === "technical")
              .map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="marketing" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts
              .filter((prompt) => prompt.category === "marketing")
              .map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Overview of your prompt library</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">Total Prompts</p>
              <p className="text-3xl font-bold">{filteredPrompts.length}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">Creative</p>
              <p className="text-3xl font-bold">{filteredPrompts.filter((p) => p.category === "creative").length}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">Technical</p>
              <p className="text-3xl font-bold">{filteredPrompts.filter((p) => p.category === "technical").length}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">Marketing</p>
              <p className="text-3xl font-bold">{filteredPrompts.filter((p) => p.category === "marketing").length}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardFooter>
      </Card>
    </main>
  )
}

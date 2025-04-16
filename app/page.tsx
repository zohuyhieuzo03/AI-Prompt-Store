"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PromptCard from "@/components/prompt-card"
import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useUser } from "@/app/hooks/use-user"
import { Badge } from "@/components/ui/badge"

interface Prompt {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  user_id: string
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const { user } = useUser()

  useEffect(() => {
    async function fetchPrompts() {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching prompts:", error)
        setIsLoading(false)
        return
      }

      setPrompts(data)
      setFilteredPrompts(data)
      setIsLoading(false)
    }

    fetchPrompts()
  }, [])

  useEffect(() => {
    const filtered = prompts.filter((prompt) =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredPrompts(filtered)
  }, [searchQuery, prompts])

  if (isLoading) {
    return (
      <main className="container mx-auto py-6 px-4 md:px-6">
        <div>Loading...</div>
      </main>
    )
  }

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
          {user && (
            <Button asChild>
              <Link href="/new">
                <Plus className="mr-2 h-4 w-4" />
                New Prompt
              </Link>
            </Button>
          )}
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
              <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        <Link href={`/prompt/${prompt.id}`} className="hover:underline">
                          {prompt.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        Added on {format(new Date(prompt.created_at), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Badge>{prompt.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{prompt.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="creative" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts
              .filter((prompt) => prompt.category === "creative")
              .map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          <Link href={`/prompt/${prompt.id}`} className="hover:underline">
                            {prompt.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          Added on {format(new Date(prompt.created_at), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <Badge>{prompt.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{prompt.content}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="technical" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts
              .filter((prompt) => prompt.category === "technical")
              .map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          <Link href={`/prompt/${prompt.id}`} className="hover:underline">
                            {prompt.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          Added on {format(new Date(prompt.created_at), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <Badge>{prompt.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{prompt.content}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="marketing" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts
              .filter((prompt) => prompt.category === "marketing")
              .map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          <Link href={`/prompt/${prompt.id}`} className="hover:underline">
                            {prompt.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          Added on {format(new Date(prompt.created_at), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <Badge>{prompt.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{prompt.content}</p>
                  </CardContent>
                </Card>
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

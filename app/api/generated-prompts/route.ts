import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt_id, content } = await request.json()

    const { data, error } = await supabase
      .from('generated_prompts')
      .insert([
        {
          user_id: user.id,
          prompt_id,
          content,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error saving generated prompt:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in generated prompts route:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 
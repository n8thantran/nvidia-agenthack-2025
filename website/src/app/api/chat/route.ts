import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY || "$API_KEY_REQUIRED_IF_EXECUTING_OUTSIDE_NGC"
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, temperature = 0.6, top_p = 0.95, max_tokens = 4096, frequency_penalty = 0, presence_penalty = 0, stream = false } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    const completion = await client.chat.completions.create({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1",
      messages,
      temperature,
      top_p,
      max_tokens,
      frequency_penalty,
      presence_penalty,
      stream
    })

    return NextResponse.json(completion)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 
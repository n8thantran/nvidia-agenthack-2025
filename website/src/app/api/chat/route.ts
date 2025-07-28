import { NextRequest, NextResponse } from 'next/server'

// Brev server configuration
const BREV_SERVER_URL = process.env.BREV_SERVER_URL || 'http://localhost:8000'
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY // Keep as fallback

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, temperature = 0.7, max_tokens = 2048 } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    // Try Brev server first
    try {
      console.log('Attempting to use Brev server:', BREV_SERVER_URL)
      
      const brevResponse = await fetch(`${BREV_SERVER_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          temperature,
          max_tokens
        }),
        // Add timeout
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      if (brevResponse.ok) {
        const data = await brevResponse.json()
        console.log('Successfully used Brev server')
        return NextResponse.json(data)
      } else {
        console.warn('Brev server returned error:', brevResponse.status)
        throw new Error(`Brev server error: ${brevResponse.status}`)
      }
      
    } catch (brevError) {
      console.warn('Brev server unavailable, falling back to NVIDIA API:', brevError instanceof Error ? brevError.message : String(brevError))
      
      // Fallback to NVIDIA API
      if (NVIDIA_API_KEY) {
        const { default: OpenAI } = await import('openai')
        
        const client = new OpenAI({
          baseURL: "https://integrate.api.nvidia.com/v1",
          apiKey: NVIDIA_API_KEY
        })

        const completion = await client.chat.completions.create({
          model: "nvidia/llama-3.3-nemotron-super-49b-v1",
          messages,
          temperature,
          max_tokens,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
          stream: false
        })

        console.log('Successfully used NVIDIA API fallback')
        return NextResponse.json(completion)
      } else {
        throw new Error('No NVIDIA API key configured for fallback')
      }
    }

  } catch (error) {
    console.error('API Error:', error)
    
    // Return a helpful error response
    const fallbackResponse = {
      choices: [{
        message: {
          role: "assistant",
          content: "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment, or consult with a legal professional for immediate assistance."
        },
        finish_reason: "stop"
      }],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      model: "fallback",
      created: Math.floor(Date.now() / 1000)
    }
    
    return NextResponse.json(fallbackResponse)
  }
} 
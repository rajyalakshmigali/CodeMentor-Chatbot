import { streamText } from 'ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const messages = Array.isArray(body.messages) ? body.messages : []

    const result = streamText({
      model: 'google/gemini-2.5-flash',
      system: 'You are CodeMentor AI, a practical and friendly programming mentor. Answer the user directly, explain your reasoning clearly, provide working code when useful, and ask a concise clarifying question only when the request truly lacks essential context.',
      messages,
    })

    return result.toTextStreamResponse()
  } catch {
    return Response.json({ error: 'Unable to generate a response.' }, { status: 400 })
  }
}

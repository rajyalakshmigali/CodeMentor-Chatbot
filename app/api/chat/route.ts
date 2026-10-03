const SYSTEM_PROMPT =
  'You are CodeMentor AI, a practical and friendly programming mentor. Answer the user directly, explain your reasoning clearly, provide working code when useful, and ask a concise clarifying question only when the request truly lacks essential context.'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const messages = Array.isArray(body.messages)
      ? body.messages
          .filter(
            (message: unknown): message is { role: string; content: string } =>
              typeof message === 'object' &&
              message !== null &&
              'role' in message &&
              'content' in message &&
              typeof message.role === 'string' &&
              typeof message.content === 'string',
          )
          .map(({ role, content }: { role: string; content: string }) => ({
            role: role === 'assistant' ? 'assistant' : 'user',
            content,
          }))
      : []

    if (!messages.length) {
      return Response.json({ error: 'Please enter a message.' }, { status: 400 })
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.4,
        stream: false,
      }),
    })

    if (!groqResponse.ok) {
      const error = await groqResponse.text()
      console.error('[v0] Groq request failed:', groqResponse.status, error)
      return Response.json({ error: 'Unable to generate a response.' }, { status: 502 })
    }

    const completion = await groqResponse.json()
    const answer = completion.choices?.[0]?.message?.content
    if (typeof answer !== 'string' || !answer.trim()) {
      return Response.json({ error: 'The AI returned an empty response.' }, { status: 502 })
    }

    return new Response(answer, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })

  } catch (error) {
    console.error('[v0] Chat request error:', error)
    return Response.json({ error: 'Unable to generate a response.' }, { status: 400 })
  }
}

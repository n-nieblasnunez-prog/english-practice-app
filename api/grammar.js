// Vercel serverless function — proxies requests to Anthropic Claude API
// This avoids browser CORS restrictions on the Anthropic API.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Anthropic API key not configured on server' })

  try {
    // Override model to a known-good, widely available model
    const body = {
      ...req.body,
      model: 'claude-sonnet-4-6',
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Anthropic error:', JSON.stringify(data))
      return res.status(response.status).json({ error: data?.error?.message || JSON.stringify(data) })
    }
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// Temporary debug endpoint — DELETE after fixing
export default async function handler(req, res) {
  const apiKey = process.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey) return res.status(200).json({ error: 'No API key found in env', env: Object.keys(process.env).filter(k => k.includes('ANTHROPIC')) })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 32,
        messages: [{ role: 'user', content: 'Say hello.' }]
      }),
    })
    const data = await response.json()
    return res.status(200).json({ httpStatus: response.status, anthropicResponse: data, keyPrefix: apiKey.slice(0, 12) + '...' })
  } catch (err) {
    return res.status(200).json({ fetchError: err.message })
  }
}

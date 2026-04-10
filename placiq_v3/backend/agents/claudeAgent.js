// Claude AI Agent - Anthropic API Integration
const callClaude = async (prompt, system = '', messages = null) => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const requestMessages = messages || [{ role: 'user', content: prompt }];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: system || 'You are PlaCIQ AI, an expert placement coach for engineering students in India. Always respond with valid, complete JSON when requested. Include all required fields.',
      messages: requestMessages
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Claude API error:', response.status, err);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0]?.text || '';
  
  if (!text) {
    console.warn('Claude returned empty response');
    throw new Error('Claude returned empty response');
  }
  
  return text;
};

module.exports = { callClaude };

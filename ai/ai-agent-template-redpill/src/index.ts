import '@phala/wapo-env'
import { Hono } from 'hono/tiny'
import { html, raw } from 'hono/html'
import { handle } from '@phala/wapo-env/guest'

export const app = new Hono()

async function getChatCompletion(apiKey: string, model: string, chatQuery: string) {
  let result = ''
  try {
    const response = await fetch('https://api.red-pill.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: `${chatQuery}` }],
        model: `${model}`,
      })
    });
    const responseData = await response.json();
    result = (responseData.error) ? responseData.error : responseData.choices[0].message.content
  } catch (error) {
    console.error('Error fetching chat completion:', error)
    result = error as string
  }
  return result
}

app.get('/', async (c) => {
  let vault: Record<string, string> = {}
  let queries = c.req.queries() || {}
  try {
    vault = JSON.parse(process.env.secret || '')
  } catch (e) {
    console.error(e)
    return c.json({ error: "Failed to parse secrets" })
  }
  const apiKey = (vault.apiKey) ? vault.apiKey : 'sk-qVBlJkO3e99t81623PsB0zHookSQJxU360gDMooLenN01gv2'
  // Choose from any model listed here https://docs.red-pill.ai/get-started/supported-models
  const model = (queries.model) ? queries.model[0] : 'gpt-4o'
  const chatQuery = (queries.chatQuery) ? queries.chatQuery[0] : 'Who are you?'
  let result = {
    model,
    chatQuery: chatQuery,
    message: ''
  };

  result.message = await getChatCompletion(apiKey, model, chatQuery)

  return c.json(result)
})

app.post('/', async (c) => {
  let vault: Record<string, string> = {}
  const data = await c.req.json()
  console.log('user payload in JSON:', data)
  try {
    vault = JSON.parse(process.env.secret || '')
  } catch (e) {
    console.error(e)
    return c.json({ error: "Failed to parse secrets" })
  }
  const apiKey = (vault.apiKey) ? vault.apiKey : 'sk-qVBlJkO3e99t81623PsB0zHookSQJxU360gDMooLenN01gv2'
  const model = (data.model) ? data.model : 'gpt-4o'
  const chatQuery = (data.chatQuery) ? data.chatQuery : 'Who are you?'
  let result = {
    model,
    chatQuery: chatQuery,
    message: ''
  };

  result.message = await getChatCompletion(apiKey, model, chatQuery)

  return c.json(result)
});

export default handle(app)

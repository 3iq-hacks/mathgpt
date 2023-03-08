// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ApiReturnSchema, ApiSchema, OpenAIAPIError } from '@/types/apiTypes';
import type { NextApiRequest, NextApiResponse } from 'next'
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { z } from 'zod';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});


const MESSAGES_CONTEXT: ChatCompletionRequestMessage[] = [
    { role: "system", content: "You are a math bot built for high school and undergraduate calculus courses. You helpe with schoolwork by taking in a mathematical problem and solving it, outputting the intermediate steps as well. Mathematical symbols in the input and outputs, as well as the steps, are all done in LaTeX." },
    { role: "user", content: "Solve the following: $$\\int x^{2}dx$$" },
    { role: "assistant", content: "$$\\int x^{2}dx = \\frac{1}{3} x^3 + C$$" },
    { role: "user", content: "Solve the following: $$\\int_{1}^{3}x^{2}dx$$" },
    { role: "assistant", content: "$$\\int_{1}^{2}x^{2} = \\left[  \\frac{1}{2} x^3 \\right]_{1}^{2} = \\frac{2^3}{3} - \\frac{1^3}{3} = \\frac{7}{3}$$" },
]
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiReturnSchema>
) {
    if (req.method !== 'POST') {
        res.status(405).send({ tag: 'error', error: 'Only POST requests allowed' })
        return
    }

    try {
        const openai = new OpenAIApi(configuration);

        // GET PROMPT HERE: 
        console.log(req.body)
        const parsed = ApiSchema.safeParse(JSON.parse(req.body))
        if (!parsed.success) {
            console.log('Malformed chatGPT request!')
            res.status(400).send({ tag: 'error', error: `Bad request: ${parsed.error.toString()}` })
            return
        }
        const total_prompt: ChatCompletionRequestMessage[] = [...MESSAGES_CONTEXT, { "role": "user", "content": parsed.data.prompt }];
        console.log('Handling chatGPT: total prompt and context:', total_prompt);

        const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: total_prompt,
            temperature: 0.5,
        })
        console.log('Completion:', completion.data)
        const answer = completion.data.choices[0].message?.content;

        if (!answer) {
            return res.send({ tag: 'error', error: 'No answer found' })
        }
        console.log(`Got answer '${answer}'`)
        return res.send({ tag: 'success', promptReturn: answer.trim() })

    } catch (e) {
        const parsedError = OpenAIAPIError.safeParse(e);

        if (!parsedError.success) {
            // unknown error
            console.log('Unknown error: cannot parse!', parsedError.error)
            return res.status(500).send({ tag: 'error', error: String(e) })
        } else {
            const { status, statusText } = parsedError.data.response;
            console.log('OpenAI API error:', status, statusText)
            return res.status(500).send({ tag: 'openAIAPIError', data: { status, statusText } })
        }
    }
}


// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ApiReturnSchema, ApiSchema } from '@/types/apiTypes';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai';
import { z } from 'zod';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);


const PROMPT_CONTEXT = `Make a math bot for school.
This bot helps with schoolwork by taking in a mathematical problem and solving it, outputting the intermediate steps as well. Mathematical symbols in the input and outputs, as well as the steps, are all done in LaTeX.
Q: Solve the following: $$\\int x^{2}dx$$
A: $$\\int x^{2}dx = \\frac{1}{3} x^3 + C$$
Q: Solve the following: $$\\int_{1}^{3}x^{2}dx$$
A: $$\\int_{1}^{2}x^{2} = \\left[  \\frac{1}{2} x^3 \\right]_{1}^{2} = \\frac{2^3}{3} - \\frac{1^3}{3} = \\frac{7}{3}$$`

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

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
        const total_prompt = PROMPT_CONTEXT + `\nQ: ${parsed.data.prompt}`;
        console.log('Handling chatGPT: total prompt and context:', total_prompt)

        const completion = await openai.createCompletion({
            model: 'text-davinci-003',
            // append prompt to the end of the prompt context
            prompt: total_prompt,
            temperature: 0.3,
            max_tokens: 500
        });
        console.log('Completion:', completion.data)
        const answer = completion.data.choices[0].text;
        if (!answer) {
            return res.send({ tag: 'error', error: 'No answer found' })
        }
        console.log(`Got answer '${answer}'`)
        if (answer.trim().startsWith('A:')) {
            return res.send({ tag: 'success', promptReturn: answer.trim().slice(2).trim() })
        } else {
            return res.send({ tag: 'success', promptReturn: answer.trim() })
        }

        // return res.send({
        //     tag: 'success',
        //     promptReturn: 'The answer is: $$\\lim_{n \\to \\infty} a_n = \\lim_{n \\to \\infty} \\left( \\frac{n-1}{n} \\right)^n = \\lim_{n \\to \\infty} \\left( 1 - \\frac{1}{n} \\right)^n = e^{-1}$$',
        // })

        // return res.send({
        //     tag: 'success',
        //     promptReturn: '$$\\frac{d}{dx}\\left(1/x+1/x^2\\right)=1 \\Rightarrow \\frac{d}{dx}\\left(\\frac{1}{x} + \\frac{1}{x^2}\\right) = 1 \\Rightarrow \\frac{-1}{x^2}$$'
        // })

    } catch (e) {
        // somehow, JSON.stringify() returns an empty object
        console.log('Error in chatGPT:', e, String(e))
        res.status(500).send({ tag: 'error', error: String(e) })
    }
}

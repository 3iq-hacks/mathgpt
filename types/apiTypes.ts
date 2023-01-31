import z from 'zod'

export const ApiSchema = z.object({
    prompt: z.string()
})

export type ApiSchema = z.infer<typeof ApiSchema>

const OpenAIApiErrorData = z.object({
    status: z.number(),
    statusText: z.string()
})

// this attempts to parse the error we get from a catch statement
export const OpenAIAPIError = z.object({
    response: OpenAIApiErrorData
})


export const ApiReturnSchema = z.union([
    z.object({ tag: z.literal('success'), promptReturn: z.string() }),
    z.object({ tag: z.literal('error'), error: z.string() }),
    z.object({ tag: z.literal('openAIAPIError'), data: OpenAIApiErrorData })
])


export type ApiReturnSchema = z.infer<typeof ApiReturnSchema>
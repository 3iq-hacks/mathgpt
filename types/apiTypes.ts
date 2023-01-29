import z from 'zod'

export const ApiSchema = z.object({
    prompt: z.string()
})

export type ApiSchema = z.infer<typeof ApiSchema>

export const ApiReturnSchema = z.union([
    z.object({ tag: z.literal('success'), promptReturn: z.string() }),
    z.object({ tag: z.literal('error'), error: z.string() })
])

export type ApiReturnSchema = z.infer<typeof ApiReturnSchema>
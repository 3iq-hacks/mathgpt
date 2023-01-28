import z from 'zod'

export const ApiSchema = z.object({
    prompt: z.string()
})

export type ApiSchema = z.infer<typeof ApiSchema>

export const ApiReturnSchema = z.object({
    promptReturn: z.string()
})

export type ApiReturnSchema = z.infer<typeof ApiReturnSchema>
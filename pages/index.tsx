import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import React, { useEffect, useState, useReducer } from 'react';
import dynamic from 'next/dynamic';
import {
    Button, ButtonGroup, Select,
    Text, Card, Box, useToast,
    Alert, AlertTitle, AlertDescription, AlertIcon,
    Accordion, AccordionButton, AccordionItem, AccordionPanel, AccordionIcon,
    Input
} from '@chakra-ui/react'
import { Grid } from 'react-loading-icons'
import { ApiReturnSchema } from '@/types/apiTypes';
import { CopyIcon } from '@chakra-ui/icons';

const EquationInput: React.FC<{ setLatex: React.Dispatch<React.SetStateAction<string>>, latex: string }> = ({ setLatex, latex }) => {
    return (
        <Box width='full'>
            <Text fontSize='sm'>Enter LaTeX</Text>
            <DynamicMathField latex={latex} onChange={(mathField) => { setLatex(mathField.latex()) }} />
        </Box>
    )
}

const DynamicMathField = dynamic(() => import('react18-mathquill').then(mod => {
    mod.addStyles()
    return mod.EditableMathField
}), {
    ssr: false,
});

const StaticMathField = dynamic(() => import('@/components/StaticMath'), {
    ssr: false,
});

type Answer = { tag: 'idle' } | { tag: 'loading' } | { tag: 'success', response: string } | { tag: 'error', error: string }

const ShowAnswer: React.FC<{ answer: Answer }> = ({ answer }) => {
    const toast = useToast()

    if (answer.tag === 'idle') {
        return null
    }

    if (answer.tag === 'loading') {
        const loadingTexts = [
            'Completing your homework',
            'Generating Latex',
            'Consulting the AI Singularity',
            'Solving the P vs NP problem',
            'Running superior wolfram alpha',
            'Doing super complex computations'
        ]
        // https://stackoverflow.com/a/5915122
        const randText = loadingTexts[loadingTexts.length * Math.random() | 0]
        return <Box display='flex' alignItems='center' flexDirection='column' gap={2}>
            <Text fontSize='md'>{randText}...</Text>
            <Grid />
        </Box>
    }

    if (answer.tag === 'error') {
        return <Alert status='error'>
            <AlertIcon />
            <Box>
                <AlertTitle>There was an error!</AlertTitle>
                <AlertDescription>
                    Error {answer.error}
                </AlertDescription>
            </Box>
        </Alert>
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(answer.response)
        toast({
            title: 'Copied to clipboard!',
            status: 'info',
            duration: 9000,
            isClosable: true,
        })
    }

    return (
        <Box display='flex' alignItems='center' w='full' pt='4' pb='4'>
            <Box w='full'>
                <StaticMathField src={answer.response} id='apiAnswer' />
            </Box>
            <Button onClick={() => copyToClipboard()}>
                <CopyIcon />
            </Button>
        </Box>
    )
}

interface CustomPromptInputProps {
    dropdownData: DropdownData
    dropdownDispatch: React.Dispatch<DropdownAction>
}
const CustomPromptInput: React.FC<CustomPromptInputProps> = ({ dropdownData, dropdownDispatch }) => {
    const [error, setError] = useState(false)
    if (dropdownData.value !== 'Custom') {
        return null
    }

    return (
        <Input
            isInvalid={error}
            placeholder='Enter custom prompt!'
            variant='outline'
            bgGradient='none'
            bgColor='transparent'
            border='1px solid var(--chakra-colors-whiteAlpha-300)'
            onBlur={() => { if (dropdownData.customPrompt === '') { setError(true) } else { setError(false) } }}
            onChange={(e) => dropdownDispatch({ tag: 'ChangeCustom', value: e.target.value })} />
    )
}

type DropdownData = {
    value: Dropdown,
    customPrompt: string
}

const dropdowns = ['Solve', 'Find x', 'Custom'] as const;
type Dropdown = typeof dropdowns[number];
type dropdownPrompts = {
    [Property in typeof dropdowns[number]]: string
};
const promptify = (data: DropdownData, latex: string): string => {
    const promptDict: dropdownPrompts = {
        'Solve': 'Solve the following',
        'Find x': 'Find x in the following',
        'Custom': data.customPrompt
    }

    return `${promptDict[data.value]}: $$${latex}$$`
}

type DropdownAction = Dropdown | { tag: 'ChangeCustom', value: string }

function dropdownReducer(state: DropdownData, action: DropdownAction): DropdownData {
    if (action === 'Solve') {
        return { ...state, value: 'Solve' }
    } else if (action === 'Find x') {
        return { ...state, value: 'Find x' }
    } else if (action === 'Custom') {
        return { ...state, value: 'Custom' }
    } else {
        return { ...state, customPrompt: action.value }
    }
}
type DropdownReducer = typeof dropdownReducer;

export default function Home() {
    const [latex, setLatex] = useState('\\frac{1}{\\sqrt{2}}\\cdot 2')
    const [answer, setAnswer] = useState<Answer>({ tag: 'idle' })
    const [dropdownState, dropdownDispatch] = useReducer<DropdownReducer>(dropdownReducer, { value: 'Custom', customPrompt: '' })
    const toast = useToast()

    const demo1 = () => {
        setLatex('\\frac{1}{\\sqrt{2}}\\cdot 2')
        dropdownDispatch('Solve')
    }

    const demo2 = () => {
        setLatex('\\frac{d}{dx} 1/x+1/x^2')
        dropdownDispatch('Find x')
    }

    const handleSubmit = async () => {
        if (dropdownState.value === 'Custom' && dropdownState.customPrompt === '') {
            toast({
                title: 'Malformed Input.',
                description: 'Please enter in a custom prompt!',
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
            return
        }

        setAnswer({ tag: 'loading' })

        const prompt = promptify(dropdownState, latex)
        try {
            const response = await fetch('api/gpt3', {
                method: 'POST',
                // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
                body: JSON.stringify({ prompt })
            })
            const responseJson = await response.json()
            const parsed = ApiReturnSchema.safeParse(responseJson)
            if (!parsed.success) {
                setAnswer({ tag: 'error', error: 'Error parsing result: ' + parsed.error.toString() })
            } else {
                setAnswer({ tag: 'success', response: parsed.data.promptReturn })
            }
        } catch (e) {
            setAnswer({ tag: 'error', error: JSON.stringify(e) })
        }
    }

    return (
        <>
            <Head>
                <title>Math GPT</title>
                <meta name="description" content="Awesome math" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <Card
                    padding="3em"
                    borderRadius="20px"
                    bgGradient={'linear(to-b, #34302F, #666261)'}
                    borderWidth={'5px'}
                    borderColor={'#0C1220'}
                    gap={8}
                    maxW='3xl'
                    width='full'>
                    <Text bgGradient='linear(to-l, #7928CA, #FF0080)' bgClip='text' fontSize='70px' fontWeight='extrabold'>Math GPT</Text>
                    <Select size='md'
                        value={dropdownState.value}
                        onChange={(e) => dropdownDispatch(e.target.value.toString() as Dropdown)}>
                        {dropdowns.map(dropdownVal => <option value={dropdownVal} key={dropdownVal}>{dropdownVal}</option>)}
                    </Select>
                    <CustomPromptInput dropdownDispatch={dropdownDispatch} dropdownData={dropdownState} />
                    <EquationInput setLatex={setLatex} latex={latex} />
                    <Accordion allowMultiple={true}>
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box as="span" flex='1' textAlign='left'>
                                        View GPT Prompt
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <Text fontSize='sm' as='kbd'>{promptify(dropdownState, latex)}</Text>
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                    <Button fontSize="25px" marginTop="40px" textColor={'white'} bgGradient='linear(to-r, #7928CA, #FF0080)' colorScheme='teal' onClick={() => handleSubmit()}>Calculate!</Button>
                    <ShowAnswer answer={answer} />
                </Card>
                <Card gap={8} margin="20px" padding="15px">
                    <Text fontSize='25px'>Try some equations!</Text>
                    <Button textColor={'white'} bgGradient='linear(to-r, #187D71, #151394)' colorScheme='teal' onClick={() => demo1()}>Try solving!</Button>
                    <Button textColor={'white'} bgGradient='linear(to-r, #8D9C0E, #359600)' colorScheme='teal' onClick={() => demo2()}>Try finding x!</Button>
                </Card>
            </main>
        </>
    )
}

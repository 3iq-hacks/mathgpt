import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
    Button, ButtonGroup, Select,
    ChakraProvider, extendTheme, type ThemeConfig,
    Text, Card, CloseButton, Box,
    Alert, AlertTitle, AlertDescription, AlertIcon,
    useDisclosure,
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
type Custom = { tag: 'true' } | { tag: 'false' }

// const PromptInput: React.FC<{ custom: Custom }> = ({ custom }) => {
//     return <Input value={'Enter custom prompt'} visibility={custom.tag === 'true' ? visible : none}>Enter custom prompt: </Input>
//     if (custom.tag === 'true') {
//         return <Input>Enter custom prompt</Input>
//     }

//     return null;
// }

const ShowAnswer: React.FC<{ answer: Answer }> = ({ answer }) => {
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

    return (
        <Box display="flex" alignItems="center">
            <Box p='6'>
                <StaticMathField src={answer.response} id='apiAnswer' />
            </Box>
            <Button onClick={() => { navigator.clipboard.writeText(answer.response) }}>
                <CopyIcon />
            </Button>
        </Box>
    )
}


const dropdowns = ['Solve', 'Find x', 'Prove', 'Custom'] as const;
type Dropdown = typeof dropdowns[number];
type dropdownPrompts = {
    [Property in typeof dropdowns[number]]: string
};
const promptify = (dropdown: Dropdown, latex: string): string => {
    const promptDict: dropdownPrompts = {
        'Solve': 'Solve the following',
        'Find x': 'Find x in the following',
        'Prove': 'Prove the following',
        'Custom': 'TODO'
    }

    return `${promptDict[dropdown]}: $$${latex}$$`
}


export default function Home() {
    const [latex, setLatex] = useState('\\frac{1}{\\sqrt{2}}\\cdot 2')
    const [answer, setAnswer] = useState<Answer>({ tag: 'idle' })
    const [dropdownValue, setDropdownValue] = useState<Dropdown>('Solve')

    const demo1 = () => {
        setLatex('\\frac{1}{\\sqrt{2}}\\cdot 2')
        setDropdownValue('Solve')
    }

    const demo2 = () => {
        setLatex('\\frac{d}{dx} 1/x+1/x^2')
        setDropdownValue('Find x')
    }

    const demo3 = () => {
        setLatex('\\int_{-\\infty}^{\\infty} \\frac{e^{ix}}{{e^x+e^{-x}}}dx')
        setDropdownValue('Solve')
    }

    const handleClick = async () => {
        setAnswer({ tag: 'loading' })
        const data = {
            prompt: promptify(dropdownValue, latex)
        }
        try {
            const response = await fetch('api/gpt3', {
                method: 'POST',
                // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
                body: JSON.stringify(data)
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
            <ChakraProvider>
                <Head>
                    <title>Math GPT</title>
                    <meta name="description" content="Awesome math" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <main className={styles.main}>
                    <Card padding="3em" borderRadius="20px" bgGradient={'linear(to-b, #34302F, #666261)'} borderWidth={'5px'} borderColor={'#0C1220'} gap={8}>
                        <Text bgGradient='linear(to-l, #7928CA, #FF0080)' bgClip='text' fontSize='70px' fontWeight='extrabold'>Math GPT</Text>
                        <Select size='md'
                            value={dropdownValue || ''}
                            onChange={(e) => setDropdownValue(e.target.value.toString() as Dropdown)}>
                            {dropdowns.map(dropdownVal => <option value={dropdownVal} key={dropdownVal}>{dropdownVal}</option>)}
                        </Select>
                        {/* <PromptInput></PromptInput> */}
                        <EquationInput setLatex={setLatex} latex={latex} />
                        <Accordion>
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
                                    <Text fontSize='sm' as='kbd'>{promptify(dropdownValue, latex)}</Text>
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                        <Button fontSize="25px" marginTop="40px" textColor={'white'} bgGradient='linear(to-r, #7928CA, #FF0080)' colorScheme='teal' onClick={() => handleClick()}>Calculate!</Button>
                        <ShowAnswer answer={answer} />
                    </Card>
                    <Card gap={8} margin="20px" padding="15px">
                        <Text fontSize='25px'>Try some equations!</Text>
                        <Button textColor={'white'} bgGradient='linear(to-r, #187D71, #151394)' colorScheme='teal' onClick={() => demo1()}>Try solving!</Button>
                        <Button textColor={'white'} bgGradient='linear(to-r, #8D9C0E, #359600)' colorScheme='teal' onClick={() => demo2()}>Try finding x!</Button>
                        <Button textColor={'white'} bgGradient='linear(to-r, #a33400, #5C2055)' colorScheme='teal' onClick={() => demo3()}>Try proving!</Button>
                    </Card>

                </main>
            </ChakraProvider>
        </>
    )
}

import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import React, { useState, useReducer } from 'react';
import dynamic from 'next/dynamic';
import {
    Button, Select, Text, Card, Box, useToast,
    Accordion, AccordionButton, AccordionItem, AccordionPanel, AccordionIcon, Input, Center
} from '@chakra-ui/react'
import { ApiReturnSchema } from '@/types/apiTypes';
import ShowAnswer, { AnswerState } from '@/components/Answer';
import Footer from '@/components/Footer';


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
        'Custom': data.customPrompt,
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
    const [answer, setAnswer] = useState<AnswerState>({ tag: 'idle' })
    const [dropdownState, dropdownDispatch] = useReducer<DropdownReducer>(dropdownReducer, { value: 'Solve', customPrompt: '' })
    const toast = useToast()

    const demo1 = () => {
        setLatex('\\int x^{5}dx')
        dropdownDispatch('Solve')
    }

    const demo2 = () => {
        setLatex('x^2+x+1=2')
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
            console.log('Got response', responseJson)
            const parsed = ApiReturnSchema.safeParse(responseJson)
            if (!parsed.success) {
                // if we used typc, we wouldn't be in this situation...
                setAnswer({ tag: 'error', error: 'Error parsing result: ' + parsed.error.toString() })
            } else {
                console.log('Got answer', parsed.data)
                setAnswer(parsed.data);
            }
        } catch (e) {
            setAnswer({ tag: 'error', error: JSON.stringify(e) })
        }
    }

    return (
        <>
            <Head>
                <title>Math GPT</title>
                <meta name="description" content="GPT-3 Powered Math Solutions" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <Card bg="red" padding={20} margin={10}>
                <Center>
                <Text fontSize="4xl">THIS PROJECT IS DISCONTINUED BECAUSE IT COSTS MONEY TO ASK GPT THINGS</Text>
                <Text _hover={{color:  'black'}} onClick={() => window.open("https://youtu.be/maNg5wqEq3U")} fontSize='4xl'>WATCH A VIDEO DEMO INSTEAD TO SEE HOW IT WORKS</Text>
                </Center>
                </Card>
                <Card
                    padding="3em"
                    borderRadius="20px"
                    bgGradient={'linear(to-b, #34302F, #666261)'}
                    borderWidth={'5px'}
                    borderColor={'#0C1220'}
                    gap={8}
                    maxW='5xl'
                    width='full'>
                    <Box textAlign='center'>
                        <Text align="center" bgGradient='linear(to-l, #6931E0, #D41795)' bgClip='text' fontSize='70px' fontWeight='extrabold'>Math GPT</Text>
                        <Text fontSize='2xl' fontStyle='italic' align='center'>Solving Math with GPT-3</Text>
                    </Box>
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
                    <Button fontSize="25px" marginTop="40px" textColor={'white'} bgGradient='linear(to-r, #7928CA, #FF0080)' colorScheme='teal'>Calculate!</Button>
                    <ShowAnswer answer={answer} />
                </Card>
                <img width='50px' height='50px' src='https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fs3.amazonaws.com%2Fappforest_uf%2Ff1627321328331x304585140651317100%2Fopenai.gif?w=&h=&auto=compress&dpr=1&fit=max' />
                <Card gap={8} margin="20px" padding="15px">
                    <Text fontSize='25px'>Try some equations!</Text>
                    <Button textColor={'white'} bgGradient='linear(to-r, #187D71, #151394)' colorScheme='teal' onClick={() => demo1()}>Try solving!</Button>
                    <Button textColor={'white'} bgGradient='linear(to-r, #8D9C0E, #359600)' colorScheme='teal' onClick={() => demo2()}>Try finding x!</Button>
                </Card>
                <Footer />
            </main>
        </>
    )
}

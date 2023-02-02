import { ApiReturnSchema } from '@/types/apiTypes'
import { useToast, Box, Text, Alert, AlertIcon, AlertDescription, AlertTitle, Button, Link } from '@chakra-ui/react'
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Grid } from 'react-loading-icons'
import dynamic from 'next/dynamic';
import NextLink from 'next/link'

// shows the answer, or its loading state

const StaticMathField = dynamic(() => import('@/components/StaticMath'), {
    ssr: false,
});

export type AnswerState = { tag: 'idle' } | { tag: 'loading' } | ApiReturnSchema

const ShowAnswer: React.FC<{ answer: AnswerState }> = ({ answer }) => {
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
                    <Text as='b'>Message:</Text> {answer.error}
                </AlertDescription>
            </Box>
        </Alert>
    }

    if (answer.tag === 'openAIAPIError' && answer.data.statusText === 'Too Many Requests') {
        return <Alert status='error'>
            <AlertIcon />
            <Box>
                <AlertTitle>Rate Limit Reached!</AlertTitle>
                <AlertDescription>
                    <Text>We're sorry, we've seemed to hit out maximum monthly spending limit for OpenAI's API (we're poor students!)</Text>
                    If you're interested in this project, check out our
                    <Link color='#c5aaff' href='https://devpost.com/software/math-gpt'> Hackathon's devpost <ExternalLinkIcon /></Link>,
                    <Link as={NextLink} color='#c5aaff' href='https://github.com/3iq-hacks/mathgpt#running-locally' isExternal> Run this yourself <ExternalLinkIcon /> </Link> or get in contact with us!
                </AlertDescription>
            </Box>
        </Alert>
    }

    if (answer.tag === 'openAIAPIError') {
        return <Alert status='error'>
            <AlertIcon />
            <Box>
                <AlertTitle>OpenAI API Error</AlertTitle>
                <AlertDescription>
                    <Text>Status code: {answer.data.status}</Text>
                    <Text>Status text: {answer.data.statusText}</Text>
                </AlertDescription>
            </Box>
        </Alert>
    }


    const copyToClipboard = () => {
        navigator.clipboard.writeText(answer.promptReturn)
        toast({
            title: 'Copied to clipboard!',
            status: 'info',
            duration: 9000,
            isClosable: true,
        })
    }

    return (
        <Box display='flex' alignItems='center' w='full' pt='4' pb='4'>
            <Box w='full' overflowX='auto' pt='4' pb='4' mr='2'>
                <StaticMathField src={answer.promptReturn} id='apiAnswer' />
            </Box>
            <Button onClick={() => copyToClipboard()}>
                <CopyIcon />
            </Button>
        </Box>
    )
}

export default ShowAnswer;

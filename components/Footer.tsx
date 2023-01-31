import { Container, Stack, ButtonGroup, IconButton, Text } from '@chakra-ui/react'
import { FaGithub } from 'react-icons/fa'


export default () => (
    <Container as="footer" role="contentinfo" pt={{ base: '12', md: '16' }}>
        <Stack spacing={{ base: '4', md: '5' }}>
            <Stack justify="space-between" direction="row" align="center">
                <Text fontSize="sm" color="subtle">
                    MathGPT, built for Hackrithmitic 2 2023
                </Text>
                <ButtonGroup variant="ghost">
                    <IconButton as="a" href="https://github.com/3iq-hacks/mathgpt" aria-label="GitHub" icon={<FaGithub fontSize="1.25rem" />} />
                </ButtonGroup>
            </Stack>
        </Stack>
    </Container>
)

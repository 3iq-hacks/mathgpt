import { Html, Head, Main, NextScript } from 'next/document'
import theme from '@/lib/theme'
import { ColorModeScript } from '@chakra-ui/react'


export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link rel="stylesheet" href="https://unpkg.com/mathlive/dist/mathlive-static.css" />
            </Head>
            <body>
                <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}

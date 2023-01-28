import { useState } from 'react'
import { EditableMathField } from 'react-mathquill'

const EditableMathExample = () => {
    const [latex, setLatex] = useState('\\frac{1}{\\sqrt{2}}\\cdot 2')

    return (
        <div>
            <EditableMathField
                latex={latex}
                onChange={(mathField) => {
                    setLatex(mathField.latex())
                }}
            />
            <p>{latex}</p>
        </div>
    )
}


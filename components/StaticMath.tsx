import { renderMathInElement } from 'mathlive';
import { useEffect } from 'react';


interface StaticMathProps {
    src: string,
    id: string // unique id to refer to the static math
}
const StaticMath: React.FC<StaticMathProps> = ({ src, id }) => {
    useEffect(() => {
        const staticMathElement = document.getElementById(id)
        if (!staticMathElement) {
            console.log('WARN: couldn\'t find static math element!')
        } else {
            renderMathInElement(staticMathElement)
        }
    }, [])
    return <div id={id}>{src}</div>
}

export default StaticMath;
// index.d.ts

import { DOMAttributes } from "react";
import { MathfieldElementAttributes } from 'mathlive'

type CustomElement<T> = Partial<T & DOMAttributes<T>>;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ["math-field"]: CustomElement<MathfieldElementAttributes>;
        }
    }
}
// src/components/blocks/EquationBlock.jsx

import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

export default function EquationBlock({ equation }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <BlockMath math={equation || ''} />
    </div>
  );
}
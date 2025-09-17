// src/components/blocks/CodeBlock.jsx

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ language, code }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-6 ">
      <SyntaxHighlighter language={language} style={dracula}>
        {code || ''}
      </SyntaxHighlighter>
    </div>
  );
}
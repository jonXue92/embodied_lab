import katex from 'katex';

export default function Formula({ latex, explanation }: { latex: string; explanation: string }) {
  const markup = katex.renderToString(latex, {
    displayMode: true, throwOnError: false, strict: 'warn',
    trust: false, output: 'htmlAndMathml',
  });
  // Only repository-authored formulas; KaTeX trust is disabled.
  return <figure className="lesson-formula">
    <div className="formula-scroll" dangerouslySetInnerHTML={{ __html: markup }} />
    <figcaption>{explanation}</figcaption>
  </figure>;
}

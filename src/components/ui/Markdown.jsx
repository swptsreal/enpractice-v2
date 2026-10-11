import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Markdown renderer for AI output, styled with the v2 tokens.
 *
 * SECURITY — why this does NOT use `rehype-raw`, unlike v1's `CustomMarkdown`:
 *
 * `rehype-raw` parses embedded HTML in the markdown source. The source here is
 * model output arriving token by token over a WebSocket, so any `<script>`, `<img
 * onerror=...>` or `<iframe>` the model emits (or that a prompt-injection in a
 * looked-up word coaxes out of it) becomes live DOM. React escapes text children,
 * but `rehype-raw` deliberately opts out of that.
 *
 * `react-markdown` with only `remark-gfm` renders markdown and leaves raw HTML as
 * inert text, which is the correct default for untrusted content. Dropping the
 * plugin costs nothing here: the explain output is headings, lists, bold and
 * tables, all of which are real markdown and none of which need raw HTML.
 *
 * STREAMING — the renderer is given partial markdown on purpose. An unterminated
 * `**` or an open table renders as literal text until the rest arrives, which reads
 * as "still being written" and is why the caller appends a skeleton rather than
 * hiding the partial result.
 *
 * `react-markdown` v10 dropped the `inline` prop that v1's component branches on,
 * so inline code is detected from the absence of a language class and of newlines
 * instead.
 */
/* react-markdown passes a 
ode (the AST node) alongside DOM props. Spreading it
   onto a DOM element warns, so every renderer strips it. It is named _node to
   match the repo's allowed-unused-args pattern rather than being silently dropped. */
const COMPONENTS = {
    h1: ({ node: _node, ...rest }) => <h1 className="t-h2 mt-4 mb-2 first:mt-0" {...rest} />,
    h2: ({ node: _node, ...rest }) => <h2 className="t-h3 mt-3.5 mb-2 first:mt-0" {...rest} />,
    h3: ({ node: _node, ...rest }) => <h3 className="t-label mt-3 mb-1.5 first:mt-0" {...rest} />,
    p: ({ node: _node, ...rest }) => <p className="t-body mb-2.5 last:mb-0" {...rest} />,
    ul: ({ node: _node, ...rest }) => <ul className="mb-2.5 list-disc space-y-1 pl-5" {...rest} />,
    ol: ({ node: _node, ...rest }) => <ol className="mb-2.5 list-decimal space-y-1 pl-5" {...rest} />,
    li: ({ node: _node, ...rest }) => <li className="t-body" {...rest} />,
    strong: ({ node: _node, ...rest }) => <strong className="font-extrabold text-[var(--ink)]" {...rest} />,
    em: ({ node: _node, ...rest }) => <em className="italic" {...rest} />,
    blockquote: ({ node: _node, ...rest }) => (
        <blockquote
            className="t-body soft my-2.5 border-l-4 border-[var(--amber)] bg-[var(--amber-soft)] py-1.5 pl-4"
            {...rest}
        />
    ),
    a: ({ node: _node, ...rest }) => (
        <a
            className="font-bold text-[var(--teal)] underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
            {...rest}
        />
    ),
    code: ({ node: _node, className, children, ...rest }) => {
        const text = String(children ?? '');
        const isBlock = Boolean(className) || text.includes('\n');
        if (isBlock) {
            return (
                /* `--surface-alt` rather than a bespoke code token: it already has a
                   verified contrast pair in scripts/contrast-check.mjs, and adding a
                   one-off colour would sidestep that gate. */
                <pre className="my-2.5 overflow-x-auto rounded-[var(--r-sm)] border-2 border-[var(--border)] bg-[var(--surface-alt)] p-3">
                    <code className="t-mono" {...rest}>
                        {children}
                    </code>
                </pre>
            );
        }
        return (
            <code
                className="t-mono rounded-[var(--r-sm)] bg-[var(--teal-soft)] px-1.5 py-0.5 text-[var(--teal)]"
                {...rest}
            >
                {children}
            </code>
        );
    },
    /* Tables scroll in their own container so a wide table never forces the page
       itself sideways on a phone — the same fix the notebook and history lists use. */
    table: ({ node: _node, ...rest }) => (
        <div className="my-3 overflow-x-auto rounded-[var(--r-sm)] border-2 border-[var(--border)]">
            <table className="w-full border-collapse text-sm" {...rest} />
        </div>
    ),
    thead: ({ node: _node, ...rest }) => <thead className="bg-[var(--surface-alt)]" {...rest} />,
    tbody: ({ node: _node, ...rest }) => <tbody className="divide-y-2 divide-[var(--border)]" {...rest} />,
    tr: ({ node: _node, ...rest }) => <tr {...rest} />,
    th: ({ node: _node, ...rest }) => (
        <th
            className="t-micro border-b-2 border-[var(--border)] px-3 py-2 text-left font-extrabold uppercase tracking-wider text-[var(--ink-muted)]"
            {...rest}
        />
    ),
    td: ({ node: _node, ...rest }) => <td className="t-body px-3 py-2" {...rest} />,
    hr: ({ node: _node, ...rest }) => <hr className="my-4 border-t-2 border-[var(--border)]" {...rest} />,
};

export function Markdown({ content = '', className, components }) {
    const merged = useMemo(() => ({ ...COMPONENTS, ...components }), [components]);

    return (
        <div className={className}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={merged}>
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default Markdown;

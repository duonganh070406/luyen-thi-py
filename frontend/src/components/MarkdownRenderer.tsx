import React, { memo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import MermaidRenderer from './MermaidRenderer';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS = [rehypeRaw, rehypeKatex];

// Định nghĩa components bên ngoài để tái sử dụng
const renderComponents: Components = {
  h1: ({ node, children }) => (
    <h1
      id={node?.position?.start?.line ? `heading-l${node.position.start.line}` : undefined}
      className="text-2xl font-bold mb-4 text-slate-800 scroll-mt-6"
    >
      {children}
    </h1>
  ),
  h2: ({ node, children }) => (
    <h2
      id={node?.position?.start?.line ? `heading-l${node.position.start.line}` : undefined}
      className="text-xl font-bold mb-3 text-slate-800 scroll-mt-6"
    >
      {children}
    </h2>
  ),
  h3: ({ node, children }) => (
    <h3
      id={node?.position?.start?.line ? `heading-l${node.position.start.line}` : undefined}
      className="text-lg font-bold mb-2 text-slate-800 scroll-mt-6"
    >
      {children}
    </h3>
  ),
  h4: ({ node, children }) => (
    <h4
      id={node?.position?.start?.line ? `heading-l${node.position.start.line}` : undefined}
      className="text-base font-bold mb-2 text-slate-700 scroll-mt-6"
    >
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="mb-4 leading-relaxed last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="text-slate-700">{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-slate-800">{children}</strong>,
  em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const isMermaid = match && match[1] === 'mermaid';

    if (isMermaid) {
      const chartContent = String(children).replace(/\n$/, '');
      return <MermaidRenderer chart={chartContent} />;
    }

    const isBlock = !!className || String(children).includes('\n');
    if (isBlock) {
      return (
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed shadow-inner my-4">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    }

    return (
      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-sm border border-slate-200" {...props}>
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-indigo-200 pl-4 italic text-slate-600 my-4 bg-slate-50/50 py-2 pr-4 rounded-r-lg">
      {children}
    </blockquote>
  ),
  img: ({ src, alt }) => {
    if (!src) return null;
    const resolvedSrc = src.startsWith('/data/')
      ? `${API_BASE}${src}`
      : src;
    return (
      <span className="block my-4">
        <img
          src={resolvedSrc}
          alt={alt || ''}
          className="max-w-full rounded-2xl border border-slate-200 shadow-sm bg-white"
          style={{ maxHeight: '400px', objectFit: 'contain' }}
          loading="lazy"
        />
        {alt && (
          <span className="block text-center text-xs text-slate-400 mt-1 italic">{alt}</span>
        )}
      </span>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => <th className="px-4 py-3 bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-left">{children}</th>,
  td: ({ children }) => <td className="px-4 py-3 text-slate-600 border-t border-slate-100">{children}</td>,
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = memo(function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={renderComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export default MarkdownRenderer;

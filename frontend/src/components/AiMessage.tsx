"use client";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AiMessage({ text }: { text: string }) {
  return (
    <div className="ai-message-wrapper">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => <h1 className="text-xl font-bold mt-6 mb-3 leading-tight">{children}</h1>,
          h2: ({children}) => <h2 className="text-lg font-bold mt-5 mb-2 leading-tight">{children}</h2>,
          h3: ({children}) => <h3 className="text-base font-bold mt-5 mb-2 leading-tight">{children}</h3>,
          p: ({children}) => {
            return <p className="my-3 leading-[1.9] text-[15px] whitespace-pre-wrap break-words" dir="auto">{children}</p>;
          },
          ul: ({children}) => <ul className="my-3 space-y-2 pr-6 list-disc marker:text-amber-500" dir="auto">{children}</ul>,
          ol: ({children}) => <ol className="my-3 space-y-2 pr-6 list-decimal marker:text-amber-500" dir="auto">{children}</ol>,
          li: ({children}) => <li className="leading-7" dir="auto">{children}</li>,
          strong: ({children}) => <strong className="font-bold text-amber-300">{children}</strong>,
          code({node, inline, className, children, ...props}: any) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            if (!inline) {
              return (
                <div className="my-4 rounded-xl overflow-hidden border border-white/10" dir="ltr">
                  {lang && <div className="bg-[#1a1a1a] text-xs text-stone-400 px-4 py-2 border-b border-white/10 font-mono uppercase">{lang}</div>}
                  <pre className="bg-[#0a0a0a] p-4 overflow-x-auto" dir="ltr">
                    <code className="text-sm font-mono text-[#e5e5e5] leading-6" {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }
            return (
              <code className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded-md text-[13px] font-mono text-amber-200 mx-0.5" dir="ltr" {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({children}) => <blockquote className="border-r-4 border-amber-500/50 pr-4 my-4 italic opacity-80">{children}</blockquote>,
        }}
      >
        {text}
      </ReactMarkdown>

      <style jsx>{`
        .ai-message-wrapper :global(p) {
          unicode-bidi: plaintext;
        }
        .ai-message-wrapper :global(code) {
          unicode-bidi: plaintext;
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Zap, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

const AI_AVATAR = "https://static.prod-images.emergentagent.com/jobs/1e633876-7148-4142-8a3d-10cb5ae62c39/images/a80f1ac106d58a9eef96d6d5cb0fa44a447f3c41fe6027801bd85c2e225ab8ee.png";
const APP_URL = window.location.origin;

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in-up" data-testid="typing-indicator">
      <img src={AI_AVATAR} alt="AI" className="mt-1 h-8 w-8 shrink-0 rounded-sm border border-amber-400/40" />
      <div className="border-l-2 border-amber-400 py-2 pl-4">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" style={{ animationDelay: '300ms' }} />
          <span className="ml-2 text-xs font-mono text-zinc-500">cooking a roast...</span>
        </div>
      </div>
    </div>
  );
}

function TypewriterText({ text }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    let i = 0;
    setDisplayed('');
    setDone(false);
    const speed = Math.max(8, Math.min(25, 2000 / text.length));
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-amber-400" />}
    </span>
  );
}

function CopyTextButton({ content, title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const shareText = title === 'Share this roast'
      ? `mini malist just roasted me:\n\n"${content}"\n\nGet roasted at ${APP_URL}`
      : content;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success(title === 'Share this roast' ? 'Roast copied! Share it everywhere.' : 'Message copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1 text-zinc-600 transition-all duration-150 hover:text-amber-400"
      title={title}
      aria-label={title}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function MessageBubble({ message, isLatestAI }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in-up" data-testid={`message-${message.id}`}>
        <div className="group flex max-w-[80%] items-end gap-2">
          <div className="rounded-2xl border border-blue-400/20 bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-3 shadow-[0_12px_35px_rgba(2,6,23,0.38)]">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-50 font-mono">{message.content}</p>
          </div>
          <div className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <CopyTextButton content={message.content} title="Copy message" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3 animate-fade-in-up" data-testid={`message-${message.id}`}>
      <img src={AI_AVATAR} alt="AI" className="mt-1 h-8 w-8 shrink-0 rounded-sm border border-blue-400/30 bg-slate-800" />
      <div className="max-w-[85%] flex-1 border-l-2 border-blue-400/70 pl-4 py-1">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200 font-mono">
          {isLatestAI ? <TypewriterText text={message.content} /> : message.content}
        </p>
      </div>
      <div className="mt-1 shrink-0">
        <CopyTextButton content={message.content} title="Share this roast" />
      </div>
    </div>
  );
}

export default function ChatMessages({ messages, sending, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, sending]);

  let latestAIIdx = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      latestAIIdx = i;
      break;
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <span className="text-sm font-mono text-zinc-500">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-32 pt-4 md:pt-8" data-testid="chat-messages">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 md:px-8">
        {messages.length === 0 && !sending && (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="text-center">
              <Zap className="mx-auto mb-3 h-8 w-8 text-amber-400/20" />
              <p className="text-sm font-mono text-zinc-600">Type something... if you dare.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id || i}
            message={msg}
            isLatestAI={i === latestAIIdx && !sending}
          />
        ))}

        {sending && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

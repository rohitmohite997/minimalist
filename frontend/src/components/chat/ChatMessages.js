import React, { useEffect, useRef, useState } from 'react';
import { Flame } from 'lucide-react';

const AI_AVATAR = "https://static.prod-images.emergentagent.com/jobs/1e633876-7148-4142-8a3d-10cb5ae62c39/images/a80f1ac106d58a9eef96d6d5cb0fa44a447f3c41fe6027801bd85c2e225ab8ee.png";

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in-up" data-testid="typing-indicator">
      <img src={AI_AVATAR} alt="AI" className="w-8 h-8 border border-rose-500 shrink-0 mt-1" />
      <div className="border-l-4 border-rose-500 pl-4 py-2">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-rose-500 animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-rose-500 animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-rose-500 animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-zinc-600 text-xs font-mono mt-1">Roasting in progress...</p>
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
      {!done && <span className="inline-block w-0.5 h-4 bg-rose-500 ml-0.5 animate-pulse" />}
    </span>
  );
}

function MessageBubble({ message, isLatestAI }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in-up" data-testid={`message-${message.id}`}>
        <div className="bg-zinc-800/80 px-4 py-3 max-w-[80%] rounded-sm">
          <p className="text-zinc-100 text-sm font-mono whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 animate-fade-in-up" data-testid={`message-${message.id}`}>
      <img src={AI_AVATAR} alt="AI" className="w-8 h-8 border border-rose-500 shrink-0 mt-1" />
      <div className="border-l-4 border-rose-500 pl-4 py-1 max-w-[85%]">
        <p className="text-zinc-200 text-sm font-mono whitespace-pre-wrap leading-relaxed">
          {isLatestAI ? <TypewriterText text={message.content} /> : message.content}
        </p>
      </div>
    </div>
  );
}

export default function ChatMessages({ messages, sending, loading }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, sending]);

  // Find the latest AI message index
  let latestAIIdx = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      latestAIIdx = i;
      break;
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent animate-spin" />
          <span className="text-zinc-500 font-mono text-sm">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto pb-32 pt-4 md:pt-8"
      data-testid="chat-messages"
    >
      <div className="max-w-4xl mx-auto w-full px-4 md:px-8 space-y-6">
        {messages.length === 0 && !sending && (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center">
              <Flame className="w-10 h-10 text-rose-500/30 mx-auto mb-3" />
              <p className="text-zinc-600 font-mono text-sm">Kuch likh... darr mat.</p>
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

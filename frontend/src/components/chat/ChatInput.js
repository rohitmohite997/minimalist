import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Clipboard } from 'lucide-react';

export default function ChatInput({ onSend, sending }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    onSend(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) return;
      setText((prev) => {
        const nextValue = prev ? `${prev}${prev.endsWith('\n') ? '' : '\n'}${clipboardText}` : clipboardText;
        return nextValue;
      });
    } catch {
      // Ignore clipboard access issues; keyboard paste still works normally.
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-white/10 bg-slate-950/60 backdrop-blur-xl" data-testid="chat-input-area">
      <div className="mx-auto w-full max-w-4xl p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              data-testid="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything, in any language..."
              rows={1}
              disabled={sending}
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 p-4 pr-12 font-mono text-sm text-slate-50 placeholder:text-slate-500 outline-none transition-colors duration-150 focus:border-blue-400 disabled:opacity-50"
              style={{ minHeight: '52px', maxHeight: '160px' }}
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-12 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-800 p-2 text-slate-300 transition-all duration-200 hover:border-blue-400/30 hover:text-blue-300"
              aria-label="Paste from clipboard"
            >
              <Clipboard className="h-4 w-4" />
            </button>
          </div>
          <button
            data-testid="send-btn"
            type="submit"
            disabled={!text.trim() || sending}
            className={`h-[52px] w-[52px] shrink-0 rounded-2xl transition-all duration-200 ${
              text.trim() && !sending
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500'
                : 'cursor-not-allowed border border-white/10 bg-slate-800 text-slate-500'
            }`}
          >
            {sending ? (
              <Zap className="h-5 w-5 animate-pulse" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
          Copy, paste, and keep chatting.
        </p>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap } from 'lucide-react';

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md" data-testid="chat-input-area">
      <div className="max-w-4xl mx-auto w-full p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              data-testid="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything, in any language..."
              rows={1}
              disabled={sending}
              className="w-full resize-none border border-zinc-700 focus:border-amber-400 bg-zinc-900 text-white p-4 pr-12 font-mono text-sm placeholder:text-zinc-600 outline-none disabled:opacity-50 rounded-sm transition-colors duration-150"
              style={{ minHeight: '52px', maxHeight: '160px' }}
            />
          </div>
          <button
            data-testid="send-btn"
            type="submit"
            disabled={!text.trim() || sending}
            className={`w-[52px] h-[52px] flex items-center justify-center rounded-sm transition-all duration-150 shrink-0 ${
              text.trim() && !sending
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-black hover:from-amber-400 hover:to-rose-400 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
            }`}
          >
            {sending ? (
              <Zap className="w-5 h-5 animate-pulse" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-zinc-700 text-[10px] font-mono text-center mt-2">
          mini malist roasts in every language equally.
        </p>
      </div>
    </div>
  );
}

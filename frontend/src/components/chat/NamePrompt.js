import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Zap } from 'lucide-react';

export default function NamePrompt({ onSave, onSkip }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-md rounded-[28px] border border-white/10 bg-slate-900/90 p-6 text-slate-100 shadow-[0_30px_100px_rgba(2,6,23,0.8)] backdrop-blur-2xl" data-testid="name-prompt-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-100" style={{ fontFamily: 'Manrope' }}>
            <span className="text-slate-100">mini</span>{' '}
            <span className="text-blue-300">malist</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-300">
            What should we call you for this chat?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Input
            data-testid="name-prompt-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            autoFocus
            className="h-12 rounded-xl border border-white/10 bg-slate-800 text-slate-50 placeholder:text-slate-500 focus:border-blue-400"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              data-testid="name-prompt-save"
              disabled={!name.trim()}
              className={`flex-1 rounded-xl py-3 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-200 ${
                name.trim()
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500'
                  : 'cursor-not-allowed bg-slate-700 text-slate-500'
              }`}
            >
              <Zap className="mr-2 inline h-4 w-4" />
              Save
            </button>
            <button
              type="button"
              data-testid="name-prompt-skip"
              onClick={onSkip}
              className="rounded-xl border border-white/10 bg-slate-800 px-6 py-3 text-sm text-slate-300 transition-colors hover:border-blue-400/30 hover:text-white"
            >
              Skip
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
      <DialogContent className="bg-zinc-900 border-zinc-700 rounded-sm max-w-md sm:rounded-sm" data-testid="name-prompt-dialog">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 text-xl" style={{ fontFamily: 'Unbounded' }}>
            <span className="text-zinc-100">mini</span>{' '}
            <span className="text-amber-400">malist</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 font-mono text-sm">
            What's your name? So we can roast you personally.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            data-testid="name-prompt-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            autoFocus
            className="rounded-sm border-zinc-700 focus:border-amber-400 bg-zinc-950 text-white font-mono h-12 placeholder:text-zinc-600"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              data-testid="name-prompt-save"
              disabled={!name.trim()}
              className={`flex-1 py-3 font-bold uppercase tracking-widest text-sm rounded-sm transition-all duration-150 ${
                name.trim()
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-black hover:from-amber-400 hover:to-rose-400'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              LET'S GO
            </button>
            <button
              type="button"
              data-testid="name-prompt-skip"
              onClick={onSkip}
              className="px-6 py-3 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 font-mono text-sm rounded-sm transition-colors duration-150"
            >
              Skip
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Plus, MessageSquare, MoreHorizontal, Trash2, Pencil, Zap, Search, X, User } from 'lucide-react';
import { api } from '@/pages/ChatPage';

const AI_AVATAR = "https://static.prod-images.emergentagent.com/jobs/1e633876-7148-4142-8a3d-10cb5ae62c39/images/a80f1ac106d58a9eef96d6d5cb0fa44a447f3c41fe6027801bd85c2e225ab8ee.png";

const INTENSITY_LABELS = {
  1: { label: 'CHILL', color: 'text-emerald-400', bg: 'bg-emerald-400', desc: 'Light banter' },
  2: { label: 'SPICY', color: 'text-amber-400', bg: 'bg-amber-400', desc: 'Witty sarcasm' },
  3: { label: 'SAVAGE', color: 'text-orange-400', bg: 'bg-orange-400', desc: 'Full roast' },
  4: { label: 'NUCLEAR', color: 'text-rose-500', bg: 'bg-rose-500', desc: 'Max damage' }
};

export default function ChatSidebar({ chats, activeChat, onSelectChat, onNewChat, onDeleteChat, onRenameChat, onSelectFromSearch, intensity, onIntensityChange, userName, onEditName }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef(null);
  const searchTimerRef = useRef(null);

  const currentIntensity = INTENSITY_LABELS[intensity] || INTENSITY_LABELS[3];

  const handleRename = (chatId) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(data);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="flex h-full w-72 flex-col bg-slate-950/70 text-slate-100 backdrop-blur-2xl" data-testid="chat-sidebar">
      <div className="border-b border-white/10 p-4">
        <div className="mb-4 flex items-center gap-2.5">
          <img src={AI_AVATAR} alt="AI" className="h-8 w-8 rounded-xl border border-blue-400/30 bg-blue-500/10" />
          <span className="text-sm font-extrabold tracking-tight" style={{ fontFamily: 'Manrope' }}>
            <span className="text-slate-100">mini</span>{' '}
            <span className="text-blue-300">malist</span>
          </span>
        </div>
        <div className="flex gap-2">
          <button
            data-testid="new-chat-btn"
            onClick={onNewChat}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-blue-900/30 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
          <button
            data-testid="search-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            className={`flex w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
              searchOpen
                ? 'border-blue-400/30 bg-blue-500/10 text-blue-300'
                : 'border-white/10 bg-slate-900/60 text-slate-400 hover:border-blue-400/30 hover:text-blue-300'
            }`}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search panel */}
      {searchOpen && (
        <div className="border-b border-white/10 bg-slate-900/60" data-testid="search-panel">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                data-testid="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all chats..."
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-2.5 pl-9 pr-8 text-xs font-mono text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
              />
              {searchQuery && (
                <button onClick={closeSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          {searching && <div className="px-3 pb-3"><p className="text-slate-400 text-[11px] font-mono">Searching...</p></div>}
          {!searching && searchResults.length > 0 && (
            <ScrollArea className="max-h-60">
              <div className="space-y-0.5 px-2 pb-2">
                {searchResults.map((r, i) => (
                  <button key={i} data-testid={`search-result-${i}`} onClick={() => { onSelectFromSearch(r.chat_id); closeSearch(); }} className="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-800/80">
                    <p className="mb-1 truncate text-[10px] font-mono uppercase tracking-wider text-blue-300">{r.chat_title}</p>
                    <p className="truncate text-xs font-mono text-slate-200">{r.content}</p>
                    <p className="mt-0.5 text-[10px] font-mono text-slate-500">{r.role === 'user' ? 'You' : 'AI'}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="px-3 pb-3"><p className="text-slate-500 text-[11px] font-mono">No results found.</p></div>
          )}
        </div>
      )}

      {/* Intensity Slider */}
      <div className="border-b border-white/10 px-4 py-3" data-testid="intensity-section">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Roast Level</span>
          <span className={`text-[11px] font-black uppercase tracking-wider ${currentIntensity.color}`} data-testid="intensity-label">
            {currentIntensity.label}
          </span>
        </div>
        <Slider
          data-testid="intensity-slider"
          value={[intensity]}
          onValueChange={(val) => onIntensityChange(val[0])}
          min={1}
          max={4}
          step={1}
          className="w-full"
        />
        <div className="mt-1.5 flex justify-between">
          <span className="text-[9px] text-emerald-300/60 font-mono">Chill</span>
          <span className="text-[9px] text-rose-300/60 font-mono">Nuclear</span>
        </div>
        <p className="mt-1 text-[10px] font-mono text-slate-500">{currentIntensity.desc}</p>
      </div>

      {/* Chat list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-1">
          {chats.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs font-mono text-slate-500">
              No chats yet. Start one.
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2.5 transition-all duration-200 ${
                  activeChat === chat.id
                    ? 'border border-blue-400/30 bg-slate-800/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]'
                    : 'border border-transparent hover:bg-slate-800/60'
                }`}
                data-testid={`chat-item-${chat.id}`}
              >
                <MessageSquare className={`h-4 w-4 shrink-0 ${activeChat === chat.id ? 'text-blue-300' : 'text-slate-500'}`} />

                {editingId === chat.id ? (
                  <input
                    data-testid={`rename-input-${chat.id}`}
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRename(chat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(chat.id);
                      if (e.key === 'Escape') { setEditingId(null); setEditTitle(''); }
                    }}
                    className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-2 py-1 text-xs font-mono text-white outline-none focus:border-blue-400"
                  />
                ) : (
                  <span
                    onClick={() => onSelectChat(chat.id)}
                    className={`flex-1 truncate text-xs font-mono ${activeChat === chat.id ? 'text-slate-100' : 'text-slate-400'}`}
                  >
                    {chat.title || 'New Chat'}
                  </span>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button data-testid={`chat-menu-${chat.id}`} className="p-0.5 text-slate-500 opacity-0 transition-colors hover:text-blue-300 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl">
                    <DropdownMenuItem data-testid={`rename-chat-${chat.id}`} onClick={() => { setEditingId(chat.id); setEditTitle(chat.title || ''); }} className="cursor-pointer rounded-lg font-mono text-xs text-slate-200 hover:bg-slate-800">
                      <Pencil className="mr-2 h-3 w-3" />Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem data-testid={`delete-chat-${chat.id}`} onClick={() => onDeleteChat(chat.id)} className="cursor-pointer rounded-lg font-mono text-xs text-rose-300 hover:bg-slate-800">
                      <Trash2 className="mr-2 h-3 w-3" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-white/10 px-4 py-3">
        <button
          data-testid="edit-name-btn"
          onClick={onEditName}
          className="-m-2 flex w-full items-center gap-2.5 rounded-2xl p-2 transition-all duration-200 hover:bg-slate-800/70"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-800">
            <User className="h-4 w-4 text-blue-300" />
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-xs font-mono text-slate-100">{userName || 'Anonymous'}</p>
            <p className="text-[10px] font-mono text-slate-500">{userName ? 'Tap to change name' : 'Tap to set name'}</p>
          </div>
        </button>
      </div>
    </div>
  );
}

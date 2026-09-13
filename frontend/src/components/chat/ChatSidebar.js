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
    <div className="h-full bg-zinc-900 border-r border-zinc-800 flex flex-col w-72" data-testid="chat-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5 mb-4">
          <img src={AI_AVATAR} alt="AI" className="w-8 h-8 border border-amber-400/40 rounded-sm" />
          <span className="font-extrabold text-sm tracking-tight" style={{ fontFamily: 'Unbounded' }}>
            <span className="text-zinc-200">mini</span>{' '}
            <span className="text-amber-400">malist</span>
          </span>
        </div>
        <div className="flex gap-2">
          <button
            data-testid="new-chat-btn"
            onClick={onNewChat}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black py-2.5 font-bold uppercase tracking-widest text-[11px] rounded-sm transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            NEW
          </button>
          <button
            data-testid="search-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            className={`w-10 flex items-center justify-center border rounded-sm transition-colors duration-150 ${
              searchOpen
                ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                : 'border-zinc-700 text-zinc-400 hover:text-amber-400 hover:border-amber-400/50'
            }`}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search panel */}
      {searchOpen && (
        <div className="border-b border-zinc-800 bg-zinc-900" data-testid="search-panel">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                ref={searchInputRef}
                data-testid="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all chats..."
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono pl-9 pr-8 py-2.5 outline-none rounded-sm placeholder:text-zinc-600"
              />
              {searchQuery && (
                <button onClick={closeSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {searching && <div className="px-3 pb-3"><p className="text-zinc-500 text-[11px] font-mono">Searching...</p></div>}
          {!searching && searchResults.length > 0 && (
            <ScrollArea className="max-h-60">
              <div className="px-2 pb-2 space-y-0.5">
                {searchResults.map((r, i) => (
                  <button key={i} data-testid={`search-result-${i}`} onClick={() => { onSelectFromSearch(r.chat_id); closeSearch(); }} className="w-full text-left px-3 py-2.5 hover:bg-zinc-800 rounded-sm">
                    <p className="text-[10px] text-amber-400/70 font-mono uppercase tracking-wider mb-1 truncate">{r.chat_title}</p>
                    <p className="text-xs text-zinc-300 font-mono truncate">{r.content}</p>
                    <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{r.role === 'user' ? 'You' : 'AI'}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="px-3 pb-3"><p className="text-zinc-600 text-[11px] font-mono">No results found.</p></div>
          )}
        </div>
      )}

      {/* Intensity Slider */}
      <div className="px-4 py-3 border-b border-zinc-800" data-testid="intensity-section">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Roast Level</span>
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
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] text-emerald-400/50 font-mono">Chill</span>
          <span className="text-[9px] text-rose-500/50 font-mono">Nuclear</span>
        </div>
        <p className="text-[10px] text-zinc-600 font-mono mt-1">{currentIntensity.desc}</p>
      </div>

      {/* Chat list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 py-1">
          {chats.length === 0 ? (
            <p className="text-zinc-600 text-xs font-mono px-3 py-6 text-center">
              No chats yet. Start one.
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer rounded-sm transition-colors duration-100 ${
                  activeChat === chat.id
                    ? 'bg-zinc-800 border-l-2 border-amber-400'
                    : 'hover:bg-zinc-800/50 border-l-2 border-transparent'
                }`}
                data-testid={`chat-item-${chat.id}`}
              >
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeChat === chat.id ? 'text-amber-400' : 'text-zinc-600'}`} />

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
                    className="flex-1 bg-zinc-800 border border-zinc-600 text-white text-xs font-mono px-2 py-1 outline-none focus:border-amber-400 rounded-sm"
                  />
                ) : (
                  <span
                    onClick={() => onSelectChat(chat.id)}
                    className={`flex-1 text-xs font-mono truncate ${activeChat === chat.id ? 'text-zinc-100' : 'text-zinc-400'}`}
                  >
                    {chat.title || 'New Chat'}
                  </span>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button data-testid={`chat-menu-${chat.id}`} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-amber-400 p-0.5">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-800 border-zinc-700 rounded-sm">
                    <DropdownMenuItem data-testid={`rename-chat-${chat.id}`} onClick={() => { setEditingId(chat.id); setEditTitle(chat.title || ''); }} className="text-zinc-300 hover:text-white focus:bg-zinc-700 rounded-sm cursor-pointer font-mono text-xs">
                      <Pencil className="w-3 h-3 mr-2" />Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-700" />
                    <DropdownMenuItem data-testid={`delete-chat-${chat.id}`} onClick={() => onDeleteChat(chat.id)} className="text-rose-400 hover:text-rose-300 focus:bg-zinc-700 rounded-sm cursor-pointer font-mono text-xs">
                      <Trash2 className="w-3 h-3 mr-2" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-zinc-800 px-4 py-3">
        <button
          data-testid="edit-name-btn"
          onClick={onEditName}
          className="w-full flex items-center gap-2.5 hover:bg-zinc-800 p-2 rounded-sm transition-colors duration-150 -m-2"
        >
          <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 flex items-center justify-center rounded-sm shrink-0">
            <User className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs font-mono text-zinc-200 truncate">{userName || 'Anonymous'}</p>
            <p className="text-[10px] font-mono text-zinc-600">{userName ? 'Tap to change name' : 'Tap to set name'}</p>
          </div>
        </button>
      </div>
    </div>
  );
}

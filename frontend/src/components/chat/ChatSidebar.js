import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Plus, MessageSquare, MoreHorizontal, Trash2, Pencil, Skull, Flame } from 'lucide-react';

const AI_AVATAR = "https://static.prod-images.emergentagent.com/jobs/1e633876-7148-4142-8a3d-10cb5ae62c39/images/a80f1ac106d58a9eef96d6d5cb0fa44a447f3c41fe6027801bd85c2e225ab8ee.png";

export default function ChatSidebar({ chats, activeChat, onSelectChat, onNewChat, onDeleteChat, onRenameChat }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleRename = (chatId) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <div className="h-full bg-black border-r-2 border-zinc-800 flex flex-col w-72" data-testid="chat-sidebar">
      {/* Header */}
      <div className="p-4 border-b-2 border-zinc-800">
        <div className="flex items-center gap-2 mb-4">
          <img src={AI_AVATAR} alt="AI" className="w-8 h-8 border border-rose-500" />
          <span className="font-extrabold text-sm tracking-tight" style={{ fontFamily: 'Unbounded' }}>
            BRUTAL<span className="text-rose-500">REPLY</span>
          </span>
        </div>
        <button
          data-testid="new-chat-btn"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-black py-2.5 font-bold uppercase tracking-widest text-xs transition-none"
        >
          <Plus className="w-4 h-4" />
          NEW ROAST
        </button>
      </div>

      {/* Badge */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-1.5 bg-rose-500 text-black font-black uppercase text-[10px] px-2 py-1 tracking-widest w-fit">
          <Skull className="w-3 h-3" />
          SAVAGE MODE: ON
        </div>
      </div>

      {/* Chat list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 py-2">
          {chats.length === 0 ? (
            <p className="text-zinc-600 text-xs font-mono px-3 py-4 text-center">
              Koi chat nahi hai. Himmat hai toh shuru kar.
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-none ${
                  activeChat === chat.id
                    ? 'bg-zinc-900 border-l-2 border-rose-500'
                    : 'hover:bg-zinc-900/50 border-l-2 border-transparent'
                }`}
                data-testid={`chat-item-${chat.id}`}
              >
                <MessageSquare className="w-4 h-4 text-zinc-600 shrink-0" />

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
                    className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-xs font-mono px-2 py-1 outline-none focus:border-rose-500"
                  />
                ) : (
                  <span
                    onClick={() => onSelectChat(chat.id)}
                    className="flex-1 text-xs font-mono text-zinc-300 truncate"
                  >
                    {chat.title || 'New Chat'}
                  </span>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      data-testid={`chat-menu-${chat.id}`}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-500 p-0.5"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-700 rounded-none">
                    <DropdownMenuItem
                      data-testid={`rename-chat-${chat.id}`}
                      onClick={() => { setEditingId(chat.id); setEditTitle(chat.title || ''); }}
                      className="text-zinc-300 hover:text-white focus:bg-zinc-800 rounded-none cursor-pointer font-mono text-xs"
                    >
                      <Pencil className="w-3 h-3 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-700" />
                    <DropdownMenuItem
                      data-testid={`delete-chat-${chat.id}`}
                      onClick={() => onDeleteChat(chat.id)}
                      className="text-rose-500 hover:text-rose-400 focus:bg-zinc-800 rounded-none cursor-pointer font-mono text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t-2 border-zinc-800 p-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-500" />
          <span className="text-zinc-500 text-[10px] font-mono">No mercy. No filter. Just roasts.</span>
        </div>
      </div>
    </div>
  );
}

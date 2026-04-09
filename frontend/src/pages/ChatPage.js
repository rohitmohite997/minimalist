import React, { useState, useEffect, useCallback } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import axios from 'axios';
import { Menu, X, Flame, Skull } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function getUserId() {
  let uid = localStorage.getItem('brutal_user_id');
  if (!uid) {
    uid = 'anon-' + crypto.randomUUID();
    localStorage.setItem('brutal_user_id', uid);
  }
  return uid;
}

const api = axios.create({
  baseURL: API,
  headers: { 'X-User-ID': getUserId() }
});

const AI_AVATAR = "https://static.prod-images.emergentagent.com/jobs/1e633876-7148-4142-8a3d-10cb5ae62c39/images/a80f1ac106d58a9eef96d6d5cb0fa44a447f3c41fe6027801bd85c2e225ab8ee.png";

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchChats = useCallback(async () => {
    try {
      const { data } = await api.get('/chats');
      setChats(data);
    } catch { /* ignore */ }
  }, []);

  const fetchMessages = useCallback(async (chatId) => {
    setLoadingMessages(true);
    try {
      const { data } = await api.get(`/chats/${chatId}/messages`);
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      setSidebarOpen(false);
    }
  }, [activeChat, fetchMessages]);

  const handleNewChat = async () => {
    try {
      const { data } = await api.post('/chats', { title: "New Chat" });
      setChats(prev => [data, ...prev]);
      setActiveChat(data.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch { /* ignore */ }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await api.delete(`/chats/${chatId}`);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (activeChat === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch { /* ignore */ }
  };

  const handleRenameChat = async (chatId, newTitle) => {
    try {
      await api.put(`/chats/${chatId}`, { title: newTitle });
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c));
    } catch { /* ignore */ }
  };

  const handleSendMessage = async (content) => {
    if (!activeChat || sending || !content.trim()) return;

    const tempUserMsg = {
      id: 'temp-user-' + Date.now(),
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const { data } = await api.post(`/chats/${activeChat}/messages`, { content: content.trim() });
      setMessages(prev => {
        const without = prev.filter(m => m.id !== tempUserMsg.id);
        return [...without, data.user_message, data.ai_message];
      });
      fetchChats();
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden" data-testid="chat-page">
      {/* Mobile menu button */}
      <button
        data-testid="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-50 md:hidden bg-zinc-900 border-2 border-zinc-800 p-2 text-zinc-400 hover:text-rose-500"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-200
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onSelectChat={setActiveChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {activeChat ? (
          <>
            <ChatMessages messages={messages} sending={sending} loading={loadingMessages} />
            <ChatInput onSend={handleSendMessage} sending={sending} />
          </>
        ) : (
          <WelcomeScreen onNewChat={handleNewChat} />
        )}
      </div>
    </div>
  );
}

function WelcomeScreen({ onNewChat }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8" data-testid="welcome-screen">
      <div className="text-center max-w-lg">
        <img src={AI_AVATAR} alt="BrutalReply AI" className="w-24 h-24 mx-auto mb-6 border-2 border-rose-500" />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 tracking-tight" style={{ fontFamily: 'Unbounded' }}>
          BRUTAL<span className="text-rose-500">REPLY</span>
        </h1>
        <div className="inline-flex items-center gap-2 bg-rose-500 text-black font-black uppercase text-xs px-3 py-1.5 tracking-widest mb-6">
          <Skull className="w-3 h-3" />
          SAVAGE MODE: ON [LOCKED]
        </div>
        <p className="text-zinc-500 font-mono text-sm mb-8 max-w-sm mx-auto">
          Kuch bhi puch, lekin rona mat jab answer aaye. Yahan sab savage hai, koi mercy nahi milegi.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
          {["Mujhe motivate kar", "JavaScript vs Python?", "Meri life boring hai", "Tu kaun hai be?"].map((prompt, i) => (
            <button
              key={i}
              data-testid={`suggestion-${i}`}
              onClick={onNewChat}
              className="border-2 border-zinc-800 hover:border-rose-500 bg-zinc-950 p-3 text-left text-sm text-zinc-400 hover:text-rose-500 font-mono transition-none"
            >
              "{prompt}"
            </button>
          ))}
        </div>
        <button
          data-testid="welcome-new-chat-btn"
          onClick={onNewChat}
          className="border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-black px-8 py-3 font-bold uppercase tracking-widest text-sm transition-none"
        >
          <Flame className="w-4 h-4 inline mr-2" />
          START A ROAST SESSION
        </button>
      </div>
    </div>
  );
}

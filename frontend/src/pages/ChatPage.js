import React, { useState, useEffect, useCallback } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import NamePrompt from '@/components/chat/NamePrompt';
import axios from 'axios';
import { Menu, X, Flame, Zap } from 'lucide-react';

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

export { api };

const AI_AVATAR = "https://static.prod-images.emergentagent.com/jobs/1e633876-7148-4142-8a3d-10cb5ae62c39/images/a80f1ac106d58a9eef96d6d5cb0fa44a447f3c41fe6027801bd85c2e225ab8ee.png";

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem('mini_malist_name') || '');
  const [showNamePrompt, setShowNamePrompt] = useState(() => !localStorage.getItem('mini_malist_name'));
  const [intensity, setIntensity] = useState(() => {
    const saved = localStorage.getItem('mini_malist_intensity');
    return saved ? parseInt(saved) : 3;
  });

  const handleNameSave = (name) => {
    setUserName(name);
    localStorage.setItem('mini_malist_name', name);
    setShowNamePrompt(false);
  };

  const handleIntensityChange = (val) => {
    setIntensity(val);
    localStorage.setItem('mini_malist_intensity', val.toString());
  };

  const fetchChats = useCallback(async () => {
    try {
      const { data } = await api.get('/chats');
      setChats(data);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
      // Don't show toast for initial load, just log
    }
  }, []);

  const fetchMessages = useCallback(async (chatId) => {
    setLoadingMessages(true);
    try {
      const { data } = await api.get(`/chats/${chatId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
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
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await api.delete(`/chats/${chatId}`);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (activeChat === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleRenameChat = async (chatId, newTitle) => {
    try {
      await api.put(`/chats/${chatId}`, { title: newTitle });
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c));
    } catch (err) {
      console.error('Failed to rename chat:', err);
    }
  };

  const handleSelectFromSearch = (chatId) => {
    setActiveChat(chatId);
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
      const { data } = await api.post(`/chats/${activeChat}/messages`, {
        content: content.trim(),
        user_name: userName || null,
        intensity: intensity
      });
      setMessages(prev => {
        const without = prev.filter(m => m.id !== tempUserMsg.id);
        return [...without, data.user_message, data.ai_message];
      });
      fetchChats();
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {showNamePrompt && <NamePrompt onSave={handleNameSave} onSkip={() => setShowNamePrompt(false)} />}
      <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.12),_transparent_28%),linear-gradient(180deg,_#020817_0%,_#0b1120_38%,_#111827_100%)]" data-testid="chat-page">
        <button
          data-testid="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-3 top-3 z-50 rounded-xl border border-white/10 bg-slate-900/80 p-2 text-slate-200 shadow-lg backdrop-blur md:hidden hover:text-blue-300"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-slate-950/40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-white/10 bg-slate-950/65 shadow-[0_20px_60px_rgba(2,6,23,0.8)] backdrop-blur-2xl transition-transform duration-200 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <ChatSidebar
            chats={chats}
            activeChat={activeChat}
            onSelectChat={setActiveChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={handleRenameChat}
            onSelectFromSearch={handleSelectFromSearch}
            intensity={intensity}
            onIntensityChange={handleIntensityChange}
            userName={userName}
            onEditName={() => setShowNamePrompt(true)}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-slate-950/20">
          {activeChat ? (
            <>
              <ChatMessages messages={messages} sending={sending} loading={loadingMessages} />
              <ChatInput onSend={handleSendMessage} sending={sending} />
            </>
          ) : (
            <WelcomeScreen onNewChat={handleNewChat} userName={userName} />
          )}
        </div>
      </div>
    </>
  );
}

function WelcomeScreen({ onNewChat, userName }) {
  return (
    <div
      className="flex flex-1 items-center justify-center p-8"
      data-testid="welcome-screen"
    >
      <div className="max-w-xl rounded-[32px] border border-white/10 bg-slate-900/60 p-8 text-center shadow-[0_24px_80px_rgba(2,6,23,0.5)] backdrop-blur-xl">

        <div className="mb-6 inline-flex rounded-[26px] border border-blue-400/20 bg-slate-950/50 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <img
            src={AI_AVATAR}
            alt="mini malist"
            className="h-20 w-20 rounded-2xl object-cover"
          />
        </div>

        <h1
          className="mb-2 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          style={{ fontFamily: 'Manrope' }}
        >
          <span className="text-slate-100">mini</span>{' '}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            malist
          </span>
        </h1>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
          smart ai chat
        </p>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
          <Zap className="h-3 w-3" />
          focused conversations
        </div>

        {userName && (
          <p className="mb-4 text-sm text-slate-300">
            Welcome back,{' '}
            <span className="font-bold text-blue-300">{userName}</span>
          </p>
        )}

        <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-slate-300">
          Start a chat, ask for help, and keep everything in one clean conversation space.
        </p>

        <div className="mx-auto mb-8 grid max-w-md grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {[
            { text: 'Plan my week', lang: 'EN' },
            { text: 'Mera din kaise improve ho', lang: 'HI' },
            { text: 'Explain REST APIs', lang: 'EN' },
            { text: 'Project ideas chahiye', lang: 'HI' }
          ].map((prompt, i) => (
            <button
              key={i}
              data-testid={`suggestion-${i}`}
              onClick={onNewChat}
              className="rounded-2xl border border-white/10 bg-slate-950/40 p-3.5 text-left text-sm text-slate-300 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-slate-900/70 hover:text-white"
            >
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                {prompt.lang}
              </span>
              "{prompt.text}"
            </button>
          ))}
        </div>

        <button
          data-testid="welcome-new-chat-btn"
          onClick={onNewChat}
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-blue-900/40 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500"
        >
          <Flame className="mr-2 inline h-4 w-4" />
          Start chatting
        </button>

      </div>
    </div>
  );
}
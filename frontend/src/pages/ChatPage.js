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
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {showNamePrompt && <NamePrompt onSave={handleNameSave} onSkip={() => setShowNamePrompt(false)} />}
      <div className="flex h-screen bg-zinc-950 overflow-hidden" data-testid="chat-page">
        {/* Mobile menu button */}
        <button
          data-testid="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-3 left-3 z-50 md:hidden bg-zinc-900/90 backdrop-blur border border-zinc-700 p-2 text-zinc-400 hover:text-amber-400 rounded-sm"
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
            onSelectFromSearch={handleSelectFromSearch}
            intensity={intensity}
            onIntensityChange={handleIntensityChange}
            userName={userName}
            onEditName={() => setShowNamePrompt(true)}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
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
    <div className="flex-1 flex items-center justify-center p-8" data-testid="welcome-screen">
      <div className="text-center max-w-xl">
        <img src={AI_AVATAR} alt="mini malist" className="w-20 h-20 mx-auto mb-6 border-2 border-amber-400/60 rounded-sm" />
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-2 tracking-tight" style={{ fontFamily: 'Unbounded' }}>
          <span className="text-zinc-100">mini</span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-500">malist</span>
        </h1>
        <p className="text-zinc-500 text-sm mb-2 tracking-[0.3em] uppercase font-mono">savage ai</p>
        <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-400 border border-amber-400/30 font-bold uppercase text-[10px] px-3 py-1.5 tracking-widest mb-6 rounded-sm">
          <Zap className="w-3 h-3" />
          SAVAGE MODE: ALWAYS ON
        </div>
        {userName && (
          <p className="text-amber-400/80 font-mono text-sm mb-4">
            Ready to roast you, <span className="text-amber-300 font-bold">{userName}</span>
          </p>
        )}
        <p className="text-zinc-400 font-mono text-sm mb-8 max-w-md mx-auto leading-relaxed">
          Ask anything in any language. Get roasted in the same language. No mercy. No filter.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left max-w-md mx-auto">
          {[
            { text: "Motivate me please", lang: "EN" },
            { text: "Meri life boring hai", lang: "HI" },
            { text: "JavaScript vs Python?", lang: "EN" },
            { text: "Tu kaun hai be?", lang: "HI" }
          ].map((prompt, i) => (
            <button
              key={i}
              data-testid={`suggestion-${i}`}
              onClick={onNewChat}
              className="group border border-zinc-800 hover:border-amber-400/50 bg-zinc-900/50 hover:bg-zinc-900 p-3.5 text-left text-sm text-zinc-400 hover:text-zinc-200 font-mono rounded-sm transition-colors duration-150"
            >
              <span className="text-[10px] text-amber-400/60 uppercase tracking-wider block mb-1">{prompt.lang}</span>
              "{prompt.text}"
            </button>
          ))}
        </div>
        <button
          data-testid="welcome-new-chat-btn"
          onClick={onNewChat}
          className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black px-8 py-3 font-bold uppercase tracking-widest text-sm rounded-sm transition-all duration-150"
        >
          <Flame className="w-4 h-4 inline mr-2" />
          START ROASTING
        </button>
      </div>
    </div>
  );
}

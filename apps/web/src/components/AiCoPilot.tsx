import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquareCode, Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
}

interface AiCoPilotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiCoPilot({ isOpen, onClose }: AiCoPilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      content: 'Hi there! I am your **HIREU AI Career Co-pilot**. I can help you search our active positions, refine your resume bullet points, draft high-converting cover letters, or practice mock interview loops.\n\nTry asking me:\n- *"What jobs are open right now?"*\n- *"Draft a short cold outreach email for Velo Design"*',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (contentStr: string) => {
    if (!contentStr.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      content: contentStr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        sender: m.sender,
        content: m.content
      }));

      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory })
      });
      const data = await response.json();

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        content: 'I apologize, I encountered an issue connecting to the core intelligence routers. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const formatText = (text: string) => {
    // Basic Markdown bullet point and bold formatting
    return text.split('\n').map((line, i) => {
      let content = line;
      
      // Handle bold text (**bold**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIdx = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIdx) {
          parts.push(content.substring(lastIdx, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-slate-900">{match[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < content.length) {
        parts.push(content.substring(lastIdx));
      }

      // Handle bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        const lineContent = parts.length > 0 ? parts : content.substring(line.indexOf('•') + 1 || line.indexOf('-') + 1);
        return (
          <li key={i} className="list-disc ml-4 my-1 text-slate-700">
            {lineContent}
          </li>
        );
      }

      return (
        <p key={i} className="my-1.5 leading-relaxed text-slate-700">
          {parts.length > 0 ? parts : content}
        </p>
      );
    });
  };

  const quickPrompts = [
    { text: 'What jobs are open?', label: 'Open Jobs' },
    { text: 'Draft a short cold outreach email for Velo Design', label: 'Draft Outreach' },
    { text: 'How do I improve my resume for a Senior NLP Researcher role?', label: 'Resume Help' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs"
          />

          {/* Drawer Body Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between"
          >
            {/* Header info */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-sm">
                  <MessageSquareCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-slate-900 text-sm">HIREU Co-pilot</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Active Service</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversational Screen */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-pastel-mesh/40"
            >
              {messages.map((m) => {
                const isBot = m.sender === 'bot';
                return (
                  <div 
                    key={m.id}
                    className={`flex items-start gap-2.5 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                  >
                    {isBot && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-[10px]">
                        H
                      </div>
                    )}
                    <div>
                      <div className={`p-3 rounded-2xl text-xs sm:text-sm ${
                        isBot 
                          ? 'bg-white border border-slate-100 text-slate-800 shadow-sm' 
                          : 'bg-indigo-600 text-white shadow-sm'
                      }`}>
                        {formatText(m.content)}
                      </div>
                      <span className={`text-[9px] text-slate-400 mt-1 font-mono font-bold block ${!isBot && 'text-right'}`}>
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-2.5 mr-auto">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-[10px]">
                    H
                  </div>
                  <div className="bg-white border border-slate-100 p-3 rounded-2xl text-xs flex items-center gap-2 text-slate-500 shadow-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    <span>Analyzing message parameters...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Helper prompts */}
            <div className="p-3 border-t border-slate-100/60 flex flex-wrap gap-1.5 bg-slate-50/50">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(p.text)}
                  className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/60 rounded-lg text-[11px] font-medium text-slate-600 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Submission */}
            <div className="p-3 border-t border-slate-100 bg-white">
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="Ask HireU Co-pilot anything..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

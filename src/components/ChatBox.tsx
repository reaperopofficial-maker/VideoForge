import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import { useStore, Message } from '../store/useStore';

export default function ChatBox({ projectId }: { projectId: string }) {
  const { messages, addMessage } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    addMessage(userMessage);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const res = await api.chatWithAgent(projectId, userMessage.content, history);
      
      let aimsg = "";
      if (res.type === "tool_use") {
         aimsg = `I am running the task now. I am calling ${res.tool_calls.map((t:any) => t.name).join(', ')}`;
      } else {
         aimsg = res.content || "Done.";
      }

      addMessage({
        role: 'assistant',
        content: aimsg,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      addMessage({
        role: 'assistant',
        content: "Error: Could not connect to the agent.",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
            <Bot size={48} className="opacity-20" />
            <p className="text-center font-medium max-w-[250px]">
              Hi! I'm the VideoForge Agent. How can I help you build this project?
            </p>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-800 border border-gray-700'
                }`}>
                  {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-blue-400" />}
                </div>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/20' 
                    : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none shadow-lg shadow-black/20'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex max-w-[85%] space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-blue-400" />
                </div>
                <div className="p-4 rounded-2xl bg-gray-800 border border-gray-700 rounded-tl-none flex items-center space-x-2">
                  <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                  <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 sm:p-4 bg-gray-950 border-t border-gray-800 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to start generating..."
            className="w-full bg-gray-900 border border-gray-800 rounded-full md:rounded-xl pl-4 pr-16 md:pr-28 py-3 md:py-4 text-base md:text-sm text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium min-h-[44px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 md:px-4 md:py-2 flex items-center justify-center min-w-[40px] min-h-[40px] md:min-h-[44px] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-full md:rounded-lg transition-colors gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="hidden md:inline font-medium">Send</span>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

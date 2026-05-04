import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Film, Paperclip, Smile } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-brand-bg relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide relative z-10 w-full mb-20 md:mb-24">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="w-16 h-16 rounded-full glassmorphism flex items-center justify-center">
              <Film size={32} className="text-brand-primary opacity-50" />
            </div>
            <p className="text-center font-medium max-w-[280px]">
              Hi! I'm CineWeave AI. How can I help you build this project?
            </p>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`flex max-w-[85%] md:max-w-[75%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === 'user' ? 'bg-gradient-to-br from-brand-accent to-blue-600' : 'bg-gradient-to-br from-brand-primary to-purple-600 shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                }`}>
                  {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                </div>
                <div className="flex flex-col gap-1 relative">
                  <span className={`text-[10px] text-gray-500 font-medium px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.role === 'user' ? 'You' : 'CineWeave'} 
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                       {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </span>
                  <div className={`p-4 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-brand-primary/90 to-purple-600/90 text-white rounded-[20px] rounded-br-sm shadow-[0_5px_20px_rgba(124,58,237,0.2)]' 
                      : 'glassmorphism text-gray-100 rounded-[20px] rounded-bl-sm border border-brand-primary/20'
                  }`}>
                    <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-start"
            >
              <div className="flex max-w-[85%] md:max-w-[75%] space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center shrink-0 mt-1">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 font-medium px-1 text-left">CineWeave</span>
                  <div className="p-4 glassmorphism rounded-[20px] rounded-bl-sm border border-brand-primary/20 flex items-center space-x-1.5 h-12">
                    <motion.div className="w-2 h-2 bg-brand-primary rounded-full" animate={{ y: [0, -5, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-2 h-2 bg-brand-primary rounded-full" animate={{ y: [0, -5, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-2 h-2 bg-brand-primary-light rounded-full" animate={{ y: [0, -5, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-brand-bg via-brand-bg to-transparent z-20">
        <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
          <div className="absolute left-3 flex space-x-2 text-gray-500">
            <button type="button" className="p-1.5 hover:text-brand-primary hover:bg-brand-primary/10 rounded-full transition-colors">
              <Paperclip size={18} />
            </button>
          </div>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask CineWeave AI..."
            className="w-full glassmorphism rounded-full pl-12 pr-14 py-4 text-sm text-gray-100 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-medium placeholder-gray-500 shadow-[0_5px_20px_rgba(0,0,0,0.3)]"
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-brand-primary hover:bg-brand-primary-light disabled:opacity-50 disabled:bg-brand-border disabled:text-gray-500 text-white rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)] disabled:shadow-none"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

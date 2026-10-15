import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  Terminal,
} from 'lucide-react';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ne';
  onActionTrigger?: (action: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  toolUsed?: string;
  timestamp: string;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  language,
  onActionTrigger,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'copilot',
      text:
        language === 'ne'
          ? 'नमस्ते। म रेस्क्युग्राफ एआई कोपाइलट हुँ। म उपग्रह विश्लेषण, सम्पर्कविहीन बस्ती र पूर्वाधार क्षति सम्बन्धी वास्तविक तथ्याङ्क दिन सक्छु। मलाई केही सोध्नुहोस्।'
          : 'Welcome. I am the RescueGraph Disaster Intelligence Copilot. I answer strictly based on live satellite segmentation and road graph topology calculations. Ask me anything.',
      timestamp: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.queryCopilot(queryText, language);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'copilot',
        text: res.answer,
        toolUsed: res.tool_used,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (res.action && onActionTrigger) {
        onActionTrigger(res.action);
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'copilot',
          text: 'Error contacting analytical backend. Please try again.',
          timestamp: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Web Speech API Voice Input
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use keyboard input.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ne' ? 'ne-NP' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] z-50 bg-[#070b14]/98 border-l border-cyan-500/30 backdrop-blur-xl shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>RESCUE COPILOT</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-600/30">
                {language === 'ne' ? 'नेपाली' : 'BILINGUAL'}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              Grounded Tool Execution • Zero Guesswork
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Query Pills */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap gap-1.5">
        <button
          onClick={() =>
            handleSend(language === 'ne' ? 'कुन बस्तीहरू सम्पर्कविहीन छन्?' : 'Which settlements are cut off?')
          }
          className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] transition-colors"
        >
          {language === 'ne' ? 'सम्पर्कविहीन बस्तीहरू?' : 'Which settlements are cut off?'}
        </button>
        <button
          onClick={() =>
            handleSend(
              language === 'ne'
                ? 'कुन पुलले सबैभन्दा धेरै बस्तीलाई असर गर्छ?'
                : 'Which bridges affect the largest number of settlements?'
            )
          }
          className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] transition-colors"
        >
          {language === 'ne' ? 'महत्वपूर्ण पुल?' : 'Critical bridge chokepoint?'}
        </button>
        <button
          onClick={() =>
            handleSend(language === 'ne' ? 'धुन्चे किन विच्छेद भयो?' : 'Why is Dhunche isolated?')
          }
          className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] transition-colors"
        >
          {language === 'ne' ? 'धुन्चे किन विच्छेद?' : 'Why is Dhunche isolated?'}
        </button>
        <button
          onClick={() =>
            handleSend(language === 'ne' ? 'बाढीको बाटो देखाउनुहोस्' : 'Trace flood path')
          }
          className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] transition-colors"
        >
          {language === 'ne' ? 'बाढीको बहाव' : 'Trace flood path'}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none shadow-md'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
              {m.toolUsed && (
                <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center gap-1.5 text-[10px] text-purple-300 font-mono">
                  <Terminal className="w-3 h-3 text-purple-400" />
                  <span>Executed Tool: {m.toolUsed.split('.').pop()}</span>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
              {m.timestamp}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-400 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 w-fit">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
            <span>Querying graph connectivity engine...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Voice Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isListening
                ? 'bg-rose-950 border-rose-500 text-rose-400 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
            title="Voice Command Mode (Speech to Text)"
          >
            {isListening ? <Mic className="w-4 h-4 text-rose-400" /> : <MicOff className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'ne'
                ? 'यहाँ प्रश्न लेख्नुहोस् वा बोल्नुहोस्...'
                : 'Ask AI Copilot in English or Nepali...'
            }
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

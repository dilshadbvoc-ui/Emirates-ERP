import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, User, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "What documents do I need?",
  "How long does it take?",
  "What's the total cost?",
  "Explain LLC vs Branch",
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your IGCC Dubai assistant. Ask me anything about mainland license applications, costs, or the business setup process." },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, I'm having trouble connecting right now. Please try again or contact our team at info@igcc.ae." },
      ]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    chatMutation.mutate({
      message: userMessage,
      history: messages.map((m) => ({ role: m.role, content: m.content })),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    chatMutation.mutate({
      message: prompt,
      history: messages.map((m) => ({ role: m.role, content: m.content })),
    });
  };

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors ${
          open
            ? "bg-[#0f1f3d] border border-[#c9a96e]/30"
            : "bg-[#c9a96e] text-[#0a1628]"
        }`}
        style={{ boxShadow: open ? undefined : "0 4px 20px rgba(201, 169, 110, 0.3)" }}
      >
        {open ? (
          <X className="w-6 h-6 text-[#f0f0f0]" />
        ) : (
          <Sparkles className="w-6 h-6" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-40 w-full sm:w-[400px] h-full bg-[#0a1628] border-l border-[#c9a96e]/15 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-[#c9a96e]/10">
              <div className="w-10 h-10 rounded-full bg-[#c9a96e]/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#c9a96e]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#f0f0f0]">IGCC AI Assistant</h3>
                <p className="text-xs text-[#94a3b8]">Always here to help</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-[#94a3b8] hover:text-[#f0f0f0] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Suggested prompts */}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handlePromptClick(prompt)}
                      className="px-3 py-1.5 text-xs bg-[#0f1f3d] border border-[#c9a96e]/15 text-[#94a3b8] rounded-full hover:border-[#c9a96e]/40 hover:text-[#f0f0f0] transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user"
                        ? "bg-[#c9a96e]/20"
                        : "bg-[#1e3a5f]"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-3.5 h-3.5 text-[#c9a96e]" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-[#c9a96e]" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#c9a96e] text-[#0a1628] rounded-2xl rounded-tr-none"
                        : "bg-[#0f1f3d] text-[#f0f0f0] rounded-2xl rounded-tl-none border-l-2 border-[#c9a96e]"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {chatMutation.isPending && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[#c9a96e]" />
                  </div>
                  <div className="bg-[#0f1f3d] px-4 py-3 rounded-2xl rounded-tl-none border-l-2 border-[#c9a96e]">
                    <Loader2 className="w-4 h-4 text-[#c9a96e] animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#c9a96e]/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about mainland licenses..."
                  className="flex-1 bg-[#0f1f3d] border border-[#c9a96e]/15 text-[#f0f0f0] placeholder-[#64748b] text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#c9a96e]/40 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || chatMutation.isPending}
                  className="p-2.5 bg-[#c9a96e] text-[#0a1628] rounded-lg hover:bg-[#d4b87a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

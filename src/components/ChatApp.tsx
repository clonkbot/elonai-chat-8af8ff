import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";

type Conversation = Doc<"conversations">;
type Message = Doc<"messages">;
import {
  MessageSquare,
  Plus,
  Send,
  LogOut,
  Trash2,
  Rocket,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export function ChatApp() {
  const { signOut } = useAuthActions();
  const conversations = useQuery(api.conversations.list);
  const createConversation = useMutation(api.conversations.create);
  const deleteConversation = useMutation(api.conversations.remove);

  const [activeConversation, setActiveConversation] = useState<Id<"conversations"> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-select first conversation or create one
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0]._id);
    }
  }, [conversations, activeConversation]);

  const handleNewChat = async () => {
    const id = await createConversation();
    setActiveConversation(id);
    setSidebarOpen(false);
  };

  const handleDelete = async (id: Id<"conversations">) => {
    await deleteConversation({ id });
    if (activeConversation === id) {
      setActiveConversation(conversations?.find((c: Conversation) => c._id !== id)?._id || null);
    }
  };

  return (
    <div className="min-h-screen bg-black noise-bg flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        className="fixed md:relative md:translate-x-0 inset-y-0 left-0 w-72 md:w-80 glass-panel border-r border-cyan-500/10 flex flex-col z-30"
        style={{ transform: "none" }}
      >
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 flex flex-col h-full`}>
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-cyan-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-orange-500 flex items-center justify-center">
                  <Rocket className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-white text-sm md:text-base">ElonAI</h1>
                  <p className="text-xs text-slate-400">Chat Interface</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <motion.button
              onClick={handleNewChat}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full bg-gradient-to-r from-cyan-500/20 to-orange-500/20 hover:from-cyan-500/30 hover:to-orange-500/30 border border-cyan-500/30 text-white font-medium py-2.5 md:py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm md:text-base"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              New Conversation
            </motion.button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-1">
            {conversations?.map((conv: Conversation) => (
              <motion.div
                key={conv._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group relative rounded-xl p-3 cursor-pointer transition-all ${
                  activeConversation === conv._id
                    ? "bg-cyan-500/20 border border-cyan-500/30"
                    : "hover:bg-slate-800/50 border border-transparent"
                }`}
                onClick={() => {
                  setActiveConversation(conv._id);
                  setSidebarOpen(false);
                }}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeConversation === conv._id ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="text-sm truncate text-slate-200 flex-1 pr-6">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(conv._id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}

            {(!conversations || conversations.length === 0) && (
              <div className="text-center py-8 text-slate-500 text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat with Elon</p>
              </div>
            )}
          </div>

          {/* Sign Out */}
          <div className="p-4 border-t border-cyan-500/10">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white py-2.5 rounded-xl hover:bg-slate-800/50 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden glass-panel border-b border-cyan-500/10 p-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold text-white">ElonAI</span>
          </div>
        </header>

        {activeConversation ? (
          <ChatMessages conversationId={activeConversation} />
        ) : (
          <WelcomeScreen onNewChat={handleNewChat} />
        )}
      </main>
    </div>
  );
}

function WelcomeScreen({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-orange-500/20 border border-cyan-500/30 flex items-center justify-center animate-glow"
        >
          <Rocket className="w-10 h-10 md:w-12 md:h-12 text-cyan-400" />
        </motion.div>

        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Ready for Liftoff?</h2>
        <p className="text-slate-400 mb-6 md:mb-8 text-sm md:text-base">
          Start a conversation with virtual Elon Musk. Ask about SpaceX, Tesla, X, AI, the future of humanity, or anything else!
        </p>

        <motion.button
          onClick={onNewChat}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold px-6 md:px-8 py-3 md:py-3.5 rounded-xl flex items-center justify-center gap-2 mx-auto transition-all shadow-lg shadow-cyan-500/25 text-sm md:text-base"
        >
          <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
          Start New Chat
        </motion.button>

        <div className="mt-8 md:mt-12 grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
          {[
            { q: '"What\'s next for SpaceX?"', topic: "Space" },
            { q: '"When will we reach Mars?"', topic: "Mars" },
            { q: '"Thoughts on AI safety?"', topic: "AI" },
            { q: '"Tesla\'s secret projects?"', topic: "Tesla" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass-panel rounded-xl p-3 text-left"
            >
              <p className="text-slate-300 text-xs md:text-sm">{item.q}</p>
              <p className="text-cyan-500 text-xs mt-1">#{item.topic}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-8 md:mt-12">
          <p className="text-xs text-slate-600">
            Requested by <span className="text-slate-500">@OxPaulius</span> · Built by <span className="text-slate-500">@clonkbot</span>
          </p>
        </footer>
      </motion.div>
    </div>
  );
}

function ChatMessages({ conversationId }: { conversationId: Id<"conversations"> }) {
  const messages = useQuery(api.messages.list, { conversationId });
  const sendMessage = useMutation(api.messages.send);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const message = input;
    setInput("");
    setIsTyping(true);
    try {
      await sendMessage({ conversationId, content: message });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
        {messages?.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-slate-500"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-orange-500/20 flex items-center justify-center">
                <span className="text-2xl md:text-3xl">🚀</span>
              </div>
              <p className="text-sm md:text-base">Ask Elon anything...</p>
            </motion.div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages?.map((msg: Message, index: number) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex gap-3 md:gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-cyan-500 to-cyan-600"
                  : "bg-gradient-to-br from-orange-500 to-red-500"
              }`}>
                {msg.role === "user" ? (
                  <span className="text-white text-sm md:text-base">👤</span>
                ) : (
                  <span className="text-white text-sm md:text-base">🚀</span>
                )}
              </div>

              {/* Message bubble */}
              <div className={`max-w-[85%] md:max-w-2xl ${msg.role === "user" ? "text-right" : ""}`}>
                <div className={`inline-block rounded-2xl px-4 py-2.5 md:px-5 md:py-3 text-sm md:text-base ${
                  msg.role === "user"
                    ? "bg-cyan-500/20 border border-cyan-500/30 text-white"
                    : "bg-slate-800/80 border border-slate-700/50 text-slate-100"
                }`}>
                  {msg.content}
                </div>
                <p className="text-xs text-slate-500 mt-1 px-2">
                  {msg.role === "user" ? "You" : "Virtual Elon"}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 md:gap-4"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-sm md:text-base">🚀</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl px-5 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 md:p-4 border-t border-cyan-500/10">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 md:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask Elon anything..."
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 md:py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm md:text-base"
            />
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white p-3 md:p-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/25"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
          <p className="text-xs text-slate-600 text-center mt-3">
            This is a simulation. Not the real Elon Musk.
          </p>
        </div>
      </div>
    </div>
  );
}

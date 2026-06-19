import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Trash2,
  Send,
  X,
  ChevronRight,
  Loader2,
  User,
  MessageSquare,
  Bot,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";

const statusColors: Record<string, string> = {
  draft: "bg-[#64748b]/20 text-[#94a3b8]",
  submitted: "bg-[#3b82f6]/20 text-[#60a5fa]",
  under_review: "bg-[#f59e0b]/20 text-[#fbbf24]",
  approved: "bg-[#22c55e]/20 text-[#4ade80]",
  rejected: "bg-[#ef4444]/20 text-[#f87171]",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [selectedApp, setSelectedApp] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const { data: applications, isLoading: appsLoading } = trpc.application.list.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: messages, refetch: refetchMessages } = trpc.message.listByApplication.useQuery(
    { applicationId: selectedApp! },
    { enabled: !!selectedApp }
  );

  const sendMessage = trpc.message.create.useMutation({
    onSuccess: () => {
      setMessageInput("");
      refetchMessages();
    },
  });

  const deleteApp = trpc.application.delete.useMutation({
    onSuccess: () => {
      setSelectedApp(null);
      window.location.reload();
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedApp) return;
    sendMessage.mutate({ applicationId: selectedApp, content: messageInput.trim() });
  };

  const selectedApplication = applications?.find((a) => a.id === selectedApp);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#c9a96e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar />

      <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-semibold text-[#f0f0f0]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                My Dashboard
              </h1>
              <p className="text-sm text-[#94a3b8] mt-1">Manage your license applications</p>
            </div>
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9a96e] text-[#0a1628] font-semibold rounded-xl hover:bg-[#d4b87a] transition-colors"
            >
              <Plus className="w-4 h-4" /> New Application
            </Link>
          </div>

          {/* Content */}
          {appsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#c9a96e] animate-spin" />
            </div>
          ) : !applications || applications.length === 0 ? (
            <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl p-12 text-center">
              <FileText className="w-12 h-12 text-[#c9a96e]/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#f0f0f0] mb-2">No applications yet</h3>
              <p className="text-sm text-[#94a3b8] mb-6">Start your first mainland license application</p>
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9a96e] text-[#0a1628] font-semibold rounded-xl hover:bg-[#d4b87a] transition-colors"
              >
                <Plus className="w-4 h-4" /> Apply Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Applications List */}
              <div className="lg:col-span-2">
                <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-[#c9a96e]/10">
                    <h2 className="text-lg font-semibold text-[#f0f0f0]">My Applications</h2>
                  </div>
                  <div className="divide-y divide-[#c9a96e]/5">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApp(app.id === selectedApp ? null : app.id)}
                        className={`p-5 cursor-pointer hover:bg-[#152238] transition-colors ${
                          selectedApp === app.id ? "bg-[#152238]" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-mono text-[#c9a96e]">{app.quoteId}</span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  statusColors[app.status || "draft"]
                                }`}
                              >
                                {statusLabels[app.status || "draft"]}
                              </span>
                            </div>
                            <p className="text-sm text-[#94a3b8]">
                              {app.activity} — {app.legalStructure.replace("_", " ").toUpperCase()}
                            </p>
                            <p className="text-xs text-[#64748b] mt-1">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronRight
                            className={`w-5 h-5 text-[#64748b] transition-transform ${
                              selectedApp === app.id ? "rotate-90" : ""
                            }`}
                          />
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {selectedApp === app.id && selectedApplication && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 pb-2 border-t border-[#c9a96e]/10 mt-4">
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  <div>
                                    <p className="text-xs text-[#64748b]">Activity Type</p>
                                    <p className="text-sm text-[#f0f0f0] capitalize">{selectedApplication.activityType}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#64748b]">Partners</p>
                                    <p className="text-sm text-[#f0f0f0] capitalize">{selectedApplication.partnerCount.replace("_", " ")}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#64748b]">Trade Name</p>
                                    <p className="text-sm text-[#f0f0f0]">{selectedApplication.tradeName || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#64748b]">Office</p>
                                    <p className="text-sm text-[#f0f0f0] capitalize">{selectedApplication.officeType}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between bg-[#0a1628] rounded-lg p-3">
                                  <span className="text-sm text-[#94a3b8]">Estimated Cost</span>
                                  <span className="text-lg font-bold text-[#c9a96e]">
                                    AED {Number(selectedApplication.totalCost || 0).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedApp(app.id);
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#1e3a5f] text-[#f0f0f0] rounded-lg hover:bg-[#264b75] transition-colors"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm("Delete this application?")) {
                                        deleteApp.mutate({ id: app.id });
                                      }
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Panel */}
              <div className="lg:col-span-1">
                <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl overflow-hidden sticky top-24">
                  {selectedApp && selectedApplication ? (
                    <>
                      <div className="p-4 border-b border-[#c9a96e]/10 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[#f0f0f0]">Chat</h3>
                          <p className="text-xs text-[#94a3b8]">{selectedApplication.quoteId}</p>
                        </div>
                        <button
                          onClick={() => setSelectedApp(null)}
                          className="p-1 text-[#64748b] hover:text-[#f0f0f0]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="h-[400px] overflow-y-auto p-4 space-y-3">
                        {messages && messages.length > 0 ? (
                          [...messages].reverse().map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex gap-2 ${msg.senderRole === "user" ? "flex-row-reverse" : ""}`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  msg.senderRole === "user" ? "bg-[#c9a96e]/20" : "bg-[#1e3a5f]"
                                }`}
                              >
                                {msg.senderRole === "user" ? (
                                  <User className="w-3 h-3 text-[#c9a96e]" />
                                ) : (
                                  <Bot className="w-3 h-3 text-[#c9a96e]" />
                                )}
                              </div>
                              <div
                                className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                                  msg.senderRole === "user"
                                    ? "bg-[#c9a96e] text-[#0a1628] rounded-tr-none"
                                    : "bg-[#0a1628] text-[#f0f0f0] rounded-tl-none border-l-2 border-[#c9a96e]"
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <MessageSquare className="w-8 h-8 text-[#c9a96e]/20 mx-auto mb-2" />
                            <p className="text-xs text-[#64748b]">No messages yet</p>
                            <p className="text-xs text-[#94a3b8]">Start a conversation</p>
                          </div>
                        )}
                      </div>

                      <div className="p-3 border-t border-[#c9a96e]/10">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 bg-[#0a1628] border border-[#c9a96e]/15 text-[#f0f0f0] placeholder-[#64748b] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#c9a96e]/40"
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim() || sendMessage.isPending}
                            className="p-2 bg-[#c9a96e] text-[#0a1628] rounded-lg hover:bg-[#d4b87a] disabled:opacity-50 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-10 h-10 text-[#c9a96e]/20 mx-auto mb-3" />
                      <p className="text-sm text-[#94a3b8]">Select an application to chat with our team</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

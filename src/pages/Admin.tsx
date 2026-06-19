import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  Shield,
  Search,
  Send,
  User,
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

type Tab = "dashboard" | "applications" | "users" | "contacts" | "messages";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: isAdmin });
  const { data: applications, refetch: refetchApps } = trpc.application.listAll.useQuery(
    { status: statusFilter, search: searchQuery },
    { enabled: isAdmin && (activeTab === "applications" || activeTab === "dashboard") }
  );
  const { data: usersList } = trpc.user.list.useQuery(undefined, { enabled: isAdmin && activeTab === "users" });
  const { data: contactsList } = trpc.contact.list.useQuery(undefined, { enabled: isAdmin && activeTab === "contacts" });
  const { data: appMessages, refetch: refetchMessages } = trpc.message.listByApplication.useQuery(
    { applicationId: selectedAppId! },
    { enabled: !!selectedAppId && isAdmin }
  );

  const updateStatus = trpc.application.updateStatus.useMutation({
    onSuccess: () => refetchApps(),
  });
  const updateRole = trpc.user.updateRole.useMutation({
    onSuccess: () => refetchUsers(),
  });
  const sendMessage = trpc.message.create.useMutation({
    onSuccess: () => {
      setMessageInput("");
      refetchMessages();
    },
  });

  function refetchUsers() {
    // Will be refetched automatically by invalidation
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#c9a96e] animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#f0f0f0] mb-2">Access Denied</h2>
          <p className="text-sm text-[#94a3b8]">You don't have admin privileges.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-[#c9a96e] text-[#0a1628] rounded-lg font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "users", label: "Users", icon: Users },
    { id: "contacts", label: "Contacts", icon: MessageSquare },
    { id: "messages", label: "Messages", icon: Send },
  ];

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar />

      <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-2xl sm:text-3xl font-semibold text-[#f0f0f0]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Admin Panel
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1">Manage applications, users, and communications</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-[#c9a96e] text-[#0a1628]"
                    : "bg-[#0f1f3d] text-[#94a3b8] hover:text-[#f0f0f0] hover:bg-[#152238]"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && stats && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Applications", value: stats.totalApplications, icon: FileText, color: "#c9a96e" },
                  { label: "Pending Review", value: stats.pendingReview, icon: Clock, color: "#f59e0b" },
                  { label: "Approved", value: stats.approved, icon: CheckCircle, color: "#22c55e" },
                  { label: "Total Users", value: stats.totalUsers, icon: Users, color: "#3b82f6" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                      <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                    </div>
                    <p className="text-2xl font-bold text-[#f0f0f0]">{stat.value}</p>
                    <p className="text-sm text-[#94a3b8] mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Applications */}
              <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-[#c9a96e]/10">
                  <h2 className="text-lg font-semibold text-[#f0f0f0]">Recent Applications</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-[#64748b] border-b border-[#c9a96e]/10">
                        <th className="p-4">Quote ID</th>
                        <th className="p-4">Activity</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Cost (AED)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications?.slice(0, 5).map((app) => (
                        <tr key={app.id} className="border-b border-[#c9a96e]/5 hover:bg-[#152238]">
                          <td className="p-4 text-sm font-mono text-[#c9a96e]">{app.quoteId}</td>
                          <td className="p-4 text-sm text-[#f0f0f0]">{app.activity}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[app.status || "draft"]}`}>
                              {statusLabels[app.status || "draft"]}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-[#94a3b8]">{new Date(app.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-sm text-[#f0f0f0]">{Number(app.totalCost || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                  <input
                    type="text"
                    placeholder="Search by quote ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0f1f3d] border border-[#c9a96e]/15 text-[#f0f0f0] placeholder-[#64748b] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#c9a96e]/40"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#0f1f3d] border border-[#c9a96e]/15 text-[#f0f0f0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c9a96e]/40"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-[#64748b] border-b border-[#c9a96e]/10">
                        <th className="p-4">Quote ID</th>
                        <th className="p-4">Activity</th>
                        <th className="p-4">Legal</th>
                        <th className="p-4">Partners</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Cost</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications?.map((app) => (
                        <tr key={app.id} className="border-b border-[#c9a96e]/5 hover:bg-[#152238]">
                          <td className="p-4 text-sm font-mono text-[#c9a96e]">{app.quoteId}</td>
                          <td className="p-4 text-sm text-[#f0f0f0]">{app.activity}</td>
                          <td className="p-4 text-sm text-[#94a3b8] uppercase">{app.legalStructure.replace("_", " ")}</td>
                          <td className="p-4 text-sm text-[#94a3b8] capitalize">{app.partnerCount.replace("_", " ")}</td>
                          <td className="p-4">
                            <select
                              value={app.status || "draft"}
                              onChange={(e) => updateStatus.mutate({ id: app.id, status: e.target.value as any })}
                              className={`px-2 py-1 rounded-full text-xs border-0 cursor-pointer ${statusColors[app.status || "draft"]}`}
                            >
                              <option value="draft">Draft</option>
                              <option value="submitted">Submitted</option>
                              <option value="under_review">Under Review</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="p-4 text-sm text-[#f0f0f0]">{Number(app.totalCost || 0).toLocaleString()}</td>
                          <td className="p-4">
                            <button
                              onClick={() => setSelectedAppId(app.id)}
                              className="text-xs text-[#c9a96e] hover:underline"
                            >
                              View Chat
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-[#64748b] border-b border-[#c9a96e]/10">
                      <th className="p-4">ID</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Auth Type</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList?.map((u) => (
                      <tr key={`${u.authType}-${u.id}`} className="border-b border-[#c9a96e]/5 hover:bg-[#152238]">
                        <td className="p-4 text-sm text-[#94a3b8]">{u.id}</td>
                        <td className="p-4 text-sm text-[#f0f0f0]">{u.name || "N/A"}</td>
                        <td className="p-4 text-sm text-[#94a3b8]">{u.email || "N/A"}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-[#1e3a5f] text-[#94a3b8] capitalize">
                            {u.authType}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.role || "user"}
                            onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value as "user" | "admin", authType: u.authType as "oauth" | "local" })}
                            className="bg-[#0a1628] border border-[#c9a96e]/15 text-[#f0f0f0] rounded px-2 py-1 text-xs"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-4 text-sm text-[#94a3b8]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === "contacts" && (
            <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-[#64748b] border-b border-[#c9a96e]/10">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Message</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactsList?.map((c) => (
                      <tr key={c.id} className="border-b border-[#c9a96e]/5 hover:bg-[#152238]">
                        <td className="p-4 text-sm text-[#f0f0f0]">{c.name}</td>
                        <td className="p-4 text-sm text-[#c9a96e]">{c.email}</td>
                        <td className="p-4 text-sm text-[#94a3b8]">{c.phone || "N/A"}</td>
                        <td className="p-4 text-sm text-[#94a3b8] max-w-xs truncate">{c.message}</td>
                        <td className="p-4 text-sm text-[#64748b]">{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-[#c9a96e]/10">
                    <h3 className="text-sm font-semibold text-[#f0f0f0]">Applications with Messages</h3>
                  </div>
                  <div className="divide-y divide-[#c9a96e]/5 max-h-[600px] overflow-y-auto">
                    {applications?.filter((a) => a.id).map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className={`w-full p-4 text-left hover:bg-[#152238] transition-colors ${
                          selectedAppId === app.id ? "bg-[#152238] border-l-2 border-l-[#c9a96e]" : ""
                        }`}
                      >
                        <p className="text-sm font-medium text-[#f0f0f0]">{app.quoteId}</p>
                        <p className="text-xs text-[#94a3b8]">{app.activity}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl overflow-hidden h-[600px] flex flex-col">
                  {selectedAppId ? (
                    <>
                      <div className="p-4 border-b border-[#c9a96e]/10">
                        <p className="text-sm font-semibold text-[#f0f0f0]">
                          {applications?.find((a) => a.id === selectedAppId)?.quoteId}
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {appMessages && appMessages.length > 0 ? (
                          [...appMessages].reverse().map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex gap-2 ${msg.senderRole === "admin" ? "flex-row-reverse" : ""}`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  msg.senderRole === "admin" ? "bg-[#c9a96e]/20" : "bg-[#1e3a5f]"
                                }`}
                              >
                                {msg.senderRole === "admin" ? (
                                  <Shield className="w-3 h-3 text-[#c9a96e]" />
                                ) : (
                                  <User className="w-3 h-3 text-[#c9a96e]" />
                                )}
                              </div>
                              <div
                                className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                                  msg.senderRole === "admin"
                                    ? "bg-[#c9a96e] text-[#0a1628] rounded-tr-none"
                                    : "bg-[#0a1628] text-[#f0f0f0] rounded-tl-none border-l-2 border-[#c9a96e]"
                                }`}
                              >
                                <p className="font-medium mb-0.5">{msg.senderName}</p>
                                {msg.content}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <MessageSquare className="w-8 h-8 text-[#c9a96e]/20 mx-auto mb-2" />
                            <p className="text-xs text-[#64748b]">No messages yet</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t border-[#c9a96e]/10">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && messageInput.trim() && sendMessage.mutate({ applicationId: selectedAppId, content: messageInput.trim() })}
                            placeholder="Type a reply..."
                            className="flex-1 bg-[#0a1628] border border-[#c9a96e]/15 text-[#f0f0f0] placeholder-[#64748b] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#c9a96e]/40"
                          />
                          <button
                            onClick={() => messageInput.trim() && sendMessage.mutate({ applicationId: selectedAppId, content: messageInput.trim() })}
                            className="p-2 bg-[#c9a96e] text-[#0a1628] rounded-lg hover:bg-[#d4b87a] transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="w-10 h-10 text-[#c9a96e]/20 mx-auto mb-3" />
                        <p className="text-sm text-[#94a3b8]">Select an application to view messages</p>
                      </div>
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

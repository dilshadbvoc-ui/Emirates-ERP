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
  DollarSign,
  Settings,
  Plus,
  Trash2,
  GripVertical,
  Save,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
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

type Tab = "dashboard" | "applications" | "users" | "contacts" | "messages" | "pricing" | "wizard";

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

  // ── Pricing ──────────────────────────────────────────────────────────────
  const { data: pricingData, refetch: refetchPricing } = trpc.services.getPricingConfig.useQuery(
    undefined, { enabled: isAdmin && activeTab === "pricing" }
  );
  const [pricing, setPricing] = useState({ baseCost: 3414, englishNameFee: 2000, investorVisaFee: 4000, employmentVisaFee: 3000 });
  const [pricingSaved, setPricingSaved] = useState(false);
  const savePricing = trpc.services.savePricingConfig.useMutation({
    onSuccess: () => { setPricingSaved(true); refetchPricing(); setTimeout(() => setPricingSaved(false), 2000); },
  });

  // Sync pricing state when data loads
  if (pricingData && pricing.baseCost === 3414 && pricingData.baseCost !== 3414) {
    setPricing(pricingData);
  }

  // ── Wizard Config ─────────────────────────────────────────────────────────
  const { data: wizardData, refetch: refetchWizard } = trpc.services.getWizardConfig.useQuery(
    undefined, { enabled: isAdmin && activeTab === "wizard" }
  );
  const [wizard, setWizard] = useState<typeof wizardData | null>(null);
  const [wizardSaved, setWizardSaved] = useState(false);
  const [expandedType, setExpandedType] = useState<string | null>("professional");
  const [newActivity, setNewActivity] = useState<Record<string, string>>({});
  const saveWizard = trpc.services.saveWizardConfig.useMutation({
    onSuccess: () => { setWizardSaved(true); refetchWizard(); setTimeout(() => setWizardSaved(false), 2000); },
  });

  const activeWizard = wizard ?? wizardData;

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
    { id: "dashboard",    label: "Dashboard",    icon: LayoutDashboard },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "users",        label: "Users",        icon: Users },
    { id: "contacts",     label: "Leads",        icon: MessageSquare },
    { id: "messages",     label: "Messages",     icon: Send },
    { id: "pricing",      label: "Pricing",      icon: DollarSign },
    { id: "wizard",       label: "Wizard Config", icon: Settings },
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
                      <th className="p-4">Company</th>
                      <th className="p-4">Source</th>
                      <th className="p-4">Message</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactsList?.map((c) => (
                      <tr key={c.id} className="border-b border-[#c9a96e]/5 hover:bg-[#152238]">
                        <td className="p-4 text-sm text-[#f0f0f0]">{c.name}</td>
                        <td className="p-4 text-sm text-[#c9a96e]">{c.email}</td>
                        <td className="p-4 text-sm text-[#94a3b8]">{c.phone || "—"}</td>
                        <td className="p-4 text-sm text-[#94a3b8]">{c.companyName || "—"}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${c.source === "apply_wizard" ? "bg-[#c9a96e]/20 text-[#c9a96e]" : "bg-[#1e3a5f] text-[#94a3b8]"}`}>
                            {c.source === "apply_wizard" ? "Wizard" : "Contact Form"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-[#94a3b8] max-w-xs truncate">{c.message || "—"}</td>
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
          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl p-6 space-y-5">
                <h2 className="text-lg font-semibold text-[#f0f0f0]">License Pricing (AED)</h2>
                {[
                  { key: "baseCost",          label: "Base License Cost",          desc: "Core government and registration fees" },
                  { key: "englishNameFee",     label: "English Trade Name Fee",     desc: "Additional fee for English name" },
                  { key: "investorVisaFee",    label: "Investor Visa Fee",          desc: "Per investor visa" },
                  { key: "employmentVisaFee",  label: "Employment Visa Fee",        desc: "Per employment visa" },
                ].map(({ key, label, desc }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-[#f0f0f0] mb-1">{label}</label>
                    <p className="text-xs text-[#64748b] mb-2">{desc}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#94a3b8]">AED</span>
                      <input
                        type="number"
                        min={0}
                        value={pricing[key as keyof typeof pricing]}
                        onChange={(e) => setPricing((p) => ({ ...p, [key]: Number(e.target.value) }))}
                        className="w-40 bg-[#0a1628] border border-[#c9a96e]/15 text-[#f0f0f0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c9a96e]/40"
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-[#c9a96e]/10">
                  <div className="flex items-center justify-between text-sm text-[#94a3b8] mb-1">
                    <span>Sample total (1 investor visa + 2 employment visas):</span>
                    <span className="text-[#c9a96e] font-semibold">
                      AED {(pricing.baseCost + pricing.englishNameFee + pricing.investorVisaFee + pricing.employmentVisaFee * 2).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => savePricing.mutate(pricing)}
                  disabled={savePricing.isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-[#c9a96e] text-[#0a1628] font-semibold rounded-xl hover:bg-[#d4b87a] disabled:opacity-50 transition-colors"
                >
                  {savePricing.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {pricingSaved ? "Saved!" : "Save Pricing"}
                </button>
              </div>
            </div>
          )}

          {/* Wizard Config Tab */}
          {activeTab === "wizard" && activeWizard && (
            <div className="space-y-6">

              {/* Steps order & visibility */}
              <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[#f0f0f0] mb-4">Wizard Steps</h2>
                <p className="text-xs text-[#64748b] mb-4">Toggle steps on/off. The lead capture, trade name, and quote steps are core and always shown.</p>
                <div className="space-y-2">
                  {[...activeWizard.steps].sort((a, b) => a.order - b.order).map((step) => {
                    const isCore = ["lead_capture", "trade_office", "quote"].includes(step.type);
                    return (
                      <div key={step.id} className="flex items-center justify-between p-3 bg-[#0a1628] rounded-lg border border-[#c9a96e]/8">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-[#64748b]" />
                          <span className="text-sm text-[#f0f0f0]">{step.title}</span>
                          {isCore && <span className="text-xs text-[#64748b] bg-[#1e3a5f] px-2 py-0.5 rounded-full">core</span>}
                        </div>
                        <button
                          disabled={isCore}
                          onClick={() => {
                            const updated = { ...activeWizard, steps: activeWizard.steps.map((s) => s.id === step.id ? { ...s, enabled: !s.enabled } : s) };
                            setWizard(updated);
                          }}
                          className="disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {step.enabled
                            ? <ToggleRight className="w-7 h-7 text-[#c9a96e]" />
                            : <ToggleLeft  className="w-7 h-7 text-[#64748b]" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Types */}
              <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[#f0f0f0] mb-4">Activity Types</h2>
                <div className="space-y-3">
                  {activeWizard.activityTypes.map((at) => (
                    <div key={at.id} className="p-4 bg-[#0a1628] rounded-xl border border-[#c9a96e]/8 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedType(expandedType === at.id ? null : at.id)}
                            className="text-[#94a3b8] hover:text-[#f0f0f0]"
                          >
                            {expandedType === at.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <input
                            value={at.title}
                            onChange={(e) => {
                              const updated = { ...activeWizard, activityTypes: activeWizard.activityTypes.map((t) => t.id === at.id ? { ...t, title: e.target.value } : t) };
                              setWizard(updated);
                            }}
                            className="bg-transparent border-b border-[#c9a96e]/20 text-[#f0f0f0] text-sm font-medium focus:outline-none focus:border-[#c9a96e]/50 w-40"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const updated = { ...activeWizard, activityTypes: activeWizard.activityTypes.map((t) => t.id === at.id ? { ...t, enabled: !t.enabled } : t) };
                            setWizard(updated);
                          }}
                        >
                          {at.enabled
                            ? <ToggleRight className="w-7 h-7 text-[#c9a96e]" />
                            : <ToggleLeft  className="w-7 h-7 text-[#64748b]" />}
                        </button>
                      </div>
                      <input
                        value={at.description}
                        onChange={(e) => {
                          const updated = { ...activeWizard, activityTypes: activeWizard.activityTypes.map((t) => t.id === at.id ? { ...t, description: e.target.value } : t) };
                          setWizard(updated);
                        }}
                        className="w-full bg-transparent border-b border-[#c9a96e]/10 text-[#94a3b8] text-xs focus:outline-none focus:border-[#c9a96e]/30"
                      />

                      {/* Activities list */}
                      {expandedType === at.id && (
                        <div className="pt-3 space-y-2">
                          <p className="text-xs text-[#64748b] mb-2">Activities under {at.title}:</p>
                          {((activeWizard.activities as Record<string, { id: string; label: string }[]>)[at.id] ?? []).map((act, idx) => (
                            <div key={act.id} className="flex items-center gap-2">
                              <input
                                value={act.label}
                                onChange={(e) => {
                                  const acts = ((activeWizard.activities as Record<string, { id: string; label: string }[]>)[at.id] ?? []).map((a, i) => i === idx ? { ...a, label: e.target.value } : a);
                                  setWizard({ ...activeWizard, activities: { ...activeWizard.activities, [at.id]: acts } });
                                }}
                                className="flex-1 bg-[#0f1f3d] border border-[#c9a96e]/10 text-[#f0f0f0] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#c9a96e]/30"
                              />
                              <button
                                onClick={() => {
                                  const acts = ((activeWizard.activities as Record<string, { id: string; label: string }[]>)[at.id] ?? []).filter((_, i) => i !== idx);
                                  setWizard({ ...activeWizard, activities: { ...activeWizard.activities, [at.id]: acts } });
                                }}
                                className="text-[#ef4444]/60 hover:text-[#ef4444] transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {/* Add new activity */}
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              placeholder="New activity name..."
                              value={newActivity[at.id] ?? ""}
                              onChange={(e) => setNewActivity((p) => ({ ...p, [at.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && newActivity[at.id]?.trim()) {
                                  const label = newActivity[at.id].trim();
                                  const id = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
                                  const acts = [...(activeWizard.activities[at.id] ?? []), { id, label }];
                                  setWizard({ ...activeWizard, activities: { ...activeWizard.activities, [at.id]: acts } });
                                  setNewActivity((p) => ({ ...p, [at.id]: "" }));
                                }
                              }}
                              className="flex-1 bg-[#0f1f3d] border border-dashed border-[#c9a96e]/20 text-[#f0f0f0] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#c9a96e]/40 placeholder-[#64748b]"
                            />
                            <button
                              onClick={() => {
                                const label = (newActivity[at.id] ?? "").trim();
                                if (!label) return;
                                const id = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
                                const acts = [...(activeWizard.activities[at.id] ?? []), { id, label }];
                                setWizard({ ...activeWizard, activities: { ...activeWizard.activities, [at.id]: acts } });
                                setNewActivity((p) => ({ ...p, [at.id]: "" }));
                              }}
                              className="p-2 bg-[#c9a96e]/10 text-[#c9a96e] rounded-lg hover:bg-[#c9a96e]/20 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add new activity type */}
                  <button
                    onClick={() => {
                      const id = `custom_${Date.now()}`;
                      const updated = {
                        ...activeWizard,
                        activityTypes: [...activeWizard.activityTypes, { id, title: "New Type", description: "Description", enabled: true }],
                        activities: { ...activeWizard.activities, [id]: [] },
                      };
                      setWizard(updated);
                      setExpandedType(id);
                    }}
                    className="flex items-center gap-2 text-sm text-[#c9a96e] hover:text-[#d4b87a] mt-2"
                  >
                    <Plus className="w-4 h-4" /> Add Activity Type
                  </button>
                </div>
              </div>

              {/* Legal Structures */}
              <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[#f0f0f0] mb-4">Legal Structures</h2>
                <div className="space-y-2">
                  {activeWizard.legalStructures.map((ls) => (
                    <div key={ls.id} className="flex items-center justify-between p-3 bg-[#0a1628] rounded-lg border border-[#c9a96e]/8">
                      <div className="flex-1 space-y-1 mr-4">
                        <input
                          value={ls.title}
                          onChange={(e) => {
                            const updated = { ...activeWizard, legalStructures: activeWizard.legalStructures.map((l) => l.id === ls.id ? { ...l, title: e.target.value } : l) };
                            setWizard(updated);
                          }}
                          className="bg-transparent border-b border-[#c9a96e]/20 text-[#f0f0f0] text-sm font-medium focus:outline-none w-full"
                        />
                        <input
                          value={ls.description}
                          onChange={(e) => {
                            const updated = { ...activeWizard, legalStructures: activeWizard.legalStructures.map((l) => l.id === ls.id ? { ...l, description: e.target.value } : l) };
                            setWizard(updated);
                          }}
                          className="bg-transparent border-b border-[#c9a96e]/10 text-[#64748b] text-xs focus:outline-none w-full"
                        />
                      </div>
                      <button onClick={() => {
                        const updated = { ...activeWizard, legalStructures: activeWizard.legalStructures.map((l) => l.id === ls.id ? { ...l, enabled: !l.enabled } : l) };
                        setWizard(updated);
                      }}>
                        {ls.enabled ? <ToggleRight className="w-7 h-7 text-[#c9a96e]" /> : <ToggleLeft className="w-7 h-7 text-[#64748b]" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partner Options */}
              <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[#f0f0f0] mb-4">Partner / Shareholder Options</h2>
                <div className="space-y-2">
                  {activeWizard.partnerOptions.map((po) => (
                    <div key={po.id} className="flex items-center justify-between p-3 bg-[#0a1628] rounded-lg border border-[#c9a96e]/8">
                      <input
                        value={po.label}
                        onChange={(e) => {
                          const updated = { ...activeWizard, partnerOptions: activeWizard.partnerOptions.map((p) => p.id === po.id ? { ...p, label: e.target.value } : p) };
                          setWizard(updated);
                        }}
                        className="bg-transparent border-b border-[#c9a96e]/20 text-[#f0f0f0] text-sm focus:outline-none"
                      />
                      <button onClick={() => {
                        const updated = { ...activeWizard, partnerOptions: activeWizard.partnerOptions.map((p) => p.id === po.id ? { ...p, enabled: !p.enabled } : p) };
                        setWizard(updated);
                      }}>
                        {po.enabled ? <ToggleRight className="w-7 h-7 text-[#c9a96e]" /> : <ToggleLeft className="w-7 h-7 text-[#64748b]" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Types */}
              <div className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[#f0f0f0] mb-4">Office Types</h2>
                <div className="space-y-2">
                  {activeWizard.officeTypes.map((ot) => (
                    <div key={ot.id} className="flex items-center justify-between p-3 bg-[#0a1628] rounded-lg border border-[#c9a96e]/8">
                      <div className="flex-1 space-y-1 mr-4">
                        <input
                          value={ot.label}
                          onChange={(e) => {
                            const updated = { ...activeWizard, officeTypes: activeWizard.officeTypes.map((o) => o.id === ot.id ? { ...o, label: e.target.value } : o) };
                            setWizard(updated);
                          }}
                          className="bg-transparent border-b border-[#c9a96e]/20 text-[#f0f0f0] text-sm font-medium focus:outline-none w-full"
                        />
                        <input
                          value={ot.desc}
                          onChange={(e) => {
                            const updated = { ...activeWizard, officeTypes: activeWizard.officeTypes.map((o) => o.id === ot.id ? { ...o, desc: e.target.value } : o) };
                            setWizard(updated);
                          }}
                          className="bg-transparent border-b border-[#c9a96e]/10 text-[#64748b] text-xs focus:outline-none w-full"
                        />
                      </div>
                      <button onClick={() => {
                        const updated = { ...activeWizard, officeTypes: activeWizard.officeTypes.map((o) => o.id === ot.id ? { ...o, enabled: !o.enabled } : o) };
                        setWizard(updated);
                      }}>
                        {ot.enabled ? <ToggleRight className="w-7 h-7 text-[#c9a96e]" /> : <ToggleLeft className="w-7 h-7 text-[#64748b]" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button
                onClick={() => activeWizard && saveWizard.mutate(activeWizard)}
                disabled={saveWizard.isPending || !activeWizard}
                className="flex items-center gap-2 px-6 py-3 bg-[#c9a96e] text-[#0a1628] font-semibold rounded-xl hover:bg-[#d4b87a] disabled:opacity-50 transition-colors"
              >
                {saveWizard.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {wizardSaved ? "Saved!" : "Save Wizard Config"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

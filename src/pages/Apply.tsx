import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  ShoppingCart,
  Factory,
  Building2,
  Monitor,
  HardHat,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  Quote,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";

// Step definitions
const steps = [
  { number: 1, title: "Activity Type" },
  { number: 2, title: "Activity" },
  { number: 3, title: "Legal Structure" },
  { number: 4, title: "Partners" },
  { number: 5, title: "Trade Name & Office" },
  { number: 6, title: "Quote" },
];

const activityTypes = [
  {
    id: "professional" as const,
    title: "Professional",
    description: "Consultancies, IT services, marketing, HR, accounting",
    icon: Briefcase,
  },
  {
    id: "commercial" as const,
    title: "Commercial",
    description: "Trading, import/export, retail, e-commerce",
    icon: ShoppingCart,
  },
  {
    id: "industrial" as const,
    title: "Industrial",
    description: "Manufacturing, assembly, packaging, processing",
    icon: Factory,
  },
];

const activities: Record<string, string[]> = {
  professional: [
    "Management Consultancy",
    "IT Services",
    "Marketing Services",
    "HR Consultancy",
    "Accounting & Bookkeeping",
    "Educational Services",
  ],
  commercial: [
    "General Trading",
    "Import & Export",
    "Retail Trading",
    "E-Commerce",
    "Wholesale Trading",
    "Foodstuff Trading",
  ],
  industrial: [
    "Manufacturing",
    "Assembly & Production",
    "Packaging",
    "Processing Industries",
    "Factory Operations",
  ],
};

const legalStructures = [
  {
    id: "llc" as const,
    title: "LLC",
    description: "Limited Liability Company, most common structure",
    icon: Building2,
  },
  {
    id: "branch" as const,
    title: "Branch",
    description: "Branch of an existing foreign company",
    icon: Monitor,
  },
  {
    id: "sole_establishment" as const,
    title: "Sole Establishment",
    description: "Owned by a single individual",
    icon: HardHat,
  },
];

const partnerOptions = [
  { id: "single" as const, label: "Single Owner" },
  { id: "two" as const, label: "2 Partners" },
  { id: "three" as const, label: "3 Partners" },
  { id: "four_plus" as const, label: "4+ Partners" },
];

const officeTypes = [
  { id: "virtual" as const, label: "Virtual Office", desc: "Cost-effective remote solution" },
  { id: "physical" as const, label: "Physical Office", desc: "Dedicated office space" },
  { id: "sharing" as const, label: "Sharing Office", desc: "Shared workspace" },
];

interface FormData {
  activityType: "professional" | "commercial" | "industrial" | "";
  activity: string;
  legalStructure: "llc" | "branch" | "sole_establishment" | "";
  partnerCount: "single" | "two" | "three" | "four_plus" | "";
  tradeName: string;
  tradeNameLanguage: "english" | "arabic";
  officeType: "virtual" | "physical" | "sharing" | "";
  investorVisa: boolean;
  employmentVisaCount: number;
}

export default function Apply() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    activityType: "",
    activity: "",
    legalStructure: "",
    partnerCount: "",
    tradeName: "",
    tradeNameLanguage: "english",
    officeType: "",
    investorVisa: false,
    employmentVisaCount: 0,
  });
  const [quoteResult, setQuoteResult] = useState<{ id: number; quoteId: string } | null>(null);

  const createApp = trpc.application.create.useMutation({
    onSuccess: (data) => {
      setQuoteResult(data);
    },
  });

  const updateForm = (updates: Partial<FormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!form.activityType;
      case 1: return !!form.activity;
      case 2: return !!form.legalStructure;
      case 3: return !!form.partnerCount;
      case 4: return !!form.officeType;
      default: return true;
    }
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/apply");
      return;
    }
    createApp.mutate({
      activityType: form.activityType as "professional" | "commercial" | "industrial",
      activity: form.activity,
      legalStructure: form.legalStructure as "llc" | "branch" | "sole_establishment",
      partnerCount: form.partnerCount as "single" | "two" | "three" | "four_plus",
      tradeName: form.tradeName || undefined,
      tradeNameLanguage: form.tradeNameLanguage,
      officeType: form.officeType as "virtual" | "physical" | "sharing",
      investorVisa: form.investorVisa,
      employmentVisaCount: form.employmentVisaCount,
    });
  };

  const baseCost = 3414;
  const englishNameFee = form.tradeNameLanguage === "english" ? 2000 : 0;
  const investorVisaFee = form.investorVisa ? 4000 : 0;
  const employmentVisaFee = form.employmentVisaCount * 3000;
  const totalCost = baseCost + englishNameFee + investorVisaFee + employmentVisaFee;

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1
              className="text-3xl sm:text-4xl font-semibold text-[#f0f0f0] mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Mainland License Application
            </h1>
            <p className="text-[#94a3b8]">Complete the 6-step wizard to get your customized quote</p>
          </motion.div>

          {/* Step Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#1e3a5f] -translate-y-1/2 z-0" />
              <motion.div
                className="absolute top-1/2 left-0 h-[2px] bg-[#c9a96e] -translate-y-1/2 z-0"
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />

              {steps.map((step, i) => (
                <div key={step.number} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      i < currentStep
                        ? "bg-[#c9a96e] text-[#0a1628]"
                        : i === currentStep
                        ? "bg-[#0f1f3d] border-2 border-[#c9a96e] text-[#c9a96e]"
                        : "bg-[#0f1f3d] border border-[#64748b] text-[#64748b]"
                    }`}
                  >
                    {i < currentStep ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <span
                    className={`mt-2 text-xs hidden sm:block ${
                      i <= currentStep ? "text-[#f0f0f0]" : "text-[#64748b]"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl p-6 sm:p-10"
            >
              {/* Step 1: Activity Type */}
              {currentStep === 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-[#f0f0f0] mb-2">Choose Activity Type</h2>
                  <p className="text-sm text-[#94a3b8] mb-8">Select the category that best describes your business</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {activityTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => updateForm({ activityType: type.id, activity: "" })}
                        className={`p-6 rounded-xl border-2 text-center transition-all duration-300 ${
                          form.activityType === type.id
                            ? "border-[#c9a96e] bg-[#152238] shadow-lg shadow-[#c9a96e]/10"
                            : "border-[#c9a96e]/15 bg-[#0a1628] hover:border-[#c9a96e]/30"
                        }`}
                      >
                        <type.icon className="w-10 h-10 text-[#c9a96e] mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-[#f0f0f0] mb-1">{type.title}</h3>
                        <p className="text-xs text-[#94a3b8]">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Activity */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-[#f0f0f0] mb-2">Choose Activity</h2>
                  <p className="text-sm text-[#94a3b8] mb-8">Select your specific business activity</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activities[form.activityType]?.map((activity) => (
                      <button
                        key={activity}
                        onClick={() => updateForm({ activity })}
                        className={`p-4 rounded-lg border text-left transition-all duration-300 ${
                          form.activity === activity
                            ? "border-[#c9a96e] bg-[#c9a96e]/10"
                            : "border-[#c9a96e]/10 bg-[#0a1628] hover:border-[#c9a96e]/25"
                        }`}
                      >
                        <span className="text-sm font-medium text-[#f0f0f0]">{activity}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Legal Structure */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-[#f0f0f0] mb-2">Choose Legal Structure</h2>
                  <p className="text-sm text-[#94a3b8] mb-8">Select the legal structure for your business</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {legalStructures.map((ls) => (
                      <button
                        key={ls.id}
                        onClick={() => updateForm({ legalStructure: ls.id })}
                        className={`p-6 rounded-xl border-2 text-center transition-all duration-300 ${
                          form.legalStructure === ls.id
                            ? "border-[#c9a96e] bg-[#152238] shadow-lg shadow-[#c9a96e]/10"
                            : "border-[#c9a96e]/15 bg-[#0a1628] hover:border-[#c9a96e]/30"
                        }`}
                      >
                        <ls.icon className="w-10 h-10 text-[#c9a96e] mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-[#f0f0f0] mb-1">{ls.title}</h3>
                        <p className="text-xs text-[#94a3b8]">{ls.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Partners */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-[#f0f0f0] mb-2">Number of Partners</h2>
                  <p className="text-sm text-[#94a3b8] mb-8">How many shareholders or partners will you have?</p>
                  <div className="flex flex-wrap gap-3">
                    {partnerOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => updateForm({ partnerCount: option.id })}
                        className={`px-8 py-4 rounded-full border-2 font-medium transition-all duration-300 ${
                          form.partnerCount === option.id
                            ? "border-[#c9a96e] bg-[#c9a96e] text-[#0a1628]"
                            : "border-[#c9a96e]/20 text-[#94a3b8] hover:border-[#c9a96e]/40"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Trade Name & Office */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-[#f0f0f0] mb-2">Trade Name & Office Setup</h2>
                    <p className="text-sm text-[#94a3b8] mb-6">Provide your trade name and office preferences</p>
                  </div>

                  {/* Trade Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#f0f0f0] mb-2">Trade Name</label>
                    <input
                      type="text"
                      placeholder="Enter your desired trade name"
                      value={form.tradeName}
                      onChange={(e) => updateForm({ tradeName: e.target.value })}
                      className="w-full bg-[#0a1628] border border-[#c9a96e]/15 text-[#f0f0f0] placeholder-[#64748b] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a96e]/40 transition-colors"
                    />
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-[#f0f0f0] mb-3">Trade Name Language</label>
                    <div className="flex gap-4">
                      {(["english", "arabic"] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => updateForm({ tradeNameLanguage: lang })}
                          className={`flex-1 p-4 rounded-lg border-2 text-center transition-all duration-300 ${
                            form.tradeNameLanguage === lang
                              ? "border-[#c9a96e] bg-[#c9a96e]/10"
                              : "border-[#c9a96e]/10 bg-[#0a1628]"
                          }`}
                        >
                          <span className="text-sm font-medium text-[#f0f0f0] capitalize">{lang}</span>
                          {lang === "english" && (
                            <span className="block text-xs text-[#c9a96e] mt-1">+ AED 2,000</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Office Type */}
                  <div>
                    <label className="block text-sm font-medium text-[#f0f0f0] mb-3">Office Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {officeTypes.map((office) => (
                        <button
                          key={office.id}
                          onClick={() => updateForm({ officeType: office.id })}
                          className={`p-4 rounded-lg border-2 text-center transition-all duration-300 ${
                            form.officeType === office.id
                              ? "border-[#c9a96e] bg-[#152238]"
                              : "border-[#c9a96e]/10 bg-[#0a1628] hover:border-[#c9a96e]/25"
                          }`}
                        >
                          <h4 className="text-sm font-semibold text-[#f0f0f0]">{office.label}</h4>
                          <p className="text-xs text-[#94a3b8] mt-1">{office.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Quote Summary */}
              {currentStep === 5 && (
                <div>
                  {!quoteResult ? (
                    <>
                      <h2 className="text-xl font-semibold text-[#f0f0f0] mb-2">Quote Summary</h2>
                      <p className="text-sm text-[#94a3b8] mb-6">Review your selections and get your quote</p>

                      <div className="space-y-4 mb-8">
                        {/* Summary items */}
                        {[
                          { label: "Activity Type", value: form.activityType?.charAt(0).toUpperCase() + form.activityType?.slice(1) },
                          { label: "Activity", value: form.activity },
                          { label: "Legal Structure", value: form.legalStructure?.replace("_", " ").toUpperCase() },
                          { label: "Partners", value: partnerOptions.find((p) => p.id === form.partnerCount)?.label },
                          { label: "Trade Name", value: form.tradeName || "Not specified" },
                          { label: "Trade Name Language", value: form.tradeNameLanguage?.charAt(0).toUpperCase() + form.tradeNameLanguage?.slice(1) + (form.tradeNameLanguage === "english" ? " (+AED 2,000)" : " (No extra fee)") },
                          { label: "Office Type", value: officeTypes.find((o) => o.id === form.officeType)?.label },
                        ].map((item) => (
                          <div key={item.label} className="flex justify-between py-2 border-b border-[#c9a96e]/10">
                            <span className="text-sm text-[#94a3b8]">{item.label}</span>
                            <span className="text-sm text-[#f0f0f0] font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Visa Options */}
                      <div className="bg-[#0a1628] rounded-xl p-5 mb-8 space-y-4">
                        <h3 className="text-sm font-semibold text-[#f0f0f0]">Visa Options</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-[#f0f0f0]">Investor Visa</span>
                            <span className="block text-xs text-[#94a3b8]">+ AED 4,000</span>
                          </div>
                          <button
                            onClick={() => updateForm({ investorVisa: !form.investorVisa })}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              form.investorVisa ? "bg-[#c9a96e]" : "bg-[#1e3a5f]"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white transition-transform mx-0.5 ${
                                form.investorVisa ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#f0f0f0]">Employment Visas</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateForm({ employmentVisaCount: Math.max(0, form.employmentVisaCount - 1) })}
                              className="w-8 h-8 rounded-lg bg-[#1e3a5f] text-[#f0f0f0] flex items-center justify-center hover:bg-[#2a4f7a] transition-colors"
                            >
                              -
                            </button>
                            <span className="text-sm text-[#f0f0f0] w-6 text-center">{form.employmentVisaCount}</span>
                            <button
                              onClick={() => updateForm({ employmentVisaCount: form.employmentVisaCount + 1 })}
                              className="w-8 h-8 rounded-lg bg-[#1e3a5f] text-[#f0f0f0] flex items-center justify-center hover:bg-[#2a4f7a] transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        {form.employmentVisaCount > 0 && (
                          <span className="text-xs text-[#94a3b8]">+ AED {form.employmentVisaCount * 3000} for employment visas</span>
                        )}
                      </div>

                      {/* Total */}
                      <div className="bg-[#c9a96e]/10 border border-[#c9a96e]/20 rounded-xl p-5 mb-8">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#94a3b8]">Estimated Total</span>
                          <span className="text-2xl font-bold text-[#c9a96e]">AED {totalCost.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-[#94a3b8] mt-2">
                          * Additional costs may apply based on external approvals
                        </p>
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={createApp.isPending || !isAuthenticated}
                        className="w-full py-4 bg-[#c9a96e] text-[#0a1628] font-semibold rounded-xl hover:bg-[#d4b87a] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {createApp.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                          </>
                        ) : !isAuthenticated ? (
                          "Sign in to Get Quote"
                        ) : (
                          <>
                            <Quote className="w-5 h-5" /> Get Final Quote
                          </>
                        )}
                      </button>
                      {!isAuthenticated && (
                        <p className="text-xs text-[#94a3b8] text-center mt-3">
                          Please <button onClick={() => navigate("/login?redirect=/apply")} className="text-[#c9a96e] underline">sign in</button> to submit your application
                        </p>
                      )}
                    </>
                  ) : (
                    /* Quote Success */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-[#22c55e]" />
                      </div>
                      <h3 className="text-2xl font-semibold text-[#f0f0f0] mb-2">Quote Generated!</h3>
                      <p className="text-[#94a3b8] mb-6">Your application has been submitted successfully.</p>

                      <div className="bg-[#0a1628] rounded-xl p-6 mb-6 max-w-sm mx-auto">
                        <p className="text-xs text-[#94a3b8] mb-1">Quote ID</p>
                        <p className="text-xl font-bold text-[#c9a96e] font-mono">{quoteResult.quoteId}</p>
                      </div>

                      <div className="bg-[#c9a96e]/10 border border-[#c9a96e]/20 rounded-xl p-5 mb-8 max-w-sm mx-auto">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#94a3b8]">Total Cost</span>
                          <span className="text-xl font-bold text-[#c9a96e]">AED {totalCost.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => navigate("/dashboard")}
                          className="px-8 py-3 bg-[#c9a96e] text-[#0a1628] font-semibold rounded-xl hover:bg-[#d4b87a] transition-colors"
                        >
                          View in Dashboard
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-8 py-3 border border-[#c9a96e]/30 text-[#c9a96e] font-semibold rounded-xl hover:bg-[#c9a96e]/5 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Print Quote
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {!quoteResult && (
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 border border-[#c9a96e]/20 text-[#94a3b8] rounded-xl hover:border-[#c9a96e]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {currentStep < 5 && (
                <button
                  onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 bg-[#c9a96e] text-[#0a1628] font-semibold rounded-xl hover:bg-[#d4b87a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <AIAssistant />
    </div>
  );
}

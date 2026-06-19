import { motion } from "framer-motion";
import { Briefcase, ShoppingCart, Building2, Users, PenTool, Quote } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose Activity Type",
    description: "Select from Professional, Commercial, or Industrial license categories",
    icon: Briefcase,
  },
  {
    number: "02",
    title: "Select Activity",
    description: "Pick specific activities within your chosen category",
    icon: ShoppingCart,
  },
  {
    number: "03",
    title: "Legal Structure",
    description: "LLC, Branch, or Sole Establishment — choose what fits your business",
    icon: Building2,
  },
  {
    number: "04",
    title: "Define Partners",
    description: "Specify number of shareholders or partners for your company",
    icon: Users,
  },
  {
    number: "05",
    title: "Trade Name",
    description: "Choose your English or Arabic trade name for your business",
    icon: PenTool,
  },
  {
    number: "06",
    title: "Get Quote",
    description: "Receive your customized mainland license quote instantly",
    icon: Quote,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl sm:text-4xl font-semibold text-[#f0f0f0] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Simple 6-Step Process
          </h2>
          <p className="text-[#94a3b8]">From selection to quote in minutes</p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl p-8 hover:border-[#c9a96e]/25 transition-all duration-300 group"
            >
              {/* Connector line (desktop only) */}
              {i < steps.length - 1 && i % 3 !== 2 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[1px] bg-[#c9a96e]/20" />
              )}

              {/* Step number */}
              <div className="flex items-start justify-between mb-4">
                <span
                  className="text-5xl font-bold text-[#c9a96e]/15 group-hover:text-[#c9a96e]/25 transition-colors"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center group-hover:bg-[#c9a96e]/20 transition-colors">
                  <step.icon className="w-5 h-5 text-[#c9a96e]" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-[#f0f0f0] mb-2">{step.title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

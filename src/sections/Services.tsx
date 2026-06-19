import { motion } from "framer-motion";
import {
  FileCheck,
  Building2,
  Users,
  Globe,
  Landmark,
  CreditCard,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: FileCheck,
    title: "Mainland License",
    description: "Complete mainland company formation with DED approval and documentation.",
  },
  {
    icon: Globe,
    title: "Trade Name Registration",
    description: "English and Arabic trade name reservation services with DED.",
  },
  {
    icon: Building2,
    title: "Office Solutions",
    description: "Virtual, physical, and shared office space arrangements across Dubai.",
  },
  {
    icon: Users,
    title: "Visa Processing",
    description: "Investor and employment visa applications, renewals, and cancellations.",
  },
  {
    icon: Landmark,
    title: "Document Clearing",
    description: "All government documentation, attestations, and PRO services.",
  },
  {
    icon: CreditCard,
    title: "Bank Account Setup",
    description: "Corporate bank account opening assistance with major UAE banks.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-[#0a1628]">
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
            Our Services
          </h2>
          <p className="text-[#94a3b8]">Comprehensive business setup solutions</p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group bg-[#0f1f3d] border border-[#c9a96e]/10 rounded-2xl p-8 hover:border-[#c9a96e]/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#c9a96e]/20 transition-colors">
                  <service.icon className="w-6 h-6 text-[#c9a96e]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#f0f0f0] mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-[#94a3b8] leading-relaxed mb-3">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-[#c9a96e] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

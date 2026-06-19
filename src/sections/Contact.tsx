import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    submitMutation.mutate(form);
  };

  return (
    <section id="contact" className="py-20 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <h2
              className="text-3xl font-semibold text-[#f0f0f0] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Get in Touch
            </h2>
            <p className="text-[#94a3b8] mb-8">
              Have questions about mainland license? Our team is here to help.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0f1f3d] border border-[#22c55e]/30 rounded-2xl p-8 text-center"
              >
                <CheckCircle className="w-12 h-12 text-[#22c55e] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#f0f0f0] mb-2">Message Sent!</h3>
                <p className="text-[#94a3b8]">We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-[#c9a96e] text-sm hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full bg-[#0f1f3d] border border-[#c9a96e]/15 text-[#f0f0f0] placeholder-[#64748b] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#c9a96e]/40 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full bg-[#0f1f3d] border border-[#c9a96e]/15 text-[#f0f0f0] placeholder-[#64748b] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#c9a96e]/40 transition-colors"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-[#0f1f3d] border border-[#c9a96e]/15 text-[#f0f0f0] placeholder-[#64748b] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#c9a96e]/40 transition-colors"
                />
                <textarea
                  placeholder="Your Message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full bg-[#0f1f3d] border border-[#c9a96e]/15 text-[#f0f0f0] placeholder-[#64748b] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#c9a96e]/40 transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full bg-[#c9a96e] text-[#0a1628] font-semibold rounded-lg px-4 py-3.5 hover:bg-[#d4b87a] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {submitMutation.isPending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </button>
                {submitMutation.isError && (
                  <p className="text-[#ef4444] text-sm">Failed to send. Please try again.</p>
                )}
              </form>
            )}
          </motion.div>

          {/* Right: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            <h3 className="text-xl font-semibold text-[#f0f0f0]">Contact Information</h3>

            <div className="space-y-6">
              {[
                {
                  icon: MapPin,
                  label: "Address",
                  value: "India GCC Business Lounge, Dubai, UAE",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: "+971 4 XXX XXXX",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: "info@igcc.ae",
                },
                {
                  icon: Clock,
                  label: "Business Hours",
                  value: "Sunday – Thursday: 9:00 AM – 6:00 PM GST",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#c9a96e]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[#c9a96e]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#64748b] mb-0.5">{item.label}</p>
                    <p className="text-sm text-[#f0f0f0]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="rounded-xl overflow-hidden border border-[#c9a96e]/10 h-[250px] bg-[#0f1f3d] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-[#c9a96e]/40 mx-auto mb-2" />
                <p className="text-sm text-[#64748b]">Dubai, United Arab Emirates</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

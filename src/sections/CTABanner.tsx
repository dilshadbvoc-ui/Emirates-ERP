import { Link } from "react-router";
import { motion } from "framer-motion";

export default function CTABanner() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#0f1f3d] to-[#152238] border-y border-[#c9a96e]/10">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-3xl sm:text-4xl font-semibold text-[#f0f0f0] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ready to Start Your Business?
          </h2>
          <p className="text-[#94a3b8] mb-8">
            Get your customized mainland license quote today.
          </p>
          <Link
            to="/apply"
            className="inline-block px-10 py-4 bg-[#c9a96e] text-[#0a1628] font-semibold rounded-full hover:bg-[#d4b87a] transition-all hover:scale-[1.02]"
          >
            Get Your Quote
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

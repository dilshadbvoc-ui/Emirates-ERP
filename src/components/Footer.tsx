import { Link } from "react-router";
import { MapPin, Phone, Mail, Clock, Linkedin, Twitter, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#070f1d] border-t border-[#c9a96e]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-bold text-[#c9a96e]" style={{ fontFamily: "'Playfair Display', serif" }}>
                IGCC
              </span>
            </Link>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Your Gateway to Dubai Business. Professional mainland license services for entrepreneurs and enterprises.
            </p>
            <div className="flex gap-3 pt-2">
              {[Linkedin, Twitter, Instagram, Facebook].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-full bg-[#0f1f3d] border border-[#c9a96e]/15 flex items-center justify-center text-[#94a3b8] hover:text-[#c9a96e] hover:border-[#c9a96e]/30 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#f0f0f0] uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Apply Now", href: "/apply" },
                { label: "Services", href: "/#services" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "Contact Us", href: "/#contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#94a3b8] hover:text-[#c9a96e] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-[#f0f0f0] uppercase tracking-wider mb-4">
              Services
            </h4>
            <ul className="space-y-3">
              {[
                "Mainland License",
                "Freezone Setup",
                "Offshore Company",
                "Visa Services",
                "PRO Services",
              ].map((service) => (
                <li key={service}>
                  <span className="text-sm text-[#94a3b8] hover:text-[#c9a96e] transition-colors cursor-default">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-[#f0f0f0] uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#c9a96e] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#94a3b8]">
                  India GCC Business Lounge, Dubai, UAE
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#c9a96e] flex-shrink-0" />
                <span className="text-sm text-[#94a3b8]">+971 4 XXX XXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#c9a96e] flex-shrink-0" />
                <span className="text-sm text-[#94a3b8]">info@igcc.ae</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#c9a96e] flex-shrink-0" />
                <span className="text-sm text-[#94a3b8]">
                  Sun – Thu: 9:00 AM – 6:00 PM GST
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#c9a96e]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#64748b]">
              &copy; {new Date().getFullYear()} IGCC Dubai. All rights reserved.
            </p>
            <div className="flex gap-6">
              <span className="text-xs text-[#64748b] hover:text-[#94a3b8] cursor-pointer transition-colors">
                Privacy Policy
              </span>
              <span className="text-xs text-[#64748b] hover:text-[#94a3b8] cursor-pointer transition-colors">
                Terms of Service
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

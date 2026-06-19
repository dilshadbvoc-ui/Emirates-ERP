import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  FileText,
  Briefcase,
  Phone,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Apply", href: "/apply", icon: FileText },
    { label: "Services", href: "/#services", icon: Briefcase },
    { label: "Contact", href: "/#contact", icon: Phone },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0a1628]/90 backdrop-blur-xl border-b border-[#c9a96e]/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#c9a96e]" style={{ fontFamily: "'Playfair Display', serif" }}>
                IGCC
              </span>
              <span className="text-[11px] uppercase tracking-widest text-[#94a3b8] font-medium">
                Dubai
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium text-[#94a3b8] hover:text-[#f0f0f0] transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#c9a96e] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-[#f0f0f0] hover:text-[#c9a96e] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#c9a96e]/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#c9a96e]" />
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-2 w-48 bg-[#0f1f3d] border border-[#c9a96e]/15 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-4 py-3 text-sm text-[#94a3b8] hover:bg-[#152238] hover:text-[#f0f0f0] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-3 text-sm text-[#94a3b8] hover:bg-[#152238] hover:text-[#f0f0f0] transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#ef4444] hover:bg-[#152238] transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-[#94a3b8] hover:text-[#f0f0f0] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/apply"
                    className="px-6 py-2.5 bg-[#c9a96e] text-[#0a1628] text-sm font-semibold rounded-full hover:bg-[#d4b87a] transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-[#f0f0f0] p-2"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-[#0a1628]"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-12">
                <span className="text-2xl font-bold text-[#c9a96e]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  IGCC
                </span>
                <button onClick={() => setMobileOpen(false)} className="text-[#f0f0f0] p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-6 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="flex items-center gap-3 text-lg text-[#94a3b8] hover:text-[#f0f0f0] transition-colors"
                  >
                    <link.icon className="w-5 h-5 text-[#c9a96e]" />
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 text-lg text-[#94a3b8] hover:text-[#f0f0f0] transition-colors"
                    >
                      <LayoutDashboard className="w-5 h-5 text-[#c9a96e]" />
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 text-lg text-[#94a3b8] hover:text-[#f0f0f0] transition-colors"
                      >
                        <Shield className="w-5 h-5 text-[#c9a96e]" />
                        Admin Panel
                      </Link>
                    )}
                  </>
                )}
              </div>

              <div className="mt-auto">
                {isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 text-[#ef4444] font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      className="w-full py-3 text-center border border-[#c9a96e]/30 text-[#c9a96e] rounded-lg font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/apply"
                      className="w-full py-3 text-center bg-[#c9a96e] text-[#0a1628] rounded-lg font-semibold"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { User, Lock, Loader2, ArrowLeft } from "lucide-react";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = redirect;
    },
    onError: (err) => {
      setError(err.message || "Invalid username or password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#0f1f3d] border border-[#c9a96e]/15 rounded-2xl p-8 sm:p-10">
            {/* Back link */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-[#94a3b8] hover:text-[#f0f0f0] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="text-center mb-8">
              <h1
                className="text-2xl font-semibold text-[#f0f0f0] mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Welcome Back
              </h1>
              <p className="text-sm text-[#94a3b8]">Sign in to your account</p>
            </div>

            {/* Local Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg text-sm text-[#ef4444]">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm text-[#94a3b8] mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-[#0a1628] border border-[#c9a96e]/15 text-[#f0f0f0] placeholder-[#64748b] rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#c9a96e]/40 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#94a3b8] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#0a1628] border border-[#c9a96e]/15 text-[#f0f0f0] placeholder-[#64748b] rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#c9a96e]/40 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-3.5 bg-[#c9a96e] text-[#0a1628] font-semibold rounded-xl hover:bg-[#d4b87a] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loginMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[#94a3b8] mt-6">
              Don't have an account?{" "}
              <Link
                to={`/register${redirect !== "/" ? `?redirect=${redirect}` : ""}`}
                className="text-[#c9a96e] hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

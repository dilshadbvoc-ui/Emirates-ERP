import { Link } from "react-router";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-[#c9a96e]/30 mx-auto mb-6" />
        <h1
          className="text-6xl font-bold text-[#f0f0f0] mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          404
        </h1>
        <p className="text-lg text-[#94a3b8] mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#c9a96e] text-[#0a1628] font-semibold rounded-xl hover:bg-[#d4b87a] transition-colors"
        >
          <Home className="w-5 h-5" /> Go Home
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="text-6xl mb-4 font-mono font-bold text-white/10">404</div>
        <h2 className="text-xl font-semibold mb-2">Page not found</h2>
        <p className="text-white/40 text-sm mb-6">That token or route doesn&apos;t exist.</p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-all"
        >
          ← Back to Dashboard
        </Link>
      </main>
    </div>
  );
}

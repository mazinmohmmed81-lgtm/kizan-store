import Link from "next/link";
import UserNav from "./UserNav";

export default function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-cyan-400">KIZAN</span> STORE
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/accounts" className="hover:text-cyan-400 transition-colors">سوق الحسابات</Link>
          <Link href="/shipping" className="hover:text-cyan-400 transition-colors">شحن الألعاب</Link>
          <Link href="/auctions" className="hover:text-cyan-400 transition-colors">المزادات</Link>
        </div>

        <UserNav />
      </div>
    </nav>
  );
}
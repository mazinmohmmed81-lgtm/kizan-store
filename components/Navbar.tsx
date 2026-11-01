"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* زر القائمة (للجوال) */}
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-white text-2xl">
            ☰
          </button>

          {/* الشعار */}
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-cyan-400">ALKYZAN</span> STORE
          </Link>

          {/* روابط التنقل (للكمبيوتر) */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/accounts" className="hover:text-cyan-400 transition-colors">سوق الحسابات</Link>
            <Link href="/shipping" className="hover:text-cyan-400 transition-colors">شحن الألعاب</Link>
            <Link href="/contact" className="hover:text-cyan-400 transition-colors">اتصل بنا</Link>
          </div>

          {/* زر السلة (يظهر دائماً) */}
          <div className="flex items-center gap-4">
             <Link href="/cart" className="text-cyan-400 font-bold">🛒 السلة</Link>
          </div>
        </div>
      </nav>

      {/* الشريط الجانبي */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
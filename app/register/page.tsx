"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // إنشاء الحساب في Supabase
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage("خطأ: " + error.message);
    } else {
      setMessage("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">إنشاء حساب جديد</h1>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center ${message.includes("خطأ") ? "bg-red-900/50 text-red-400" : "bg-green-900/50 text-green-400"}`}>
            {message}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-cyan-400 hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
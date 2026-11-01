"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage("خطأ: " + error.message);
    } else {
      setMessage("تم تسجيل الدخول بنجاح!");
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">تسجيل الدخول</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">كلمة المرور</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" 
                required 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-2 text-slate-400">
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all disabled:opacity-50">
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        {/* زر Google */}
        <div className="mt-4">
          <button onClick={handleGoogleLogin} className="w-full py-2 bg-white text-black font-bold rounded-lg flex items-center justify-center gap-2">
             الدخول عبر Google
          </button>
        </div>

        {message && <div className="mt-4 p-3 bg-slate-800 text-cyan-400 rounded-lg text-center">{message}</div>}

        <p className="mt-6 text-center text-sm text-slate-400">
          ليس لديك حساب؟ <Link href="/register" className="text-cyan-400">إنشاء حساب</Link>
        </p>
      </div>
    </div>
  );
}
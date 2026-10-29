import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-8xl font-bold text-cyan-400 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-4">الصفحة غير موجودة</h2>
      <p className="text-slate-400 mb-8">عذراً، الرابط الذي تحاول الوصول إليه غير متوفر أو تم نقله.</p>
      <Link href="/" className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all">
        العودة للرئيسية
      </Link>
    </div>
  );
}
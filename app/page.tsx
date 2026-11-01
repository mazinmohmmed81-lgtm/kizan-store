import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          <span className="text-cyan-400">ALKYZAN</span> STORE
        </h1>
        <h2 className="text-2xl md:text-4xl font-bold text-slate-300">
          الكيزان ستور
        </h2>
        <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
          منصتك العربية الأولى لبيع وشراء حسابات الألعاب، شحن الألعاب، 
          والمنتجات الرقمية بأمان واحترافية عبر وسيط معتمد.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/accounts" className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-600/30">
            تصفح سوق الحسابات
          </Link>
          <Link href="/shipping" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700">
            شحن الألعاب
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-20 w-full">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h3 className="text-xl font-bold text-cyan-400 mb-2">وساطة آمنة</h3>
          <p className="text-slate-400">الإدارة تتولى التفاوض وإتمام الصفقات باحترافية.</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h3 className="text-xl font-bold text-cyan-400 mb-2">شحن سريع</h3>
          <p className="text-slate-400">باقات شحن لجميع الألعاب الشهيرة بأسعار تنافسية.</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h3 className="text-xl font-bold text-cyan-400 mb-2">منتجات رقمية</h3>
          <p className="text-slate-400">بطاقات، عناصر، وعملات رقمية مسموح ببيعها.</p>
        </div>
      </div>

    </div>
  );
}
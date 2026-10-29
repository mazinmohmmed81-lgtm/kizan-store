"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ShippingPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // حالة النموذج (Modal)
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [playerId, setPlayerId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      const { data } = await supabase.from("shipping_packages").select("*");
      if (data) setPackages(data);
      setLoading(false);
    };
    init();
  }, []);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("يجب تسجيل الدخول أولاً لطلب الشحن.");
      router.push("/login");
      return;
    }
    
    setActionLoading(true);
    const { error } = await supabase.from("shipping_orders").insert({
      agent_id: user.id,
      package_id: selectedPackage.id,
      player_id: playerId,
      status: "new"
    });

    if (error) {
      alert("خطأ في إنشاء الطلب: " + error.message);
    } else {
      alert("تم إنشاء طلب الشحن بنجاح! سيتم مراجعته من قبل الإدارة.");
      setSelectedPackage(null);
      setPlayerId("");
    }
    setActionLoading(false);
  };

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري تحميل الباقات...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">شحن الألعاب</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-slate-800 text-cyan-400 text-xs font-bold rounded-full">
                {pkg.game_name}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{pkg.package_name}</h3>
            
            {/* عرض السعر بناءً على ما إذا كان المستخدم مسجلاً (نفترض أنه وكيل) */}
            <p className="text-slate-400 mb-6 flex-grow">
              السعر: <span className="text-2xl font-bold text-cyan-400">{user ? pkg.price_agent : pkg.price_customer} ر.س</span>
            </p>
            
            <button 
              onClick={() => {
                if (!user) { router.push("/login"); return; }
                setSelectedPackage(pkg);
              }}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all"
            >
              طلب شحن
            </button>
          </div>
        ))}
      </div>

      {/* نموذج إدخال معرف اللاعب (Modal) */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">طلب شحن: {selectedPackage.package_name}</h2>
            <form onSubmit={handleOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">معرف اللاعب (Player ID)</label>
                <input 
                  type="text" 
                  value={playerId} 
                  onChange={(e) => setPlayerId(e.target.value)} 
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" 
                  required 
                  placeholder="أدخل معرف اللاعب في اللعبة"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {actionLoading ? "جاري الطلب..." : "تأكيد الطلب"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setSelectedPackage(null)}
                  className="flex-1 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
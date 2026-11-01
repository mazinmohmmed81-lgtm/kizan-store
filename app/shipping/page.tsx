"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ShippingPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [playerId, setPlayerId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      // جلب بيانات المستخدم ورصيده
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: wallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", session.user.id)
          .single();
        if (wallet) setBalance(wallet.balance);
      }
      
      // جلب باقات الشحن
      const { data } = await supabase.from("shipping_packages").select("*");
      if (data) setPackages(data);
    };
    init();
  }, []);

  const handleOrder = async () => {
    if (!user) { router.push("/login"); return; }
    if (balance < selectedPackage.price_agent) { 
      alert("رصيدك غير كافٍ! يرجى التواصل مع الإدارة لشحن محفظتك."); 
      return; 
    }
    
    // خصم المبلغ من المحفظة
    await supabase.rpc('add_wallet_balance', { 
      p_user_id: user.id, 
      p_amount: -selectedPackage.price_agent, 
      p_description: `شحن ${selectedPackage.package_name}` 
    });
    
    // إنشاء الطلب
    await supabase.from("shipping_orders").insert({ 
      agent_id: user.id, 
      package_id: selectedPackage.id, 
      player_id: playerId, 
      status: "new" 
    });
    
    alert("تم إنشاء الطلب وخصم المبلغ من محفظتك!");
    setBalance(balance - selectedPackage.price_agent); 
    setSelectedPackage(null);
    setPlayerId("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">شحن الألعاب</h1>
        {user && (
          <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-xl">
            <span className="text-slate-400">رصيدك: </span>
            <span className="text-2xl font-bold text-green-400">{balance} $</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">{pkg.package_name}</h3>
            <p className="text-2xl text-cyan-400 font-bold mb-6 flex-grow">{pkg.price_agent} $</p>
            <button 
              onClick={() => { 
                if (!user) { router.push("/login"); return; } 
                setSelectedPackage(pkg); 
              }} 
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all"
            >
              شراء
            </button>
          </div>
        ))}
      </div>

      {/* نافذة إدخال معرف اللاعب */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full">
            <h2 className="text-xl text-white font-bold mb-4">طلب شحن: {selectedPackage.package_name}</h2>
            <input 
              type="text" 
              placeholder="أدخل معرف اللاعب (Player ID)" 
              value={playerId} 
              onChange={e => setPlayerId(e.target.value)} 
              className="w-full px-4 py-2 bg-slate-950 text-white border border-slate-700 rounded-lg mb-4" 
            />
            <button 
              onClick={handleOrder} 
              className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg"
            >
              تأكيد الدفع
            </button>
            <button 
              onClick={() => setSelectedPackage(null)} 
              className="mt-2 w-full text-slate-400 hover:text-white"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
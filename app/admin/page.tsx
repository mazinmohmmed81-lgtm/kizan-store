"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders"); // orders, games, packages, wallets, listings

  // البيانات
  const [orders, setOrders] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingListings, setPendingListings] = useState<any[]>([]); // لإعلانات الحسابات

  // حقول الإدخال
  const [newGameName, setNewGameName] = useState("");
  const [pkgData, setPkgData] = useState({ game_id: "", package_name: "", price_agent: "", price_customer: "" });
  const [walletData, setWalletData] = useState({ user_id: "", amount: "" });
  
  const router = useRouter();

  const fetchData = async () => {
    // طلبات الشحن
    const { data: ordersData } = await supabase.from("shipping_orders").select(`*, shipping_packages (game_name, package_name)`).order("created_at", { ascending: false });
    if (ordersData) setOrders(ordersData);

    // الألعاب
    const { data: gamesData } = await supabase.from("games").select("*").order("created_at", { ascending: false });
    if (gamesData) setGames(gamesData);

    // الباقات
    const { data: pkgData } = await supabase.from("shipping_packages").select("*").order("created_at", { ascending: false });
    if (pkgData) setPackages(pkgData);
    
    // الوكلاء (للمحافظ)
    const { data: rolesData } = await supabase.from("user_roles").select("user_id, profiles(email)").eq("role", "shipping_agent");
    if (rolesData) setUsers(rolesData);

    // إعلانات الحسابات المعلقة (بانتظار الموافقة)
    const { data: listingsData } = await supabase.from("listings").select("*").eq("status", "pending").order("created_at", { ascending: false });
    if (listingsData) setPendingListings(listingsData);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      if (!roles?.some((r) => r.role === "admin")) { router.push("/"); return; }

      setUser(session.user);
      await fetchData();
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName) return;
    const { error } = await supabase.from("games").insert({ name: newGameName });
    if (!error) { setNewGameName(""); fetchData(); alert("تمت إضافة اللعبة!"); }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("shipping_packages").insert({
      game_id: pkgData.game_id,
      package_name: pkgData.package_name,
      price_agent: parseFloat(pkgData.price_agent),
      price_customer: parseFloat(pkgData.price_customer),
    });
    if (!error) { setPkgData({ game_id: "", package_name: "", price_agent: "", price_customer: "" }); fetchData(); alert("تمت إضافة الباقة!"); }
  };

  const handleChargeWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletData.user_id || !walletData.amount) return;
    const { error } = await supabase.rpc('add_wallet_balance', {
      p_user_id: walletData.user_id,
      p_amount: parseFloat(walletData.amount),
      p_description: "شحن يدوي من الإدارة"
    });
    if (!error) { setWalletData({ user_id: "", amount: "" }); alert("تم شحن المحفظة!"); }
    else alert("خطأ: " + error.message);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await supabase.from("shipping_orders").update({ status: newStatus }).eq("id", orderId);
    fetchData();
  };

  const approveListing = async (listingId: string, adminPrice: string) => {
    if (!adminPrice) { alert("يرجى إدخال السعر النهائي"); return; }
    const { error } = await supabase.from("listings").update({ 
      status: "available", 
      admin_price: parseFloat(adminPrice) 
    }).eq("id", listingId);
    
    if (!error) { alert("تمت الموافقة على الإعلان ونشره في السوق!"); fetchData(); }
  };

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحقق...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">لوحة الإدارة الشاملة</h1>

      {/* التبويبات */}
      <div className="flex gap-4 mb-8 border-b border-slate-800 pb-4 overflow-x-auto">
        <button onClick={() => setActiveTab("orders")} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap ${activeTab === 'orders' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>طلبات الشحن</button>
        <button onClick={() => setActiveTab("listings")} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap ${activeTab === 'listings' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>مراجعة الحسابات</button>
        <button onClick={() => setActiveTab("games")} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap ${activeTab === 'games' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>إدارة الألعاب</button>
        <button onClick={() => setActiveTab("packages")} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap ${activeTab === 'packages' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>إدارة الباقات</button>
        <button onClick={() => setActiveTab("wallets")} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap ${activeTab === 'wallets' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>شحن المحافظ</button>
      </div>

      {/* 1. قسم الطلبات */}
      {activeTab === "orders" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-950 text-slate-400 text-sm">
              <tr><th className="p-4">اللعبة</th><th className="p-4">الباقة</th><th className="p-4">اللاعب</th><th className="p-4">الحالة</th><th className="p-4">إجراءات</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/50">
                  <td className="p-4 text-white">{order.shipping_packages?.game_name}</td>
                  <td className="p-4 text-white">{order.shipping_packages?.package_name}</td>
                  <td className="p-4 text-slate-300">{order.player_id}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.status === 'completed' ? 'bg-green-900/50 text-green-400' : order.status === 'processing' ? 'bg-blue-900/50 text-blue-400' : 'bg-yellow-900/50 text-yellow-400'}`}>{order.status}</span>
                  </td>
                  <td className="p-4 flex gap-2">
                     {order.status === 'new' && <button onClick={() => updateOrderStatus(order.id, 'processing')} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg">بدء</button>}
                     {order.status === 'processing' && <button onClick={() => updateOrderStatus(order.id, 'completed')} className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg">إكمال</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. قسم مراجعة الحسابات */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          {pendingListings.length === 0 ? <p className="text-slate-400">لا توجد إعلانات بانتظار المراجعة.</p> : pendingListings.map((listing) => (
            <div key={listing.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">{listing.title} ({listing.game_name})</h3>
              <p className="text-slate-400 mb-2">{listing.description}</p>
              <p className="text-slate-300 mb-4">السعر المقترح من العميل: <span className="font-bold text-cyan-400">{listing.price} ر.س</span></p>
              
              <div className="flex gap-4 items-end">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">السعر النهائي (الذي سيظهر للسوق)</label>
                  <input type="number" id={`price-${listing.id}`} defaultValue={listing.price} className="px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" />
                </div>
                <button onClick={() => {
                  const val = (document.getElementById(`price-${listing.id}`) as HTMLInputElement).value;
                  approveListing(listing.id, val);
                }} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg">موافقة ونشر</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. قسم الألعاب */}
      {activeTab === "games" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">إضافة لعبة جديدة</h2>
            <form onSubmit={handleAddGame} className="flex gap-4">
              <input type="text" placeholder="اسم اللعبة" value={newGameName} onChange={(e) => setNewGameName(e.target.value)} className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" />
              <button type="submit" className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg">إضافة</button>
            </form>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">الألعاب المسجلة</h2>
            <ul className="space-y-2">
              {games.map(g => <li key={g.id} className="text-slate-300 border-b border-slate-800 pb-2">{g.name}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* 4. قسم الباقات */}
      {activeTab === "packages" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">إضافة باقة شحن</h2>
            <form onSubmit={handleAddPackage} className="space-y-4">
              <select value={pkgData.game_id} onChange={(e) => setPkgData({...pkgData, game_id: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required>
                <option value="">اختر اللعبة</option>
                {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <input type="text" placeholder="اسم الباقة (مثلاً: 60 UC)" value={pkgData.package_name} onChange={(e) => setPkgData({...pkgData, package_name: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
              <input type="number" placeholder="سعر الوكيل" value={pkgData.price_agent} onChange={(e) => setPkgData({...pkgData, price_agent: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
              <input type="number" placeholder="سعر العميل" value={pkgData.price_customer} onChange={(e) => setPkgData({...pkgData, price_customer: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
              <button type="submit" className="w-full py-2 bg-cyan-600 text-white font-bold rounded-lg">إضافة الباقة</button>
            </form>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">الباقات المسجلة</h2>
            <ul className="space-y-4">
              {packages.map(p => (
                <li key={p.id} className="text-slate-300 border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">{p.package_name}</span> - وكيل: <span className="text-cyan-400">{p.price_agent} ر.س</span> - عميل: {p.price_customer} ر.س
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 5. قسم المحافظ */}
      {activeTab === "wallets" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg">
          <h2 className="text-xl font-bold text-white mb-4">شحن محفظة وكيل</h2>
          <form onSubmit={handleChargeWallet} className="space-y-4">
            <select value={walletData.user_id} onChange={(e) => setWalletData({...walletData, user_id: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required>
              <option value="">اختر الوكيل</option>
              {users.map(u => <option key={u.user_id} value={u.user_id}>{u.profiles?.email || u.user_id}</option>)}
            </select>
            <input type="number" placeholder="المبلغ" value={walletData.amount} onChange={(e) => setWalletData({...walletData, amount: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
            <button type="submit" className="w-full py-2 bg-green-600 text-white font-bold rounded-lg">شحن</button>
          </form>
        </div>
      )}

    </div>
  );
}
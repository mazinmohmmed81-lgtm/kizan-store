"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("deposits");

  const [deposits, setDeposits] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [pendingListings, setPendingListings] = useState<any[]>([]);

  const [newGameName, setNewGameName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [pkgData, setPkgData] = useState({ game_id: "", package_name: "", price_agent: "", price_customer: "" });
  
  const router = useRouter();

  const fetchData = async () => {
    const { data: depData } = await supabase.from("deposit_requests").select("*").order("created_at", { ascending: false });
    if (depData) setDeposits(depData);

    const { data: agentData } = await supabase.from("user_roles").select("user_id, profiles(email)").eq("role", "shipping_agent");
    if (agentData) setAgents(agentData);

    const { data: gamesData } = await supabase.from("games").select("*");
    if (gamesData) setGames(gamesData);

    const { data: pkgData } = await supabase.from("shipping_packages").select("*");
    if (pkgData) setPackages(pkgData);

    const { data: listingsData } = await supabase.from("listings").select("*").eq("status", "pending");
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
    await supabase.from("games").insert({ name: newGameName });
    setNewGameName(""); fetchData(); alert("تمت إضافة اللعبة!");
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("shipping_packages").insert({
      game_id: pkgData.game_id, package_name: pkgData.package_name,
      price_agent: parseFloat(pkgData.price_agent), price_customer: parseFloat(pkgData.price_customer),
    });
    setPkgData({ game_id: "", package_name: "", price_agent: "", price_customer: "" });
    fetchData(); alert("تمت إضافة الباقة!");
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentEmail) return;
    const { data: userData, error: userError } = await supabase.from("profiles").select("id").eq("email", agentEmail).single();
    if (userError || !userData) { alert("المستخدم غير موجود!"); return; }

    const { error } = await supabase.from("user_roles").insert({ user_id: userData.id, role: "shipping_agent" });
    if (error) alert("خطأ: " + error.message);
    else { alert("تمت إضافة الوكيل بنجاح!"); setAgentEmail(""); fetchData(); }
  };

  const approveDeposit = async (depositId: string, userId: string, amount: number, accountNumber: string) => {
    await supabase.rpc('add_wallet_balance', { p_user_id: userId, p_amount: amount, p_description: "شحن رصيد من الإدارة" });
    await supabase.from("deposit_requests").update({ status: "approved" }).eq("id", depositId);
    alert(`تم شحن رصيد ${amount} ر.س للحساب ${accountNumber}`);
    fetchData();
  };

  const approveListing = async (listingId: string, adminPrice: string) => {
    if (!adminPrice) { alert("يرجى إدخال السعر النهائي"); return; }
    await supabase.from("listings").update({ status: "available", admin_price: parseFloat(adminPrice) }).eq("id", listingId);
    alert("تمت الموافقة على الإعلان ونشره في السوق!"); fetchData();
  };

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحقق...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">لوحة الإدارة الشاملة</h1>

      <div className="flex gap-4 mb-8 border-b border-slate-800 pb-4 overflow-x-auto">
        <button onClick={() => setActiveTab("deposits")} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap ${activeTab === 'deposits' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>طلبات الشحن</button>
        <button onClick={() => setActiveTab("listings")} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap ${activeTab === 'listings' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>مراجعة الحسابات</button>
        <button onClick={() => setActiveTab("agents")} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap ${activeTab === 'agents' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>إدارة الوكلاء</button>
        <button onClick={() => setActiveTab("games")} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap ${activeTab === 'games' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>إدارة الألعاب</button>
        <button onClick={() => setActiveTab("packages")} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap ${activeTab === 'packages' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>إدارة الباقات</button>
      </div>

      {activeTab === "deposits" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-950 text-slate-400 text-sm">
              <tr><th className="p-4">رقم الحساب</th><th className="p-4">المبلغ</th><th className="p-4">الحالة</th><th className="p-4">إجراءات</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {deposits.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-800/50">
                  <td className="p-4 text-white font-bold">{dep.account_number}</td>
                  <td className="p-4 text-cyan-400 font-bold">{dep.amount} ر.س</td>
                  <td className="p-4"><span className={`px-3 py-1 text-xs font-bold rounded-full ${dep.status === 'approved' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>{dep.status}</span></td>
                  <td className="p-4">
                    {dep.status === 'pending' && <button onClick={() => approveDeposit(dep.id, dep.user_id, dep.amount, dep.account_number)} className="px-4 py-1 bg-green-600 text-white text-sm rounded-lg">موافقة وشحن</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "listings" && (
        <div className="space-y-4">
          {pendingListings.map((listing) => (
            <div key={listing.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">{listing.title} ({listing.game_name})</h3>
              <p className="text-slate-400 mb-2">{listing.description}</p>
              <p className="text-slate-300 mb-4">السعر المقترح: <span className="font-bold text-cyan-400">{listing.price} ر.س</span></p>
              <div className="flex gap-4 items-end">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">السعر النهائي</label>
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

      {activeTab === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">إضافة وكيل شحن</h2>
            <form onSubmit={handleAddAgent} className="flex gap-4">
              <input type="email" placeholder="بريد الوكيل" value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
              <button type="submit" className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg">إضافة</button>
            </form>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">الوكلاء المسجلون</h2>
            <ul className="space-y-2">
              {agents.map(a => <li key={a.user_id} className="text-slate-300 border-b border-slate-800 pb-2">{a.profiles?.email}</li>)}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "games" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">إضافة لعبة</h2>
            <form onSubmit={handleAddGame} className="flex gap-4">
              <input type="text" placeholder="اسم اللعبة" value={newGameName} onChange={(e) => setNewGameName(e.target.value)} className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" />
              <button type="submit" className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg">إضافة</button>
            </form>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">الألعاب</h2>
            <ul className="space-y-2">
              {games.map(g => <li key={g.id} className="text-slate-300 border-b border-slate-800 pb-2">{g.name}</li>)}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "packages" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">إضافة باقة</h2>
            <form onSubmit={handleAddPackage} className="space-y-4">
              <select value={pkgData.game_id} onChange={(e) => setPkgData({...pkgData, game_id: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required>
                <option value="">اختر اللعبة</option>
                {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <input type="text" placeholder="اسم الباقة" value={pkgData.package_name} onChange={(e) => setPkgData({...pkgData, package_name: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
              <input type="number" placeholder="سعر الوكيل" value={pkgData.price_agent} onChange={(e) => setPkgData({...pkgData, price_agent: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
              <input type="number" placeholder="سعر العميل" value={pkgData.price_customer} onChange={(e) => setPkgData({...pkgData, price_customer: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
              <button type="submit" className="w-full py-2 bg-cyan-600 text-white font-bold rounded-lg">إضافة الباقة</button>
            </form>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">الباقات</h2>
            <ul className="space-y-4">
              {packages.map(p => (
                <li key={p.id} className="text-slate-300 border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">{p.package_name}</span> - وكيل: {p.price_agent} ر.س - عميل: {p.price_customer} ر.س
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  
  // حقول المنتج
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  // حقل اللعبة
  const [newGame, setNewGame] = useState("");
  
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const { data: p } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (p) setProducts(p);
    
    const { data: g } = await supabase.from("games").select("*");
    if (g) setGames(g);
  };

  useEffect(() => { fetchData(); }, []);

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let finalImageUrl = imageUrl;

    if (file) {
      try {
        finalImageUrl = await uploadImage(file);
      } catch (error: any) {
        alert("خطأ في رفع الصورة: " + error.message);
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from("products").insert({
      name, quantity: parseInt(quantity), image_url: finalImageUrl
    });

    if (!error) {
      setName(""); setQuantity(""); setImageUrl(""); setFile(null); fetchData();
      alert("تمت إضافة المنتج!");
    } else {
      alert("خطأ: " + error.message);
    }
    setLoading(false);
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("games").insert({ name: newGame });
    setNewGame(""); fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">إدارة المنتجات والألعاب</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* إضافة منتج */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">إضافة منتج جديد</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <input type="text" placeholder="اسم المنتج" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
            <input type="number" placeholder="الكمية" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">رفع صورة من الجهاز</label>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">أو رابط صورة (URL)</label>
              <input type="url" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2 bg-cyan-600 text-white font-bold rounded-lg">{loading ? "جاري..." : "إضافة منتج"}</button>
          </form>
        </div>

        {/* إضافة لعبة */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">إضافة لعبة/تطبيق</h2>
          <form onSubmit={handleAddGame} className="flex gap-2 mb-6">
            <input type="text" placeholder="اسم اللعبة" value={newGame} onChange={e => setNewGame(e.target.value)} className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
            <button type="submit" className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg">إضافة</button>
          </form>
          
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {games.map(g => <li key={g.id} className="text-slate-300 border-b border-slate-800 py-2">{g.name}</li>)}
          </ul>
        </div>

      </div>

      {/* عرض المنتجات */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-6">المنتجات الحالية</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-48 object-cover" />}
            <div className="p-6">
              <h3 className="text-xl font-bold text-white">{p.name}</h3>
              <p className="text-slate-400">الكمية المتوفرة: {p.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
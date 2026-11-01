"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

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
      setName(""); setQuantity(""); setImageUrl(""); setFile(null); fetchProducts();
      alert("تمت إضافة المنتج!");
    } else {
      alert("خطأ: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">إدارة المنتجات</h1>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">إضافة منتج جديد</h2>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <input type="text" placeholder="اسم المنتج" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
          <input type="number" placeholder="الكمية" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">إضافة صورة من الجهاز</label>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">أو ضع رابط الصورة (URL)</label>
              <input type="url" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg">{loading ? "جاري..." : "إضافة"}</button>
        </form>
      </div>

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
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUser(session.user);

      const { data } = await supabase.from("cart_items").select(`
        *,
        products (name, image_url)
      `).eq("user_id", session.user.id);
      
      if (data) setCartItems(data);
      setLoading(false);
    };
    fetchCart();
  }, [router]);

  const applyCoupon = async () => {
    if (!coupon) return;
    const { data } = await supabase.from("coupons").select("discount_percentage").eq("code", coupon).eq("is_active", true).single();
    if (data) {
      setDiscount(data.discount_percentage);
      alert(`تم تطبيق الخصم: ${data.discount_percentage}%`);
    } else {
      alert("كود الخصم غير صحيح!");
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.quantity * 10), 0); // افترضنا سعر المنتج 10$ للتجربة
    return subtotal - (subtotal * (discount / 100));
  };

  const handleCheckout = async () => {
    // هنا سيتم إنشاء الطلب وتوجيه المستخدم للدفع
    alert("سيتم توجيهك للدفع قريباً...");
  };

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">سلة المشتريات</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center text-slate-400">السلة فارغة</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b border-slate-800 py-4">
              <div className="flex items-center gap-4">
                {item.products?.image_url && <img src={item.products.image_url} className="w-16 h-16 rounded-lg object-cover" />}
                <div>
                  <p className="text-white font-bold">{item.products?.name}</p>
                  <p className="text-slate-400 text-sm">الكمية: {item.quantity}</p>
                </div>
              </div>
              <p className="text-cyan-400 font-bold">{(item.quantity * 10).toFixed(2)} $</p>
            </div>
          ))}

          <div className="mt-6 space-y-4">
            <div className="flex gap-4">
              <input type="text" placeholder="كود الخصم" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" />
              <button onClick={applyCoupon} className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg">تطبيق</button>
            </div>

            <div className="flex justify-between text-xl font-bold text-white">
              <span>الإجمالي:</span>
              <span className="text-cyan-400">{calculateTotal().toFixed(2)} $</span>
            </div>

            <button onClick={handleCheckout} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl">إتمام الشراء</button>
          </div>
        </div>
      )}
    </div>
  );
}
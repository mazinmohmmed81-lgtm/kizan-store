export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-slate-400 mb-2">
          &copy; {new Date().getFullYear()} KIZAN STORE | كيزان أستور. جميع الحقوق محفوظة.
        </p>
        <div className="flex justify-center gap-4 text-sm text-slate-500">
          <a href="#" className="hover:text-cyan-400 transition-colors">الشروط والأحكام</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">سياسة الخصوصية</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">اتصل بنا</a>
        </div>
      </div>
    </footer>
  );
}
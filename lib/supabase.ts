import { createClient } from '@supabase/supabase-js';

// وضعنا الرابط والمفتاح مباشرة لكي يقرأهما الموقع في وضع التصدير الثابت
const supabaseUrl = 'https://rpvksmqcveaoovrybvpe.supabase.co';
const supabaseAnonKey = 'sb_publishable_W3tMKldpHE1JQHjlkF5TUQ_gPq8kDoA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
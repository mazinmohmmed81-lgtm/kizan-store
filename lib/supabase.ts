import { createClient } from '@supabase/supabase-js';

// وضعنا الرابط والمفتاح مباشرة لكي يقرأهما Cloudflare
const supabaseUrl = 'https://rpvksmqcveaoovrybvpe.supabase.co/rest/v1/';
const supabaseAnonKey = 'sb_publishable_W3tMKldpHE1JQHjlkF5TUQ_gPq8kDoA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { createClient } from '@supabase/supabase-js';

// Replace these strings with the live keys you copied from Step 1
const supabaseUrl = 'https://nkiuslodixcemzmnhugj.supabase.co';
const supabaseAnonKey = 'sb_publishable_UnTD4K1rOsnrUTSpyMhAdQ_lU8RqYKa';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

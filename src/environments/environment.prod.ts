// src/environments/environment.prod.ts
export const environment = {
  production: true,
  supabaseUrl: 'https://qkxifbkphhdywoscmmyh.supabase.co',
  supabaseKey: process.env['SUPABASE_KEY'] || 'sua_chave_do_supabase',
};

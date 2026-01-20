
import { createClient } from '@supabase/supabase-js';

/**
 * CONFIGURAÇÃO DO SUPABASE
 * 
 * Os valores abaixo foram configurados com as credenciais fornecidas pelo utilizador.
 */

const supabaseUrl = 'https://iyojgcgsgabfyjkaqrqs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b2pnY2dzZ2FiZnlqa2FxcnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDYzMzUsImV4cCI6MjA4NDQ4MjMzNX0.0AMYZLXwTl8LzlqaeXHxlgw_2p9YLRTyBMmXh1mZ6bI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = 'https://mlabfssqfvufipwvegpe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYWJmc3NxZnZ1Zmlwd3ZlZ3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDc4MTIsImV4cCI6MjA1OTg4MzgxMn0.tUsDFlR5lrdXf-RsQvhnU4x5fsKvtIU9xrxiedVLSK4';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const checkTables = async () => {
  try {
    // Проверяем существование таблицы complaints
    const { error: complaintsError } = await supabase
      .from('complaints')
      .select('*')
      .limit(1);

    if (complaintsError) {
      console.error('Ошибка при проверке таблицы complaints:', complaintsError);
    }

    // Проверяем существование остальных таблиц
    const { error: prioritiesError } = await supabase
      .from('priorities')
      .select('*')
      .limit(1);

    if (prioritiesError) {
      console.error('Ошибка при проверке таблицы priorities:', prioritiesError);
    }

    const { error: assigneesError } = await supabase
      .from('assignees')
      .select('*')
      .limit(1);

    if (assigneesError) {
      console.error('Ошибка при проверке таблицы assignees:', assigneesError);
    }

    const { error: historyError } = await supabase
      .from('change_history')
      .select('*')
      .limit(1);

    if (historyError) {
      console.error('Ошибка при проверке таблицы change_history:', historyError);
    }

    const { error: contentError } = await supabase
      .from('content_management')
      .select('*')
      .limit(1);

    if (contentError) {
      console.error('Ошибка при проверке таблицы content_management:', contentError);
    }

    return true;
  } catch (error) {
    console.error('Ошибка при проверке таблиц:', error);
    return false;
  }
}; 
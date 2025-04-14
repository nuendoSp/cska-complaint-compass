import { createClient } from '@supabase/supabase-js';

const supabaseUrl = `https://${import.meta.env.VITE_SUPABASE_URL}`;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const createTables = async () => {
  try {
    // Создаем перечисления для статусов и категорий
    await supabase.rpc('create_complaint_enums', {});

    // Создаем таблицу complaints
    const { error: complaintsError } = await supabase
      .from('complaints')
      .select()
      .limit(1);

    if (complaintsError && complaintsError.code === '42P01') {
      const { error } = await supabase.rpc('create_complaints_table', {});
      if (error) throw error;
      console.log('Таблица complaints создана успешно');
    }

    // Создаем таблицу priorities
    const { error: prioritiesError } = await supabase
      .from('priorities')
      .select()
      .limit(1);

    if (prioritiesError && prioritiesError.code === '42P01') {
      const { error } = await supabase.rpc('create_priorities_table', {});
      if (error) throw error;
      console.log('Таблица priorities создана успешно');
    }

    // Создаем таблицу assignees
    const { error: assigneesError } = await supabase
      .from('assignees')
      .select()
      .limit(1);

    if (assigneesError && assigneesError.code === '42P01') {
      const { error } = await supabase.rpc('create_assignees_table', {});
      if (error) throw error;
      console.log('Таблица assignees создана успешно');
    }

    // Создаем таблицу response_templates
    const { error: templatesError } = await supabase
      .from('response_templates')
      .select()
      .limit(1);

    if (templatesError && templatesError.code === '42P01') {
      const { error } = await supabase.rpc('create_response_templates_table', {});
      if (error) throw error;
      console.log('Таблица response_templates создана успешно');
    }

    // Создаем таблицу change_history
    const { error: historyError } = await supabase
      .from('change_history')
      .select()
      .limit(1);

    if (historyError && historyError.code === '42P01') {
      const { error } = await supabase.rpc('create_change_history_table', {});
      if (error) throw error;
      console.log('Таблица change_history создана успешно');
    }

    // Создаем таблицу content_management
    const { error: contentError } = await supabase
      .from('content_management')
      .select()
      .limit(1);

    if (contentError && contentError.code === '42P01') {
      const { error } = await supabase.rpc('create_content_management_table', {});
      if (error) throw error;
      console.log('Таблица content_management создана успешно');
    }

    console.log('Все таблицы успешно созданы или уже существуют');
    return true;
  } catch (error) {
    console.error('Ошибка при создании таблиц:', error);
    return false;
  }
}; 
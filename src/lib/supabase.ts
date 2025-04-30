import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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

// Инициализация хранилища
export async function initStorage() {
  try {
    console.log('Checking for existing storage buckets...');
    
    // Проверяем существование бакета
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'complaint_files');
    
    if (!bucketExists) {
      // Создаем бакет с публичным доступом
      const { data: bucketData, error: createError } = await supabase.storage.createBucket('complaint_files', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/*', 'video/*']
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }
      console.log('Bucket created successfully:', bucketData);
    } else {
      // Обновляем настройки существующего бакета
      const { error: updateError } = await supabase.storage.updateBucket('complaint_files', {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['image/*', 'video/*']
      });
      
      if (updateError) {
        console.error('Error updating bucket settings:', updateError);
      } else {
        console.log('Bucket settings updated successfully');
      }
    }

    // Создаем политики доступа
    await createStoragePolicies();
    
    console.log('Storage initialization completed');
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Функция для создания политик доступа к хранилищу
async function createStoragePolicies() {
  try {
    // SQL для создания политик
    const policies = [
      `
      CREATE POLICY IF NOT EXISTS "Публичный доступ к файлам"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'complaint_files');
      `,
      `
      CREATE POLICY IF NOT EXISTS "Разрешить загрузку файлов всем"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'complaint_files');
      `,
      `
      CREATE POLICY IF NOT EXISTS "Разрешить обновление файлов всем"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'complaint_files');
      `,
      `
      CREATE POLICY IF NOT EXISTS "Разрешить удаление файлов всем"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'complaint_files');
      `
    ];

    // Применяем каждую политику
    for (const policy of policies) {
      const { error } = await supabase.rpc('apply_storage_policy', { policy_sql: policy });
      if (error && !error.message.includes('already exists')) {
        console.error('Error creating storage policy:', error);
      }
    }

    console.log('Storage policies created successfully');
  } catch (error) {
    console.error('Error creating storage policies:', error);
  }
}

// Применение миграции
export async function applyMigrations() {
  try {
    console.log('Applying database migrations...');
    
    const response = await fetch('/src/lib/migrations/001_initial_schema.sql');
    const sqlContent = await response.text();
    
    const { error } = await supabase.rpc('apply_migration', {
      sql_content: sqlContent
    });

    if (error) {
      if (error.message.includes('apply_migration')) {
        console.error('Error: Function apply_migration does not exist. Please create it in the Supabase dashboard.');
        console.log('SQL to create the function:');
        console.log(`
          CREATE OR REPLACE FUNCTION apply_migration(sql_content TEXT)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql_content;
          END;
          $$;
        `);
      } else {
        console.error('Error applying migrations:', error);
      }
    } else {
      console.log('Migrations applied successfully');
    }
  } catch (error) {
    console.error('Error in migration process:', error);
    throw error;
  }
}

// Инициализируем хранилище
initStorage().then(() => {
  console.log('Storage initialization completed');
}).catch(error => {
  console.error('Storage initialization failed:', error);
}); 
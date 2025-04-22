import { createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';

interface ChangeRequest {
  id: string;
  content_id: string;
  old_value: string;
  new_value: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

interface ContentContextType {
  getContent: (componentName: string, key: string) => Promise<string>;
  requestContentChange: (componentName: string, key: string, newValue: string, comment?: string) => Promise<void>;
  getPendingChanges: () => Promise<ChangeRequest[]>;
  approveChange: (changeId: string) => Promise<void>;
  rejectChange: (changeId: string, comment: string) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const getContent = async (componentName: string, key: string): Promise<string> => {
    const { data, error } = await supabase
      .from('content_management')
      .select('content_value')
      .eq('component_name', componentName)
      .eq('content_key', key)
      .single();

    if (error) {
      console.error('Error fetching content:', error);
      return '';
    }

    return data?.content_value || '';
  };

  const requestContentChange = async (
    componentName: string,
    key: string,
    newValue: string,
    comment?: string
  ) => {
    try {
      // Получаем текущий контент
      const { data: contentData } = await supabase
        .from('content_management')
        .select('*')
        .eq('component_name', componentName)
        .eq('content_key', key)
        .single();

      if (!contentData) {
        throw new Error('Content not found');
      }

      // Создаем запрос на изменение
      const { error } = await supabase.from('change_requests').insert({
        content_id: contentData.id,
        old_value: contentData.content_value,
        new_value: newValue,
        requested_by: 'current_user', // TODO: Заменить на реального пользователя
        comment
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error requesting content change:', error);
      throw error;
    }
  };

  const getPendingChanges = async (): Promise<ChangeRequest[]> => {
    const { data, error } = await supabase
      .from('change_requests')
      .select('*, content_management(*)')
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching pending changes:', error);
      return [];
    }

    return data || [];
  };

  const approveChange = async (changeId: string) => {
    try {
      const { data: changeData } = await supabase
        .from('change_requests')
        .select('*, content_management(*)')
        .eq('id', changeId)
        .single();

      if (!changeData) {
        throw new Error('Change request not found');
      }

      // Обновляем контент
      const { error: contentError } = await supabase
        .from('content_management')
        .update({
          content_value: changeData.new_value,
          is_approved: true,
          approved_by: 'current_user', // TODO: Заменить на реального пользователя
          updated_at: new Date().toISOString()
        })
        .eq('id', changeData.content_id);

      if (contentError) {
        throw contentError;
      }

      // Обновляем статус запроса
      const { error: requestError } = await supabase
        .from('change_requests')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', changeId);

      if (requestError) {
        throw requestError;
      }
    } catch (error) {
      console.error('Error approving change:', error);
      throw error;
    }
  };

  const rejectChange = async (changeId: string, comment: string) => {
    try {
      const { error } = await supabase
        .from('change_requests')
        .update({
          status: 'rejected',
          comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', changeId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error rejecting change:', error);
      throw error;
    }
  };

  const value = {
    getContent,
    requestContentChange,
    getPendingChanges,
    approveChange,
    rejectChange
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
} 
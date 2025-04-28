import React, { createContext, useContext, useState, useEffect } from 'react';
import { Complaint, ComplaintCategory, FileAttachment, ComplaintResponse, ComplaintStatus } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { sendTelegramNotification } from '@/lib/telegram';

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<void>;
  updateComplaint: (id: string, updates: Partial<Complaint>) => Promise<void>;
  getComplaintById: (id: string) => Promise<Complaint | null>;
  getComplaintsByLocation: (locationId: string) => Promise<Complaint[]>;
  getComplaintsByCategory: (category: ComplaintCategory) => Complaint[];
  respondToComplaint: (complaintId: string, response: Omit<ComplaintResponse, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteResponse: (complaintId: string) => Promise<void>;
  deleteComplaint: (complaintId: string) => Promise<void>;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const useComplaintContext = () => {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error('useComplaintContext must be used within a ComplaintProvider');
  }
  return context;
};

// This would normally connect to an API or database
export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    getComplaints();
  }, []);

  const getComplaints = async () => {
    try {
      console.log('Fetching complaints from Supabase...');
      
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.warn('No complaints data received');
        setComplaints([]);
        return;
      }

      // Преобразуем данные
      const formattedData = data.map(complaint => ({
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        status: (complaint.status as ComplaintStatus) || 'new',
        location: complaint.location || 'ТЦ "ЦСКА"',
        locationId: complaint.location_id || 'cska_default',
        locationName: complaint.locationname || complaint.location || 'ТЦ "ЦСКА"',
        created_at: complaint.created_at,
        updated_at: complaint.updated_at,
        submittedAt: complaint.submittedat || complaint.created_at,
        user_id: complaint.user_id || '',
        category: (complaint.category as ComplaintCategory) || 'other',
        response: complaint.response,
        priority_id: complaint.priority_id || null,
        assignee_id: complaint.assignee_id || null,
        attachments: Array.isArray(complaint.attachments) ? complaint.attachments : [],
        contact_email: complaint.contact_email || '',
        contact_phone: complaint.contact_phone || ''
      }));

      console.log('Formatted complaints data:', formattedData);
      setComplaints(formattedData);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Ошибка при загрузке жалоб');
      setComplaints([]);
    }
  };

  const addComplaint = async (complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      console.log('addComplaint вызван', complaint);
      // Строгая валидация обязательных полей
      if (!complaint.title?.trim() || !complaint.description?.trim()) {
        toast.error('Заполните все обязательные поля!');
        return;
      }
      // Подготавливаем данные для вставки
      const complaintData = {
        title: complaint.title.trim(),
        description: complaint.description.trim(),
        category: complaint.category || 'other',
        location: 'ТЦ "ЦСКА"',
        location_id: 'cska_default',
        locationname: 'ТЦ "ЦСКА"',
        user_id: 'test_user',
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        submittedat: new Date().toISOString(),
        attachments: [],
        contact_email: complaint.contact_email || null,
        contact_phone: complaint.contact_phone || null
      };
      console.log('Отправляем в Supabase:', complaintData);

      // Вставляем данные в Supabase
      const { data, error } = await supabase
        .from('complaints')
        .insert([complaintData])
        .select()
        .single();
      console.log('Результат insert в Supabase:', { data, error });

      if (error) {
        console.error('Supabase insert error:', error);
        toast.error(error.message || 'Ошибка при отправке жалобы');
        throw error;
      }
      if (!data) {
        throw new Error('No data returned after insert');
      }

      // Форматируем данные
      const formattedData: Complaint = {
        ...complaintData,
        id: data.id,
        status: data.status as ComplaintStatus,
        category: data.category as ComplaintCategory,
        created_at: data.created_at,
        updated_at: data.updated_at,
        submittedAt: data.submittedAt,
        response: data.response,
        priority_id: data.priority_id,
        assignee_id: data.assignee_id,
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        user_id: data.user_id
      };

      // Обновляем состояние
      setComplaints(prev => [formattedData, ...prev]);
      // Подробный лог перед отправкой в Telegram
      console.log('Отправляем в Telegram:', formattedData);
      const telegramResult = await sendTelegramNotification(formattedData, 'created');
      console.log('Результат отправки в Telegram:', telegramResult);
      if (!telegramResult) {
        console.warn('Failed to send Telegram notification');
      }
      toast.success('Ваше сообщение успешно отправлено! Мы рассмотрим его в ближайшее время.');
    } catch (error) {
      console.error('Error adding complaint:', error);
      toast.error('Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже.');
      throw error;
    }
  };

  const updateComplaint = async (id: string, updates: Partial<Complaint>) => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('No data returned after update');
      }

      const formattedData = {
        id: data.id,
        category: data.category as ComplaintCategory,
        description: data.description,
        location: data.location,
        status: data.status as ComplaintStatus,
        created_at: data.created_at,
        updated_at: data.updated_at,
        response: data.response ? {
          id: data.response.id,
          text: data.response.text,
          message: data.response.text,
          adminName: data.response.adminName,
          respondedAt: data.response.respondedAt || data.response.created_at,
          created_at: data.response.created_at,
          updated_at: data.response.updated_at
        } : undefined,
        priority_id: data.priority_id,
        assignee_id: data.assignee_id,
        attachments: Array.isArray(data.attachments) ? data.attachments : []
      };
      
      setComplaints(prev => prev.map(c => c.id === id ? formattedData : c));
      
      // Отправляем уведомление об обновлении статуса в Telegram только если действие выполнено администратором
      if (updates.status && localStorage.getItem('isAdmin') === 'true') {
        await sendTelegramNotification(formattedData, 'updated');
        toast.success(`Статус жалобы изменен на "${getStatusText(updates.status)}"`);
      } else {
        toast.success('Жалоба успешно обновлена');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast.error('Ошибка при обновлении жалобы');
    }
  };

  const getStatusText = (status: ComplaintStatus): string => {
    switch (status) {
      case 'new':
        return 'Новая';
      case 'processing':
        return 'В обработке';
      case 'resolved':
        return 'Решено';
      case 'rejected':
        return 'Отклонено';
      default:
        return status;
    }
  };

  const respondToComplaint = async (complaintId: string, response: Omit<ComplaintResponse, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const now = new Date().toISOString();
      const responseData = {
        id: crypto.randomUUID(),
        text: response.text,
        message: response.text,
        adminName: response.adminName,
        respondedAt: now,
        created_at: now,
        updated_at: now
      } satisfies ComplaintResponse;

      const { data, error } = await supabase
        .from('complaints')
        .update({
          response: responseData,
          status: 'resolved' as const,
          updated_at: now,
        })
        .eq('id', complaintId)
        .select()
        .single();

      if (error) {
        console.error('Error responding to complaint:', error);
        toast.error('Ошибка при ответе на жалобу');
        throw error;
      }
      
      if (!data) {
        const noDataError = new Error('No data returned after update');
        console.error(noDataError);
        toast.error('Ошибка при обновлении данных');
        throw noDataError;
      }

      const formattedData: Complaint = {
        id: data.id,
        category: data.category as ComplaintCategory,
        description: data.description,
        location: data.location,
        locationId: data.location_id,
        locationName: data.locationname || data.location,
        status: data.status as ComplaintStatus,
        created_at: data.created_at,
        updated_at: data.updated_at,
        response: responseData,
        priority_id: data.priority_id,
        assignee_id: data.assignee_id,
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        user_id: data.user_id || ''
      };

      setComplaints(prev => prev.map(c => c.id === complaintId ? formattedData : c));

      // Отправляем уведомление в Telegram только если действие выполнено администратором
      if (localStorage.getItem('isAdmin') === 'true') {
        await sendTelegramNotification(formattedData, 'updated');
        toast.success('Ответ успешно отправлен');
      }
    } catch (error) {
      console.error('Error responding to complaint:', error);
      toast.error('Ошибка при отправке ответа');
    }
  };

  const getComplaintById = async (id: string): Promise<Complaint | null> => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) {
        return null;
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        status: (data.status as ComplaintStatus) || 'new',
        location: data.location || 'ТЦ "ЦСКА"',
        locationId: data.location_id || 'cska_default',
        locationName: data.locationname || data.location || 'ТЦ "ЦСКА"',
        created_at: data.created_at,
        updated_at: data.updated_at,
        submittedAt: data.submittedat || data.created_at,
        user_id: data.user_id || '',
        category: (data.category as ComplaintCategory) || 'other',
        response: data.response ? {
          id: data.response.id,
          text: data.response.text,
          message: data.response.text,
          adminName: data.response.adminName,
          respondedAt: data.response.respondedAt || data.response.created_at,
          created_at: data.response.created_at,
          updated_at: data.response.updated_at
        } : undefined,
        priority_id: data.priority_id || null,
        assignee_id: data.assignee_id || null,
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || ''
      };
    } catch (error) {
      console.error('Error getting complaint by id:', error);
      toast.error('Ошибка при получении жалобы');
      return null;
    }
  };

  const getComplaintsByLocation = async (location: string): Promise<Complaint[]> => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('location', location)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data) {
        return [];
      }

      return data.map(complaint => ({
        id: complaint.id,
        category: complaint.category as ComplaintCategory,
        description: complaint.description,
        location: complaint.location,
        status: complaint.status as ComplaintStatus,
        created_at: complaint.created_at,
        updated_at: complaint.updated_at,
        response: complaint.response ? {
          id: complaint.response.id,
          text: complaint.response.text,
          message: complaint.response.text,
          adminName: complaint.response.adminName,
          respondedAt: complaint.response.respondedAt || complaint.response.created_at,
          created_at: complaint.response.created_at,
          updated_at: complaint.response.updated_at
        } : undefined,
        priority_id: complaint.priority_id,
        assignee_id: complaint.assignee_id,
        attachments: Array.isArray(complaint.attachments) ? complaint.attachments : []
      }));
    } catch (error) {
      console.error('Error getting complaints by location:', error);
      toast.error('Ошибка при получении жалоб по локации');
      return [];
    }
  };

  const getComplaintsByCategory = (category: ComplaintCategory) => {
    return complaints.filter(complaint => complaint.category === category);
  };

  const deleteResponse = async (complaintId: string) => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .update({
          response: null,
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', complaintId)
        .select()
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('No data returned after response deletion');
      }

      const formattedData = {
        id: data.id,
        category: data.category as ComplaintCategory,
        description: data.description,
        location: data.location,
        status: data.status as ComplaintStatus,
        created_at: data.created_at,
        updated_at: data.updated_at,
        response: data.response ? {
          id: data.response.id,
          text: data.response.text,
          message: data.response.text,
          adminName: data.response.adminName,
          respondedAt: data.response.respondedAt || data.response.created_at,
          created_at: data.response.created_at,
          updated_at: data.response.updated_at
        } : undefined,
        priority_id: data.priority_id,
        assignee_id: data.assignee_id,
        attachments: Array.isArray(data.attachments) ? data.attachments : []
      };
      
      setComplaints(prev => prev.map(c => c.id === complaintId ? formattedData : c));
      
      // Отправляем уведомление об удалении ответа в Telegram только если действие выполнено администратором
      if (localStorage.getItem('isAdmin') === 'true') {
        await sendTelegramNotification(formattedData, 'updated');
      }
      
      toast.success('Ответ успешно удален');
    } catch (error) {
      console.error('Error deleting response:', error);
      toast.error('Ошибка при удалении ответа');
    }
  };

  const deleteComplaint = async (complaintId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', complaintId);

      if (error) throw error;
      
      setComplaints(prev => prev.filter(c => c.id !== complaintId));
      
      // Отправляем уведомление об удалении жалобы в Telegram только если действие выполнено администратором
      if (localStorage.getItem('isAdmin') === 'true') {
        await sendTelegramNotification({
          id: complaintId,
          description: 'Жалоба была удалена администратором',
          location: '',
          category: 'other',
          status: 'rejected',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 'updated');
      }
      
      toast.success('Жалоба успешно удалена');
    } catch (error) {
      toast.error('Ошибка при удалении жалобы');
    }
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        addComplaint,
        updateComplaint,
        getComplaintById,
        getComplaintsByLocation,
        getComplaintsByCategory,
        respondToComplaint,
        deleteResponse,
        deleteComplaint,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

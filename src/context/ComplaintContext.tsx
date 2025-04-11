import React, { createContext, useContext, useState, useEffect } from 'react';
import { Complaint, ComplaintCategory, FileAttachment, ComplaintResponse, ComplaintStatus } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { sendTelegramNotification, sendStatusUpdateNotification } from '@/lib/telegram';

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<void>;
  updateComplaint: (id: string, updates: Partial<Complaint>) => Promise<void>;
  getComplaintById: (id: string) => Promise<Complaint | null>;
  getComplaintsByLocation: (locationId: string) => Promise<Complaint[]>;
  getComplaintsByCategory: (category: ComplaintCategory) => Complaint[];
  respondToComplaint: (complaintId: string, response: Omit<Complaint['response'], 'id' | 'created_at'>) => Promise<void>;
  deleteResponse: (complaintId: string) => Promise<void>;
  deleteComplaint: (complaintId: string) => Promise<void>;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

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

      // Преобразуем данные, если нужно
      const formattedData = data.map(complaint => {
        console.log('Processing complaint:', complaint);
        return {
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
            created_at: complaint.response.created_at
          } : undefined,
          priority_id: complaint.priority_id,
          assignee_id: complaint.assignee_id,
          attachments: Array.isArray(complaint.attachments) ? complaint.attachments : []
        };
      });

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
      const { data, error } = await supabase
        .from('complaints')
        .insert([{
          ...complaint,
          status: 'new',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('No data returned after insert');
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
          created_at: data.response.created_at
        } : undefined,
        priority_id: data.priority_id,
        assignee_id: data.assignee_id,
        attachments: Array.isArray(data.attachments) ? data.attachments : []
      };

      setComplaints(prev => [formattedData, ...prev]);
      
      // Отправляем уведомление в Telegram только если действие выполнено администратором
      if (localStorage.getItem('isAdmin') === 'true') {
        await sendTelegramNotification(formattedData);
      }
      
      toast.success('Жалоба успешно добавлена');
    } catch (error) {
      console.error('Error adding complaint:', error);
      toast.error('Ошибка при добавлении жалобы');
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
          created_at: data.response.created_at
        } : undefined,
        priority_id: data.priority_id,
        assignee_id: data.assignee_id,
        attachments: Array.isArray(data.attachments) ? data.attachments : []
      };
      
      setComplaints(prev => prev.map(c => c.id === id ? formattedData : c));
      
      // Отправляем уведомление об обновлении статуса в Telegram только если действие выполнено администратором
      if (updates.status && localStorage.getItem('isAdmin') === 'true') {
        await sendStatusUpdateNotification(formattedData);
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

  const respondToComplaint = async (complaintId: string, response: Omit<Complaint['response'], 'id' | 'created_at'>) => {
    try {
      const responseData = {
        ...response,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('complaints')
        .update({
          response: responseData,
          status: 'resolved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', complaintId)
        .select()
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('No data returned after response');
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
          created_at: data.response.created_at
        } : undefined,
        priority_id: data.priority_id,
        assignee_id: data.assignee_id,
        attachments: Array.isArray(data.attachments) ? data.attachments : []
      };
      
      setComplaints(prev => prev.map(c => c.id === complaintId ? formattedData : c));
      
      // Отправляем уведомление об ответе в Telegram только если действие выполнено администратором
      if (localStorage.getItem('isAdmin') === 'true') {
        await sendStatusUpdateNotification(formattedData);
      }
      
      toast.success('Ответ успешно добавлен');
    } catch (error) {
      console.error('Error responding to complaint:', error);
      toast.error('Ошибка при добавлении ответа');
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
        category: data.category as ComplaintCategory,
        description: data.description,
        location: data.location,
        status: data.status as ComplaintStatus,
        created_at: data.created_at,
        updated_at: data.updated_at,
        response: data.response ? {
          id: data.response.id,
          text: data.response.text,
          created_at: data.response.created_at
        } : undefined,
        priority_id: data.priority_id,
        assignee_id: data.assignee_id,
        attachments: Array.isArray(data.attachments) ? data.attachments : []
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
          created_at: complaint.response.created_at
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
          created_at: data.response.created_at
        } : undefined,
        priority_id: data.priority_id,
        assignee_id: data.assignee_id,
        attachments: Array.isArray(data.attachments) ? data.attachments : []
      };
      
      setComplaints(prev => prev.map(c => c.id === complaintId ? formattedData : c));
      
      // Отправляем уведомление об удалении ответа в Telegram только если действие выполнено администратором
      if (localStorage.getItem('isAdmin') === 'true') {
        await sendStatusUpdateNotification(formattedData);
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
        });
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

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};

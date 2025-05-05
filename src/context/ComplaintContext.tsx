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
  getComplaints: () => Promise<void>;
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

      console.log('Raw Supabase response:', data);

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
      const formattedData = await Promise.all(data.map(async (complaint) => {
        console.log('Processing complaint attachments:', complaint.attachments);
        
        const processedAttachments = Array.isArray(complaint.attachments) 
          ? await Promise.all(complaint.attachments.map(async (attachment) => {
              console.log('Processing attachment:', attachment);
              
              // Если attachment уже является объектом с url, возвращаем его
              if (typeof attachment === 'object' && attachment.url) {
                return attachment;
              }
              
              // Иначе получаем публичный URL для файла из хранилища Supabase
              const fileName = typeof attachment === 'string' ? attachment : attachment.name;
              const { data } = supabase.storage
                .from('complaint_files')
                .getPublicUrl(fileName);
              
              const url = data?.publicUrl;
              console.log('Generated public URL:', url);
              
              if (!url) {
                console.error('Failed to generate public URL for attachment:', fileName);
                return null;
              }
              
              return {
                id: Math.random().toString(36).substring(2, 9),
                url: url,
                name: fileName,
                type: fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'file',
                size: 0
              };
            }))
          : [];

        // Фильтруем неудачные загрузки
        const validAttachments = processedAttachments.filter((attachment): attachment is FileAttachment => attachment !== null);
        console.log('Processed attachments:', validAttachments);

        return {
          id: complaint.id,
          title: complaint.title || '',
          description: complaint.description,
          category: (complaint.category as ComplaintCategory) || 'other',
          location: complaint.location || 'ТЦ "ЦСКА"',
          location_id: complaint.location_id || '',
          locationname: complaint.locationname || complaint.location || 'ТЦ "ЦСКА"',
          user_id: complaint.user_id || '',
          status: (complaint.status as ComplaintStatus) || 'new',
          created_at: complaint.created_at,
          updated_at: complaint.updated_at,
          submittedat: complaint.submittedat || complaint.created_at,
          contact_email: complaint.contact_email || '',
          contact_phone: complaint.contact_phone || '',
          response: complaint.response ? {
            id: complaint.response.id,
            text: complaint.response.text,
            message: complaint.response.text,
            adminName: complaint.response.adminName,
            respondedAt: complaint.response.respondedAt || complaint.response.created_at,
            created_at: complaint.response.created_at,
            updated_at: complaint.response.updated_at
          } : undefined,
          attachments: validAttachments,
          priority_id: complaint.priority_id || null,
        };
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
      console.log('addComplaint вызван с данными:', complaint);
      
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
        location: complaint.location || 'ТЦ "ЦСКА"',
        location_id: complaint.location_id || '',
        locationname: complaint.locationname || 'ТЦ "ЦСКА"',
        user_id: complaint.user_id || 'anonymous',
        status: 'new' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        submittedat: new Date().toISOString(),
        contact_email: complaint.contact_email || undefined,
        contact_phone: complaint.contact_phone || undefined,
        rating: complaint.rating,
        attachments: complaint.attachments || []
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
        submittedat: data.submittedat,
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        contact_email: data.contact_email || undefined,
        contact_phone: data.contact_phone || undefined,
        rating: data.rating
      };

      console.log('Форматированные данные:', formattedData);

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
      // Получаем старое обращение для сравнения
      const { data: oldData, error: oldError } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', id)
        .single();
      if (oldError) throw oldError;

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
      if (!data) throw new Error('No data returned after update');

      // Проверяем изменения и пишем в change_history
      const fieldsToTrack: (keyof Complaint)[] = ['status', 'location_id', 'assignee_id'];
      for (const field of fieldsToTrack) {
        if (
          (updates as Partial<Complaint>)[field] !== undefined &&
          (oldData as Complaint)[field] !== (updates as Partial<Complaint>)[field]
        ) {
          const { error: chError } = await supabase.from('change_history').insert({
            complaint_id: id,
            field_name: field,
            old_value: (oldData as Complaint)[field] ? String((oldData as Complaint)[field]) : '',
            new_value: (updates as Partial<Complaint>)[field] ? String((updates as Partial<Complaint>)[field]) : '',
            changed_by: null, // Можно подставить user_id, если есть авторизация
            changed_at: new Date().toISOString(),
          });
          if (chError) {
            console.error('Ошибка при вставке в change_history:', chError);
          } else {
            console.log('Успешно добавлено в change_history:', field, id);
          }
        }
      }

      const formattedData = {
        id: data.id,
        title: data.title || '',
        description: data.description,
        category: data.category as ComplaintCategory,
        location: data.location,
        location_id: data.location_id || '',
        locationname: data.locationname || data.location || '',
        user_id: data.user_id || '',
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
      toast.success('Жалоба успешно обновлена');
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

      // Сохраняем ответ в отдельной таблице responses
      const { error: respError } = await supabase
        .from('responses')
        .insert({
          complaint_id: complaintId,
          user_id: 'admin', // или получить реального админа
          message: response.text,
          respondedat: now,
          created_at: now,
          updated_at: now
        });
      if (respError) {
        console.error('Ошибка при сохранении ответа в responses:', respError);
        toast.error('Ошибка при сохранении ответа в истории');
      }

      // Сохраняем ответ в complaints (старое поведение)
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
        title: data.title || '',
        description: data.description,
        category: data.category as ComplaintCategory,
        location: data.location,
        location_id: data.location_id || '',
        locationname: data.locationname || data.location || '',
        user_id: data.user_id || '',
        status: data.status as ComplaintStatus,
        created_at: data.created_at,
        updated_at: data.updated_at,
        response: responseData,
        priority_id: data.priority_id,
        assignee_id: data.assignee_id,
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        submittedat: data.submittedat || data.created_at
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

      console.log('Raw complaint data:', data);
      console.log('Attachments data:', data.attachments);

      return {
        id: data.id,
        title: data.title || '',
        description: data.description,
        status: (data.status as ComplaintStatus) || 'new',
        location: data.location || 'ТЦ "ЦСКА"',
        location_id: data.location_id || '',
        locationname: data.locationname || data.location || 'ТЦ "ЦСКА"',
        created_at: data.created_at,
        updated_at: data.updated_at,
        submittedat: data.submittedat || data.created_at,
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
        attachments: Array.isArray(data.attachments) ? data.attachments.map(attachment => {
          if (typeof attachment === 'string') {
            return {
              id: Math.random().toString(36).substring(2, 9),
              type: 'image',
              url: attachment,
              name: `Вложение ${Math.random().toString(36).substring(2, 9)}`
            };
          }
          return attachment;
        }) : [],
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
        title: complaint.title || '',
        category: complaint.category as ComplaintCategory,
        description: complaint.description,
        location: complaint.location,
        location_id: complaint.location_id || '',
        locationname: complaint.locationname || complaint.location || '',
        user_id: complaint.user_id || '',
        status: complaint.status as ComplaintStatus,
        created_at: complaint.created_at,
        updated_at: complaint.updated_at,
        submittedat: complaint.submittedat || complaint.created_at,
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
        title: data.title || '',
        description: data.description,
        category: data.category as ComplaintCategory,
        location: data.location,
        location_id: data.location_id || '',
        locationname: data.locationname || data.location || '',
        user_id: data.user_id || '',
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
      // Получаем данные обращения перед удалением
      const { data: complaint, error: fetchError } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', complaintId)
        .single();

      if (fetchError) throw fetchError;

      // Удаляем файлы из storage
      if (complaint?.attachments && Array.isArray(complaint.attachments)) {
        for (const attachment of complaint.attachments) {
          let fileName;
          if (typeof attachment === 'string') {
            const urlParts = attachment.split('/');
            fileName = decodeURIComponent(urlParts[urlParts.length - 1]);
          } else if (typeof attachment === 'object' && attachment.url) {
            const urlParts = attachment.url.split('/');
            fileName = decodeURIComponent(urlParts[urlParts.length - 1]);
          } else if (typeof attachment === 'object' && attachment.name) {
            fileName = attachment.name;
          }
          if (fileName) {
            try {
              const { error: deleteError } = await supabase.storage
                .from('complaint_files')
                .remove([fileName]);
              if (deleteError) {
                console.error('Ошибка при удалении файла:', fileName, deleteError);
              }
            } catch (storageError) {
              console.error('Ошибка при работе с storage:', storageError);
            }
          }
        }
      }

      // Удаляем само обращение из Supabase
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', complaintId);

      if (error) {
        console.error('Ошибка при удалении жалобы:', error);
        toast.error('Ошибка при удалении жалобы: ' + error.message);
        return;
      }

      // Только если удаление прошло успешно — обновляем состояние
      setComplaints(prev => prev.filter(c => c.id !== complaintId));

      // Отправляем уведомление об удалении жалобы в Telegram только если действие выполнено администратором
      if (localStorage.getItem('isAdmin') === 'true') {
        await sendTelegramNotification({
          id: complaintId,
          title: 'Удаленная жалоба',
          description: 'Жалоба была удалена администратором',
          location: '',
          location_id: '',
          locationname: '',
          user_id: '',
          category: 'other',
          status: 'rejected',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          attachments: []
        }, 'updated');
      }

      toast.success('Жалоба успешно удалена');
    } catch (error) {
      console.error('Ошибка при удалении жалобы:', error);
      toast.error('Ошибка при удалении жалобы: ' + (error?.message || error));
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
        getComplaints,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Complaint } from '../../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';

interface ChangeHistory {
  id: string;
  complaint_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  changed_at: string;
}

export const ChangeHistory = () => {
  const [history, setHistory] = useState<ChangeHistory[]>([]);
  const [complaints, setComplaints] = useState<Record<string, Complaint>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [historyData, complaintsData] = await Promise.all([
        supabase.from('change_history').select('*').order('changed_at', { ascending: false }),
        supabase.from('complaints').select('*')
      ]);

      if (historyData.error) throw historyData.error;
      if (complaintsData.error) throw complaintsData.error;

      setHistory(historyData.data || []);
      const complaintsMap = (complaintsData.data || []).reduce((acc, complaint) => {
        acc[complaint.id] = complaint;
        return acc;
      }, {} as Record<string, Complaint>);
      setComplaints(complaintsMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFieldDisplayName = (field: string) => {
    const fieldNames: Record<string, string> = {
      status: 'Статус',
      priority_id: 'Приоритет',
      assignee_id: 'Исполнитель',
      location_id: 'Локация',
      response: 'Ответ',
    };
    return fieldNames[field] || field;
  };

  const formatValue = (field: string, value: string) => {
    if (field === 'status') {
      const statusColors: Record<string, string> = {
        new: 'bg-blue-500',
        processing: 'bg-yellow-500',
        resolved: 'bg-green-500',
        rejected: 'bg-red-500',
        in_progress: 'bg-yellow-400',
        closed: 'bg-gray-500',
      };
      return (
        <Badge className={statusColors[value] || ''}>
          {value}
        </Badge>
      );
    }
    if (field === 'location_id') {
      if (value === 'cska_default') return 'ТЦ "ЦСКА"';
      if (value === 'ace_default') return 'ТЦ "ЭЙС"';
      if (value === 'adk_default') return 'ТЦ "АДК"';
      return value;
    }
    if (field === 'assignee_id') {
      // Можно добавить отображение имени исполнителя, если есть данные
      return value;
    }
    return value;
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">История изменений</h1>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Время</TableHead>
            <TableHead>Обращение</TableHead>
            <TableHead>Поле</TableHead>
            <TableHead>Старое значение</TableHead>
            <TableHead>Новое значение</TableHead>
            <TableHead>Изменено</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((change) => (
            <TableRow key={change.id}>
              <TableCell>
                {new Date(change.changed_at).toLocaleString()}
              </TableCell>
              <TableCell>
                {complaints[change.complaint_id]?.description || 'Неизвестно'}
              </TableCell>
              <TableCell>
                {getFieldDisplayName(change.field_name)}
              </TableCell>
              <TableCell>
                {formatValue(change.field_name, change.old_value)}
              </TableCell>
              <TableCell>
                {formatValue(change.field_name, change.new_value)}
              </TableCell>
              <TableCell>
                {change.changed_by}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 
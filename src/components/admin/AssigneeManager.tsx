import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Complaint } from '../../types';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface Assignee {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
}

export const AssigneeManager = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Словари для перевода
  const categoryRu: Record<string, string> = {
    facilities: 'Объекты и инфраструктура',
    staff: 'Персонал',
    equipment: 'Оборудование',
    cleanliness: 'Чистота',
    services: 'Услуги',
    safety: 'Безопасность',
    other: 'Другое',
  };

  const statusRu: Record<string, string> = {
    new: 'Новая',
    processing: 'В обработке',
    resolved: 'Решено',
    rejected: 'Отклонено',
    in_progress: 'В процессе',
    closed: 'Закрыта',
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [complaintsData, assigneesData, locationsData] = await Promise.all([
        supabase.from('complaints').select('*').order('created_at', { ascending: false }),
        supabase.from('assignees').select('*').order('name'),
        supabase.from('locations').select('*').order('name')
      ]);

      if (complaintsData.error) throw complaintsData.error;
      if (assigneesData.error) throw assigneesData.error;
      if (locationsData.error) throw locationsData.error;

      setComplaints(complaintsData.data || []);
      setAssignees(assigneesData.data || []);
      setLocations(locationsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssigneeChange = async (complaintId: string, assigneeId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ assignee_id: assigneeId })
        .eq('id', complaintId);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error updating assignee:', error);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Управление назначением</h1>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Тема обращения</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Локация</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow key={complaint.id}>
              <TableCell>{complaint.title || 'Без темы'}</TableCell>
              <TableCell>{categoryRu[complaint.category] || complaint.category}</TableCell>
              <TableCell>{statusRu[complaint.status] || complaint.status}</TableCell>
              <TableCell>
                <Select
                  value={complaint.location_id || ''}
                  onValueChange={(value) => handleAssigneeChange(complaint.id, value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Выберите локацию" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAssigneeChange(complaint.id, '')}
                >
                  Сбросить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Priority {
  id: string;
  name: string;
  color: string;
  description: string;
}

const priorityLevels = [
  {
    level: 'Высокий',
    description: 'Срочные обращения, требующие немедленного реагирования. Например, проблемы безопасности или серьезные неисправности оборудования.',
    color: 'text-red-500'
  },
  {
    level: 'Средний',
    description: 'Важные обращения, которые нужно решить в ближайшее время, но не требующие немедленной реакции.',
    color: 'text-yellow-500'
  },
  {
    level: 'Низкий',
    description: 'Обычные обращения, которые можно обработать в порядке общей очереди.',
    color: 'text-green-500'
  }
];

export const PriorityManager = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);

  // Добавляем словари для перевода
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
      const [complaintsData, prioritiesData] = await Promise.all([
        supabase.from('complaints').select('*').order('created_at', { ascending: false }),
        supabase.from('priorities').select('*').order('name')
      ]);

      if (complaintsData.error) throw complaintsData.error;
      if (prioritiesData.error) throw prioritiesData.error;

      setComplaints(complaintsData.data || []);
      setPriorities(prioritiesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (complaintId: string, priorityId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ priority_id: priorityId })
        .eq('id', complaintId);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Управление приоритетами</h2>
      <p className="text-gray-600 text-sm mb-6">
        Система приоритетов помогает эффективно распределять ресурсы и время на обработку обращений.
        Правильная расстановка приоритетов обеспечивает своевременное реагирование на важные проблемы.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        {priorityLevels.map((priority) => (
          <Card key={priority.level} className="bg-white shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className={`${priority.color} text-lg`}>{priority.level}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-gray-600 text-sm">{priority.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Рекомендации по установке приоритетов:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>Оценивайте срочность и важность каждого обращения</li>
          <li>Учитывайте потенциальное влияние проблемы на работу объекта</li>
          <li>Принимайте во внимание количество затронутых посетителей</li>
          <li>Регулярно пересматривайте приоритеты в зависимости от текущей ситуации</li>
        </ul>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>№ / Тема обращения</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Приоритет</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint, idx) => (
            <TableRow key={complaint.id}>
              <TableCell>{`${idx + 1}. ${complaint.title || 'Без темы'}`}</TableCell>
              <TableCell>{categoryRu[complaint.category] || complaint.category}</TableCell>
              <TableCell>{statusRu[complaint.status] || complaint.status}</TableCell>
              <TableCell>
                <Select
                  value={complaint.priority_id || ''}
                  onValueChange={(value) => handlePriorityChange(complaint.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.id} value={priority.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: priority.color }}
                          />
                          {priority.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePriorityChange(complaint.id, '')}
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
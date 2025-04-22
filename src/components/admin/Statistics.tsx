import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Statistics as StatisticsType } from '@/types';
import { Complaint, ComplaintCategory, ComplaintStatus } from '@/types';

const categoryTranslations: Record<ComplaintCategory, string> = {
  facilities: 'Объекты и инфраструктура',
  staff: 'Персонал',
  equipment: 'Оборудование',
  cleanliness: 'Чистота',
  services: 'Услуги',
  safety: 'Безопасность',
  other: 'Другое'
};

const statusTranslations: Record<ComplaintStatus, string> = {
  new: 'Новые',
  processing: 'В обработке',
  resolved: 'Решенные',
  rejected: 'Отклоненные',
  in_progress: 'В процессе',
  closed: 'Закрытые'
};

export const Statistics = () => {
  const [statistics, setStatistics] = useState<StatisticsType | null>(null);
  const [dateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const { data: complaints } = await supabase
          .from('complaints')
          .select('*')
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());

        if (complaints) {
          const categoryStats: Record<ComplaintCategory, number> = {
            facilities: 0,
            staff: 0,
            equipment: 0,
            cleanliness: 0,
            services: 0,
            safety: 0,
            other: 0
          };

          const statusStats: Record<ComplaintStatus, number> = {
            new: 0,
            processing: 0,
            resolved: 0,
            rejected: 0,
            in_progress: 0,
            closed: 0
          };

          complaints.forEach((complaint: Complaint) => {
            categoryStats[complaint.category]++;
            statusStats[complaint.status]++;
          });

          setStatistics({
            totalComplaints: complaints.length,
            categoryStats,
            statusStats
          });
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, [dateRange]);

  if (!statistics) {
    return <div>Загрузка статистики...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Всего обращений</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalComplaints}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>По категориям</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Object.entries(statistics.categoryStats).map(([category, count]) => (
              <li key={category} className="flex justify-between">
                <span>{categoryTranslations[category as ComplaintCategory]}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>По статусам</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Object.entries(statistics.statusStats).map(([status, count]) => (
              <li key={status} className="flex justify-between">
                <span>{statusTranslations[status as ComplaintStatus]}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 
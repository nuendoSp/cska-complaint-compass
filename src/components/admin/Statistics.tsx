import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Complaint, ComplaintStatus, ComplaintCategory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

interface Statistics {
  totalComplaints: number;
  complaintsByStatus: Record<ComplaintStatus, number>;
  complaintsByCategory: Record<ComplaintCategory, number>;
  complaintsByDay: Array<{ date: string; count: number }>;
  averageResponseTime: number;
}

const statusLabels: Record<ComplaintStatus, string> = {
  'new': 'Новые',
  'in_progress': 'В обработке',
  'resolved': 'Решенные',
  'closed': 'Закрытые'
};

const categoryLabels: Record<ComplaintCategory, string> = {
  'service_quality': 'Качество обслуживания',
  'facility_issues': 'Проблемы с объектами',
  'staff_behavior': 'Поведение персонала',
  'equipment_problems': 'Проблемы с оборудованием',
  'safety_concerns': 'Вопросы безопасности',
  'stadium': 'Стадион',
  'other': 'Другое'
};

export const Statistics = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      let query = supabase
        .from('complaints')
        .select('*');

      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
      }

      const { data: complaints, error } = await query;

      if (error) throw error;

      if (!complaints) return;

      const stats: Statistics = {
        totalComplaints: complaints.length,
        complaintsByStatus: {
          'new': 0,
          'in_progress': 0,
          'resolved': 0,
          'closed': 0
        },
        complaintsByCategory: {
          'service_quality': 0,
          'facility_issues': 0,
          'staff_behavior': 0,
          'equipment_problems': 0,
          'safety_concerns': 0,
          'stadium': 0,
          'other': 0
        },
        complaintsByDay: [],
        averageResponseTime: 0
      };

      complaints.forEach(complaint => {
        stats.complaintsByStatus[complaint.status as ComplaintStatus]++;
        stats.complaintsByCategory[complaint.category as ComplaintCategory]++;
      });

      const dayCounts = complaints.reduce((acc, complaint) => {
        const date = new Date(complaint.created_at).toLocaleDateString('ru-RU');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      stats.complaintsByDay = Object.entries(dayCounts).map(([date, count]) => ({
        date,
        count: Number(count)
      }));

      const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
      if (resolvedComplaints.length > 0) {
        const totalResponseTime = resolvedComplaints.reduce((acc, complaint) => {
          const created = new Date(complaint.created_at).getTime();
          const resolved = new Date(complaint.updated_at).getTime();
          return acc + (resolved - created);
        }, 0);
        stats.averageResponseTime = Math.round(totalResponseTime / resolvedComplaints.length / (1000 * 60 * 60));
      }

      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка статистики...</div>;
  }

  if (!statistics) {
    return <div>Ошибка загрузки статистики</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          align="end"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Всего жалоб</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalComplaints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Среднее время ответа</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageResponseTime} ч</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>В обработке</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.complaintsByStatus.in_progress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Решено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.complaintsByStatus.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Жалобы по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(statistics.complaintsByStatus).map(([status, count]) => ({
                status: statusLabels[status as ComplaintStatus],
                count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Жалобы по категориям</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(statistics.complaintsByCategory).map(([category, count]) => ({
                category: categoryLabels[category as ComplaintCategory],
                count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Жалобы по дням</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.complaintsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 
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

      // Применяем фильтр по дате, если он задан
      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
      }

      const { data: complaints, error } = await query;

      if (error) throw error;

      if (!complaints) return;

      // Рассчитываем статистику
      const stats: Statistics = {
        totalComplaints: complaints.length,
        complaintsByStatus: {
          new: 0,
          processing: 0,
          resolved: 0,
          rejected: 0
        },
        complaintsByCategory: {
          stadium: 0,
          team: 0,
          tickets: 0,
          merchandise: 0,
          other: 0
        },
        complaintsByDay: [],
        averageResponseTime: 0
      };

      // Подсчет по статусам и категориям
      complaints.forEach(complaint => {
        stats.complaintsByStatus[complaint.status]++;
        stats.complaintsByCategory[complaint.category]++;
      });

      // Подсчет по дням
      const dayCounts = complaints.reduce((acc, complaint) => {
        const date = new Date(complaint.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      stats.complaintsByDay = Object.entries(dayCounts).map(([date, count]) => ({
        date,
        count: Number(count)
      }));

      // Расчет среднего времени ответа
      const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
      if (resolvedComplaints.length > 0) {
        const totalResponseTime = resolvedComplaints.reduce((acc, complaint) => {
          const created = new Date(complaint.created_at).getTime();
          const resolved = new Date(complaint.updated_at).getTime();
          return acc + (resolved - created);
        }, 0);
        stats.averageResponseTime = Math.round(totalResponseTime / resolvedComplaints.length / (1000 * 60 * 60)); // в часах
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
            <CardTitle>Жалоб в обработке</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.complaintsByStatus.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Решенных жалоб</CardTitle>
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
                status,
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
                category,
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
      </div>

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
  );
}; 
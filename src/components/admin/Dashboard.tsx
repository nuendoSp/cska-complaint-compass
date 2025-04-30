import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Tooltip as RechartsTooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const statusRu: Record<string, string> = {
  new: 'Новая',
  processing: 'В обработке',
  resolved: 'Решено',
  rejected: 'Отклонено',
  in_progress: 'В процессе',
  closed: 'Закрыта',
};
const categoryRu: Record<string, string> = {
  facilities: 'Объекты и инфраструктура',
  staff: 'Персонал',
  equipment: 'Оборудование',
  cleanliness: 'Чистота',
  services: 'Услуги',
  safety: 'Безопасность',
  other: 'Другое',
};

// Кастомный Tooltip для PieChart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const name = entry.name;
    const value = entry.value;
    const isStatus = statusRu.hasOwnProperty(name);
    const isCategory = categoryRu.hasOwnProperty(name);
    return (
      <div style={{ background: '#fff', border: '1px solid #ccc', padding: 8, borderRadius: 4 }}>
        <span>
          {(isStatus && statusRu[name]) || (isCategory && categoryRu[name]) || name}: {value}
        </span>
      </div>
    );
  }
  return null;
};

// Многострочный label для PieChart
const wrapLabel = (label: string, maxLen = 12) => {
  if (label.length <= maxLen) return label;
  const words = label.split(' ');
  let lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxLen) {
      lines.push(current.trim());
      current = word;
    } else {
      current += ' ' + word;
    }
  }
  if (current) lines.push(current.trim());
  return lines.join('\n');
};

// Кастомный label для PieChart по статусам (над диаграммой)
const CustomPieStatusLabel = (props: any) => {
  const { cx, cy, name, percent } = props;
  const label = statusRu[name] || name;
  return (
    <text x={cx} y={cy - 100} textAnchor="middle" dominantBaseline="central" fill="#1890ff" fontSize={16}>
      {label} {(percent * 100).toFixed(0)}%
    </text>
  );
};

// Кастомный label для PieChart (в центре сегмента, многострочный)
const CustomPieSegmentLabel = (props: any) => {
  const { x, y, name, percent } = props;
  const label = (statusRu[name] || categoryRu[name] || name) + ` ${(percent * 100).toFixed(0)}%`;
  // Разбиваем на две строки, если длинно
  const maxLen = 14;
  let first = label;
  let second = '';
  if (label.length > maxLen) {
    const idx = label.lastIndexOf(' ', maxLen);
    if (idx > 0) {
      first = label.slice(0, idx);
      second = label.slice(idx + 1);
    }
  }
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="#1890ff" fontSize={14}>
      <tspan x={x} dy="-0.6em">{first}</tspan>
      {second && <tspan x={x} dy="1.2em">{second}</tspan>}
    </text>
  );
};

// Универсальный кастомный label для PieChart
const CustomPieSmartLabel = (props: any) => {
  const { x, y, cx, cy, name, percent, viewBox, index } = props;
  const isSingle = (viewBox && viewBox.children && viewBox.children.length === 1) || (props.sectors && props.sectors.length === 1);
  const label = (statusRu[name] || categoryRu[name] || name) + (isSingle ? ` ${(percent * 100).toFixed(0)}%` : '');
  if (isSingle) {
    // Один сегмент — label над кругом
    return (
      <text x={cx} y={cy - 100} textAnchor="middle" dominantBaseline="central" fill="#1890ff" fontSize={18}>
        {label}
      </text>
    );
  } else {
    // Несколько сегментов — label внутри сегмента, коротко
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="#1890ff" fontSize={14}>
        {statusRu[name] || categoryRu[name] || name}
      </text>
    );
  }
};

// Универсальный компонент для синей подписи над PieChart
const BluePieLabel = ({ text }: { text: string }) => (
  <div style={{ textAlign: 'center', color: '#1890ff', fontSize: 20, fontWeight: 600, marginBottom: 12, letterSpacing: 0.2 }}>
    {text}
  </div>
);

// Функция для генерации подписи с процентами
function getPieLabelText(data: { name: string; value: number }[], total: number, dict: Record<string, string>) {
  if (!data.length) return '';
  return data.map(d => `${dict[d.name] || d.name} ${Math.round((d.value / total) * 100)}%`).join(', ');
}

export const Dashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchComplaints();
  }, [timeRange]);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusData = () => {
    const statusCount = complaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {} as Record<ComplaintStatus, number>);

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  const getCategoryData = () => {
    const categoryCount = complaints.reduce((acc, complaint) => {
      acc[complaint.category] = (acc[complaint.category] || 0) + 1;
      return acc;
    }, {} as Record<ComplaintCategory, number>);

    return Object.entries(categoryCount).map(([category, count]) => ({
      name: category,
      value: count
    }));
  };

  const getAverageResolutionTime = () => {
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
    if (resolvedComplaints.length === 0) return 0;

    const totalTime = resolvedComplaints.reduce((acc, complaint) => {
      const createdAt = new Date(complaint.created_at).getTime();
      const resolvedAt = new Date(complaint.updated_at).getTime();
      return acc + (resolvedAt - createdAt);
    }, 0);

    return Math.round(totalTime / resolvedComplaints.length / (1000 * 60 * 60)); // в часах
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  const statusData = getStatusData();
  const categoryData = getCategoryData();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Аналитика обращений</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего обращений</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaints.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среднее время решения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageResolutionTime()} ч</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Решено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complaints.filter(c => c.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В процессе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complaints.filter(c => c.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Распределение по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            <BluePieLabel text={getPieLabelText(statusData, statusData.reduce((a, b) => a + b.value, 0), statusRu)} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={undefined}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Распределение по категориям</CardTitle>
          </CardHeader>
          <CardContent>
            <BluePieLabel text={getPieLabelText(categoryData, categoryData.reduce((a, b) => a + b.value, 0), categoryRu)} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={undefined}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 
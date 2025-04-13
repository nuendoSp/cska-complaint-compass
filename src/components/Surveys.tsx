import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'closed';
  questions: any[];
  created_at: string;
  updated_at: string;
}

export function Surveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSurveys() {
      try {
        const { data, error } = await supabase
          .from('surveys')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setSurveys(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка при загрузке опросов');
      } finally {
        setLoading(false);
      }
    }

    fetchSurveys();
  }, []);

  const getStatusColor = (status: Survey['status']) => {
    switch (status) {
      case 'draft':
        return 'text-yellow-600';
      case 'active':
        return 'text-green-600';
      case 'closed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: Survey['status']) => {
    switch (status) {
      case 'draft':
        return 'Черновик';
      case 'active':
        return 'Активный';
      case 'closed':
        return 'Закрыт';
      default:
        return status;
    }
  };

  if (loading) {
    return <div>Загрузка опросов...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Опросы</h2>
        <Button onClick={() => navigate('/admin/surveys/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Создать опрос
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <Card
            key={survey.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/admin/surveys/${survey.id}`)}
          >
            <CardHeader>
              <CardTitle>{survey.title}</CardTitle>
              <CardDescription>
                Создан: {new Date(survey.created_at).toLocaleString('ru-RU')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{survey.description}</p>
              <p className={`text-sm font-medium ${getStatusColor(survey.status)}`}>
                Статус: {getStatusText(survey.status)}
              </p>
              <p className="text-sm text-gray-600">
                Вопросов: {survey.questions.length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {surveys.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          Нет доступных опросов
        </div>
      )}
    </div>
  );
} 
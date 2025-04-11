import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Plus, Trash2, BarChart2 } from 'lucide-react';

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  created_at: string;
  is_active: boolean;
}

interface SurveyQuestion {
  id: string;
  text: string;
  type: 'text' | 'single' | 'multiple';
  options?: string[];
}

interface SurveyResponse {
  id: string;
  survey_id: string;
  answers: Record<string, string | string[]>;
  created_at: string;
}

export const Surveys = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<Record<string, SurveyResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [] as SurveyQuestion[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [surveysData, responsesData] = await Promise.all([
        supabase.from('surveys').select('*').order('created_at', { ascending: false }),
        supabase.from('survey_responses').select('*')
      ]);

      if (surveysData.error) throw surveysData.error;
      if (responsesData.error) throw responsesData.error;

      setSurveys(surveysData.data || []);
      const responsesMap = (responsesData.data || []).reduce((acc, response) => {
        if (!acc[response.survey_id]) {
          acc[response.survey_id] = [];
        }
        acc[response.survey_id].push(response);
        return acc;
      }, {} as Record<string, SurveyResponse[]>);
      setResponses(responsesMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSurvey) {
        const { error } = await supabase
          .from('surveys')
          .update(formData)
          .eq('id', editingSurvey.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('surveys')
          .insert([{ ...formData, is_active: true }]);

        if (error) throw error;
      }

      await fetchData();
      setIsDialogOpen(false);
      setFormData({ title: '', description: '', questions: [] });
      setEditingSurvey(null);
    } catch (error) {
      console.error('Error saving survey:', error);
    }
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { id: Date.now().toString(), text: '', type: 'text' }
      ]
    });
  };

  const handleRemoveQuestion = (questionId: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== questionId)
    });
  };

  const handleQuestionChange = (questionId: string, field: string, value: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    });
  };

  const handleEdit = (survey: Survey) => {
    setEditingSurvey(survey);
    setFormData({
      title: survey.title,
      description: survey.description,
      questions: survey.questions
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот опрос?')) return;

    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Опросы и анкетирование</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Создать опрос</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSurvey ? 'Редактировать опрос' : 'Новый опрос'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title">Название</label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description">Описание</label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Вопросы</h3>
                  <Button type="button" onClick={handleAddQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить вопрос
                  </Button>
                </div>
                {formData.questions.map((question) => (
                  <div key={question.id} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <Input
                        value={question.text}
                        onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                        placeholder="Текст вопроса"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <label>Тип вопроса</label>
                      <select
                        value={question.type}
                        onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="text">Текстовый ответ</option>
                        <option value="single">Один вариант</option>
                        <option value="multiple">Несколько вариантов</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="submit">Сохранить</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead>Вопросов</TableHead>
            <TableHead>Ответов</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow key={survey.id}>
              <TableCell>{survey.title}</TableCell>
              <TableCell className="max-w-xs truncate">{survey.description}</TableCell>
              <TableCell>{survey.questions.length}</TableCell>
              <TableCell>{responses[survey.id]?.length || 0}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  survey.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {survey.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(survey)}
                  >
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(survey.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  isActive: boolean;
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple' | 'single';
  options?: string[];
}

const SurveysManager: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [newSurvey, setNewSurvey] = useState<Partial<Survey>>({
    title: '',
    description: '',
    questions: [],
    isActive: true
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSurvey = () => {
    if (!newSurvey.title || !newSurvey.description) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const survey: Survey = {
      id: Date.now().toString(),
      title: newSurvey.title,
      description: newSurvey.description,
      questions: newSurvey.questions || [],
      createdAt: new Date().toISOString(),
      isActive: true
    };

    setSurveys([...surveys, survey]);
    setNewSurvey({
      title: '',
      description: '',
      questions: [],
      isActive: true
    });
    setIsCreating(false);
    toast.success('Опрос успешно создан');
  };

  const handleDeleteSurvey = (id: string) => {
    setSurveys(surveys.filter(survey => survey.id !== id));
    toast.success('Опрос успешно удален');
  };

  const handleToggleSurvey = (id: string) => {
    setSurveys(surveys.map(survey => 
      survey.id === id 
        ? { ...survey, isActive: !survey.isActive }
        : survey
    ));
    toast.success('Статус опроса обновлен');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление опросами</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Создать опрос
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Создание нового опроса</CardTitle>
            <CardDescription>Заполните информацию о новом опросе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название опроса</label>
              <Input
                value={newSurvey.title}
                onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                placeholder="Введите название опроса"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Описание</label>
              <Textarea
                value={newSurvey.description}
                onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                placeholder="Введите описание опроса"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateSurvey}>
                Создать
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <Card key={survey.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{survey.title}</CardTitle>
                  <CardDescription>{survey.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleSurvey(survey.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSurvey(survey.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Создан: {new Date(survey.createdAt).toLocaleDateString()}
                </span>
                <span className={`text-sm ${
                  survey.isActive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {survey.isActive ? 'Активен' : 'Неактивен'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SurveysManager; 
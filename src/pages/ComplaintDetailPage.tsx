import React from 'react';
import { useParams } from 'react-router-dom';
import { useComplaintContext } from '../context/ComplaintContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Complaint } from '@/types';

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

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getComplaintById } = useComplaintContext();
  const [complaint, setComplaint] = React.useState<Complaint | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchComplaint = async () => {
      if (id) {
        try {
          const result = await getComplaintById(id);
          console.log('Complaint by id:', result);
          if (result) {
            setComplaint(result);
          }
        } catch (error) {
          console.error('Error fetching complaint:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchComplaint();
  }, [id, getComplaintById]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!complaint) {
    return <div>Жалоба не найдена</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>{complaint.title || 'Без темы'}</CardTitle>
        <CardDescription>
          Обращение от {formatDate(new Date(complaint.submittedAt || complaint.created_at || Date.now()))}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Локация</h3>
            <p>ТЦ "ЦСКА"</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-gray-600">Телефон заявителя:</div>
            <div>{complaint.contact_phone || 'Не указан'}</div>
          </div>
          <div>
            <h3 className="font-semibold">Статус</h3>
            <Badge>{statusRu[complaint.status] || complaint.status}</Badge>
          </div>
          <div>
            <h3 className="font-semibold">Категория</h3>
            <Badge variant="outline">{categoryRu[complaint.category] || complaint.category}</Badge>
          </div>
          <div>
            <h3 className="font-semibold">Дата подачи</h3>
            <p>{formatDate(new Date(complaint.submittedAt || complaint.created_at || Date.now()))}</p>
          </div>
          <div>
            <h3 className="font-semibold">Описание</h3>
            <p className="whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {complaint.attachments && complaint.attachments.length > 0 && (
            <div>
              <h3 className="font-semibold">Вложения</h3>
              <div className="flex flex-wrap gap-2">
                {complaint.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {attachment.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {complaint.response && (
            <div className="mt-8 border-t pt-4">
              <h3 className="font-semibold">Ответ администратора</h3>
              <div className="mt-2">
                <p className="whitespace-pre-wrap">{complaint.response.text}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Ответил: {complaint.response.adminName}
                  <br />
                  Дата: {formatDate(new Date(complaint.response.respondedAt))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

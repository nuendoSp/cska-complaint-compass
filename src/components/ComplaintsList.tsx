import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ComplaintStatus, ComplaintCategory } from '@/types';

const getStatusColor = (status: ComplaintStatus) => {
  switch (status) {
    case 'new':
      return 'text-blue-600';
    case 'processing':
      return 'text-yellow-600';
    case 'resolved':
      return 'text-green-600';
    case 'rejected':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

const getStatusText = (status: ComplaintStatus) => {
  switch (status) {
    case 'new':
      return 'Новая';
    case 'processing':
      return 'В обработке';
    case 'resolved':
      return 'Решена';
    case 'rejected':
      return 'Отклонена';
    default:
      return status;
  }
};

const getCategoryText = (category: ComplaintCategory) => {
  switch (category) {
    case 'Facilities':
      return 'Инфраструктура';
    case 'Staff':
      return 'Персонал';
    case 'Equipment':
      return 'Оборудование';
    case 'Cleanliness':
      return 'Чистота';
    case 'Services':
      return 'Услуги';
    case 'Safety':
      return 'Безопасность';
    case 'Other':
      return 'Другое';
    default:
      return category;
  }
};

export function ComplaintsList({ complaints, ...props }) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      {/* ... existing filters ... */}
      
      {isMobile ? (
        // Мобильное представление
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{complaint.title}</h3>
                <span className={getStatusColor(complaint.status)}>
                  {getStatusText(complaint.status)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Категория: {getCategoryText(complaint.category)}</p>
                <p>Локация: {complaint.location}</p>
                <p>Создано: {new Date(complaint.created_at).toLocaleString('ru-RU')}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => props.onOpenResponseDialog(complaint)}
                >
                  Ответить
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => props.onDeleteComplaint(complaint.id)}
                >
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Десктопное представление
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Заголовок</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Локация</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell>{complaint.title}</TableCell>
                  <TableCell>{getCategoryText(complaint.category)}</TableCell>
                  <TableCell>
                    <span className={getStatusColor(complaint.status)}>
                      {getStatusText(complaint.status)}
                    </span>
                  </TableCell>
                  <TableCell>{complaint.location}</TableCell>
                  <TableCell>
                    {new Date(complaint.created_at).toLocaleString('ru-RU')}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => props.onOpenResponseDialog(complaint)}
                    >
                      Ответить
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => props.onDeleteComplaint(complaint.id)}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 
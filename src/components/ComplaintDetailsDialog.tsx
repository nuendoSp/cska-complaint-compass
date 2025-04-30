import React, { useState } from 'react';
import { Complaint } from '@/types';
import { formatDate } from '@/lib/utils';
import { Rating } from '@/components/ui/rating';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface ComplaintDetailsDialogProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
}

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

export function ComplaintDetailsDialog({ complaint, isOpen, onClose }: ComplaintDetailsDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {complaint.title || 'Без темы'}
          </DialogTitle>
          <DialogDescription>
            Обращение от {formatDate(new Date(complaint.submittedat || complaint.created_at || Date.now()))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Категория</div>
              <div>{categoryRu[complaint.category || 'other'] || complaint.category || 'Другое'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Статус</div>
              <Badge variant="outline">
                {statusRu[complaint.status || 'new'] || complaint.status || 'Новая'}
              </Badge>
            </div>
          </div>

          {complaint.rating && (
            <div>
              <div className="text-sm font-medium text-gray-500">Оценка</div>
              <Rating value={complaint.rating} readonly size="md" />
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Описание</div>
            <div className="text-sm whitespace-pre-wrap">{complaint.description || ''}</div>
          </div>

          {complaint.attachments && complaint.attachments.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Вложения</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {complaint.attachments.map((attachment, index) => {
                  const attachmentUrl = typeof attachment === 'string' ? attachment : attachment.url;
                  const attachmentName = typeof attachment === 'string' ? `Вложение ${index + 1}` : attachment.name;
                  const attachmentType = typeof attachment === 'string' ? 'image' : attachment.type;

                  if (!attachmentUrl) {
                    console.error('No URL for attachment:', attachment);
                    return null;
                  }

                  return (
                    <div key={typeof attachment === 'string' ? index : attachment.id} className="relative group">
                      {attachmentType.startsWith('image') ? (
                        <img
                          src={attachmentUrl}
                          alt={attachmentName}
                          className="w-full h-24 object-cover rounded-md cursor-pointer transition-transform hover:scale-105"
                          onClick={() => setSelectedImage(attachmentUrl)}
                          onError={(e) => {
                            console.error('Image load error:', e);
                            const target = e.target as HTMLImageElement;
                            console.log('Failed URL:', target.src);
                          }}
                        />
                      ) : (
                        <a
                          href={attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-full h-24 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <FileText className="w-8 h-8 text-gray-500" />
                        </a>
                      )}
                      <p className="text-xs text-gray-500 truncate mt-1">{attachmentName}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedImage && (
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
              <DialogContent className="max-w-4xl p-0">
                <img
                  src={selectedImage}
                  alt="Просмотр изображения"
                  className="w-full h-auto"
                />
              </DialogContent>
            </Dialog>
          )}

          {complaint.response && (
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm font-medium text-gray-500 mb-1">Ответ администратора</div>
              <div className="text-sm whitespace-pre-wrap">{complaint.response.text || ''}</div>
              <div className="mt-2 text-sm text-gray-500">
                {complaint.response.adminName || 'Администратор'} • {formatDate(new Date(complaint.response.respondedAt || complaint.response.created_at || Date.now()))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
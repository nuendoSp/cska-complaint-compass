import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useComplaintContext } from '@/context/ComplaintContext';
import { toast } from 'sonner';
import { Complaint, ComplaintCategory, ComplaintStatus } from '@/types';
import ComplaintsList from './ComplaintsList';
import ExportData from './ExportData';
import ResponseDialog from './ResponseDialog';
import { Dashboard } from './Dashboard';
import { ResponseTemplates } from './ResponseTemplates';
import { PriorityManager } from './PriorityManager';
import { AssigneeManager } from './AssigneeManager';
import { ChangeHistory } from './ChangeHistory';
import { FeedbackSystem } from './FeedbackSystem';
import { Surveys } from './Surveys';
import { Statistics } from './Statistics';
import SurveysManager from './SurveysManager';
import { format } from 'date-fns';
import { Rating } from '@/components/ui/rating';

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

const AdminTabs: React.FC = () => {
  const navigate = useNavigate();
  const { complaints, updateComplaint, respondToComplaint, deleteResponse, deleteComplaint } = useComplaintContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'all'>('all');
  const [responseDialog, setResponseDialog] = useState<{ isOpen: boolean; complaintId: string | null }>({
    isOpen: false,
    complaintId: null
  });
  const [responseText, setResponseText] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; complaint: Complaint | null }>({
    isOpen: false,
    complaint: null
  });
  const [deleteMultipleDialog, setDeleteMultipleDialog] = useState<{ isOpen: boolean; complaintIds: string[] }>({
    isOpen: false,
    complaintIds: []
  });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailsDialog, setDetailsDialog] = useState<{ isOpen: boolean; complaint: Complaint | null }>({ isOpen: false, complaint: null });

  const handleUpdateStatus = (id: string, status: Complaint['status']) => {
    updateComplaint(id, { status });
    toast.success('Статус успешно обновлен');
  };

  const handleOpenResponseDialog = (complaint: Complaint) => {
    setResponseDialog({ isOpen: true, complaintId: complaint.id });
    setSelectedComplaint(complaint);
  };

  const handleOpenDetailsDialog = (complaint: Complaint) => {
    setDetailsDialog({ isOpen: true, complaint });
  };

  const handleCloseResponseDialog = () => {
    setResponseDialog({
      isOpen: false,
      complaintId: null
    });
    setResponseText('');
  };

  const handleSubmitResponse = async () => {
    if (!responseDialog.complaintId || !responseText.trim()) return;

    await respondToComplaint(responseDialog.complaintId, {
      text: responseText,
      adminName: 'Администратор',
      respondedAt: new Date().toISOString()
    });

    handleCloseResponseDialog();
    toast.success('Ответ успешно отправлен');
  };

  const handleDeleteResponse = (complaintId: string) => {
    deleteResponse(complaintId);
    toast.success('Ответ успешно удален');
  };

  const handleDeleteComplaint = (complaintId: string) => {
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
      setDeleteDialog({
        isOpen: true,
        complaint
      });
    }
  };

  const handleDeleteMultipleComplaints = (complaintIds: string[]) => {
    setDeleteMultipleDialog({
      isOpen: true,
      complaintIds
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.complaint) {
      await deleteComplaint(deleteDialog.complaint.id);
      handleCloseDeleteDialog();
      toast.success('Жалоба успешно удалена');
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      complaint: null
    });
  };

  const handleConfirmMultipleDelete = async () => {
    for (const id of deleteMultipleDialog.complaintIds) {
      await deleteComplaint(id);
    }
    handleCloseMultipleDeleteDialog();
    toast.success('Выбранные жалобы успешно удалены');
  };

  const handleCloseMultipleDeleteDialog = () => {
    setDeleteMultipleDialog({
      isOpen: false,
      complaintIds: []
    });
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialog({ isOpen: false, complaint: null });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          На главную
        </Button>
        <h1 className="text-2xl font-bold">Панель администратора</h1>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
          <TabsTrigger value="complaints">Обращения</TabsTrigger>
          <TabsTrigger value="surveys">Опросы</TabsTrigger>
          <TabsTrigger value="priorities">Приоритеты</TabsTrigger>
          <TabsTrigger value="assignees">Исполнители</TabsTrigger>
          <TabsTrigger value="history">История изменений</TabsTrigger>
          <TabsTrigger value="statistics">Статистика</TabsTrigger>
          <TabsTrigger value="export">Экспорт данных</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard />
        </TabsContent>

        <TabsContent value="complaints">
          <ComplaintsList
            complaints={complaints}
            onUpdateStatus={handleUpdateStatus}
            onOpenResponseDialog={handleOpenResponseDialog}
            onOpenDetailsDialog={handleOpenDetailsDialog}
            onDeleteComplaint={handleDeleteComplaint}
            onDeleteResponse={handleDeleteResponse}
            onDeleteMultipleComplaints={handleDeleteMultipleComplaints}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        </TabsContent>

        <TabsContent value="surveys">
          <SurveysManager />
        </TabsContent>

        <TabsContent value="priorities">
          <PriorityManager />
        </TabsContent>

        <TabsContent value="assignees">
          <AssigneeManager />
        </TabsContent>

        <TabsContent value="history">
          <ChangeHistory />
        </TabsContent>

        <TabsContent value="statistics">
          <Statistics />
        </TabsContent>

        <TabsContent value="export">
          <ExportData complaints={complaints} />
        </TabsContent>
      </Tabs>

      <ResponseDialog
        isOpen={responseDialog.isOpen}
        onClose={handleCloseResponseDialog}
        onSubmit={handleSubmitResponse}
        responseText={responseText}
        setResponseText={setResponseText}
      />

      <Dialog open={deleteDialog.isOpen} onOpenChange={handleCloseDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить эту жалобу? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDeleteDialog}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteMultipleDialog.isOpen} onOpenChange={handleCloseMultipleDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить выбранные жалобы? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseMultipleDeleteDialog}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleConfirmMultipleDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialog.isOpen} onOpenChange={handleCloseDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Детали обращения</DialogTitle>
          </DialogHeader>
          {detailsDialog.complaint && (
            <div>
              <div><b>Тема:</b> {detailsDialog.complaint.title}</div>
              <div><b>Описание:</b> {detailsDialog.complaint.description}</div>
              <div><b>Категория:</b> {categoryRu[detailsDialog.complaint.category] || detailsDialog.complaint.category}</div>
              <div><b>Статус:</b> {statusRu[detailsDialog.complaint.status] || detailsDialog.complaint.status}</div>
              <div><b>Дата:</b> {format(new Date(detailsDialog.complaint.created_at), 'dd.MM.yyyy HH:mm')}</div>
              <div><b>Локация:</b> {detailsDialog.complaint.location}</div>
              
              {detailsDialog.complaint.rating && (
                <div className="mt-4">
                  <b>Оценка:</b>
                  <div className="mt-2">
                    <Rating value={detailsDialog.complaint.rating} readonly size="md" />
                  </div>
                </div>
              )}

              {detailsDialog.complaint.attachments && detailsDialog.complaint.attachments.length > 0 && (
                <div className="mt-4">
                  <b>Вложения:</b>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {detailsDialog.complaint.attachments.map((attachment, index) => {
                      const attachmentUrl = typeof attachment === 'string' ? attachment : attachment.url;
                      const attachmentName = typeof attachment === 'string' ? `Вложение ${index + 1}` : attachment.name;
                      
                      return (
                        <div key={index} className="relative group">
                          <a 
                            href={attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={attachmentUrl}
                              alt={attachmentName}
                              className="w-full h-32 object-cover rounded-md hover:opacity-90 transition-opacity"
                            />
                            <p className="text-xs text-gray-500 truncate mt-1">{attachmentName}</p>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <b>Ответ администрации:</b><br/>
                {detailsDialog.complaint.response && detailsDialog.complaint.response.text
                  ? <span>{detailsDialog.complaint.response.text}</span>
                  : <span className="text-gray-500">Ещё не дан</span>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDetailsDialog}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTabs;

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
import { useComplaints } from '@/context/ComplaintContext';
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

const AdminTabs: React.FC = () => {
  const navigate = useNavigate();
  const { complaints, updateComplaint, respondToComplaint, deleteResponse, deleteComplaint } = useComplaints();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'all'>('all');
  const [responseDialog, setResponseDialog] = useState<{ isOpen: boolean; complaintId: string | null }>({
    isOpen: false,
    complaintId: null
  });
  const [responseText, setResponseText] = useState('');
  const [adminName, setAdminName] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; complaint: Complaint | null }>({
    isOpen: false,
    complaint: null
  });
  const [deleteMultipleDialog, setDeleteMultipleDialog] = useState<{ isOpen: boolean; complaintIds: string[] }>({
    isOpen: false,
    complaintIds: []
  });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const handleUpdateStatus = (id: string, status: Complaint['status']) => {
    updateComplaint(id, { status });
    toast.success('Статус успешно обновлен');
  };

  const handleOpenResponseDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  const handleCloseResponseDialog = () => {
    setResponseDialog({
      isOpen: false,
      complaintId: null
    });
    setResponseText('');
    setAdminName('');
  };

  const handleSubmitResponse = () => {
    if (!responseDialog.complaintId || !responseText.trim() || !adminName.trim()) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    respondToComplaint(responseDialog.complaintId, {
      text: responseText,
      adminName,
      respondedAt: new Date().toISOString()
    });

    handleCloseResponseDialog();
    toast.success('Ответ успешно отправлен');
  };

  const handleDeleteResponse = (complaintId: string, responseId: string) => {
    deleteResponse(complaintId, responseId);
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
          <TabsTrigger value="complaints">Жалобы</TabsTrigger>
          <TabsTrigger value="surveys">Опросы</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны ответов</TabsTrigger>
          <TabsTrigger value="priorities">Приоритеты</TabsTrigger>
          <TabsTrigger value="assignees">Исполнители</TabsTrigger>
          <TabsTrigger value="history">История изменений</TabsTrigger>
          <TabsTrigger value="feedback">Обратная связь</TabsTrigger>
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

        <TabsContent value="templates">
          <ResponseTemplates />
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

        <TabsContent value="feedback">
          <FeedbackSystem />
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
        adminName={adminName}
        setAdminName={setAdminName}
        complaint={selectedComplaint}
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
    </div>
  );
};

export default AdminTabs;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
import { default as SurveysManager } from './SurveysManager';
import { Statistics } from './Statistics';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Response {
  text: string;
  adminName: string;
  respondedAt: string;
  message: string;
}

interface ResponseDialog {
  isOpen: boolean;
  complaintId?: string;
}

const AdminTabs: React.FC = () => {
  const navigate = useNavigate();
  const { complaints, updateComplaint, respondToComplaint, deleteResponse, deleteComplaint, setComplaints } = useComplaintContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'all'>('all');
  const [responseDialog, setResponseDialog] = useState<ResponseDialog>({
    isOpen: false,
    complaintId: undefined
  });
  const [responseText, setResponseText] = useState('');
  const [adminName, setAdminName] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; complaintId: string }>({
    isOpen: false,
    complaintId: ''
  });
  const [deleteMultipleDialog, setDeleteMultipleDialog] = useState<{ isOpen: boolean; complaintIds: string[] }>({
    isOpen: false,
    complaintIds: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/complaints');
      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Ошибка при загрузке жалоб');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = (id: string, status: Complaint['status']) => {
    updateComplaint(id, { status });
    toast.success('Статус успешно обновлен');
  };

  const handleStatusChange = async (complaintId: string, status: ComplaintStatus) => {
    try {
      await handleUpdateStatus(complaintId, status);
      await fetchComplaints();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleOpenResponseDialog = (complaint: Complaint) => {
    setResponseDialog({
      isOpen: true,
      complaintId: complaint.id
    });
  };

  const handleCloseResponseDialog = () => {
    setResponseDialog({
      isOpen: false,
      complaintId: undefined
    });
    setResponseText('');
    setAdminName('');
  };

  const handleSubmitResponse = async () => {
    if (!responseDialog.complaintId || !responseText.trim() || !adminName.trim()) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    const response: Response = {
      text: responseText,
      adminName,
      respondedAt: new Date().toISOString(),
      message: responseText
    };

    try {
      await fetch(`/api/complaints/${responseDialog.complaintId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      });
      
      const complaintsResponse = await fetch('/api/complaints');
      const updatedComplaints = await complaintsResponse.json();
      setComplaints(updatedComplaints);
      
      setResponseDialog({ isOpen: false, complaintId: undefined });
      toast.success('Ответ успешно отправлен');
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Ошибка при отправке ответа');
    }
  };

  const handleDeleteResponse = async (complaintId: string) => {
    try {
      await deleteResponse(complaintId);
      const updatedComplaints = complaints.map(c => 
        c.id === complaintId ? { ...c, response: undefined } : c
      );
      setComplaints(updatedComplaints);
      toast.success('Ответ успешно удален');
    } catch (error) {
      console.error('Error deleting response:', error);
      toast.error('Ошибка при удалении ответа');
    }
  };

  const handleDeleteComplaint = (complaintId: string) => {
    setDeleteDialog({ isOpen: true, complaintId });
  };

  const handleDeleteMultipleComplaints = (complaintIds: string[]) => {
    setDeleteMultipleDialog({
      isOpen: true,
      complaintIds
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.complaintId) {
      await deleteComplaint(deleteDialog.complaintId);
      handleCloseDeleteDialog();
      toast.success('Жалоба успешно удалена');
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      complaintId: ''
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
          <TabsTrigger value="complaints">Обращения</TabsTrigger>
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

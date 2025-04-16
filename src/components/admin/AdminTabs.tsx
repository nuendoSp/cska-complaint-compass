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
      adminName
    });

    handleCloseResponseDialog();
    toast.success('Ответ успешно отправлен');
  };

  const handleDeleteResponse = (complaintId: string, responseId: string) => {
    // Реализация удаления ответа
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

  const handleConfirmDelete = async () => {
    if (deleteDialog.complaint) {
      await deleteComplaint(deleteDialog.complaint.id);
      toast.success('Жалоба успешно удалена');
      setDeleteDialog({
        isOpen: false,
        complaint: null
      });
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      complaint: null
    });
  };

  const handleDeleteMultipleComplaints = (complaintIds: string[]) => {
    setDeleteMultipleDialog({
      isOpen: true,
      complaintIds
    });
  };

  const handleConfirmMultipleDelete = async () => {
    for (const complaintId of deleteMultipleDialog.complaintIds) {
      await deleteComplaint(complaintId);
    }
    toast.success(`Успешно удалено ${deleteMultipleDialog.complaintIds.length} жалоб`);
    setDeleteMultipleDialog({
      isOpen: false,
      complaintIds: []
    });
  };

  const handleCloseMultipleDeleteDialog = () => {
    setDeleteMultipleDialog({
      isOpen: false,
      complaintIds: []
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад
        </Button>
        <h1 className="text-2xl font-bold">Панель администратора</h1>
      </div>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
          <TabsTrigger value="complaints">Жалобы</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <Dashboard />
        </TabsContent>
        
        <TabsContent value="complaints">
          <ComplaintsList 
            complaints={complaints}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onUpdateStatus={handleUpdateStatus}
            onOpenResponseDialog={handleOpenResponseDialog}
            onDeleteResponse={handleDeleteResponse}
            onDeleteComplaint={handleDeleteComplaint}
            onDeleteMultipleComplaints={handleDeleteMultipleComplaints}
          />
        </TabsContent>
        
        <TabsContent value="templates">
          <ResponseTemplates />
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="space-y-4">
            <PriorityManager />
            <AssigneeManager />
            <ChangeHistory />
            <FeedbackSystem />
            <Surveys />
            <Statistics />
          </div>
        </TabsContent>
      </Tabs>

      <ResponseDialog
        isOpen={responseDialog.isOpen}
        onClose={handleCloseResponseDialog}
        onSubmit={handleSubmitResponse}
        adminName={adminName}
        setAdminName={setAdminName}
        responseText={responseText}
        setResponseText={setResponseText}
      />

      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && handleCloseDeleteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Подтверждение удаления
            </DialogTitle>
            <DialogDescription>
              Вы собираетесь удалить жалобу #{deleteDialog.complaint?.id}. Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          
          {deleteDialog.complaint && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Информация о жалобе:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Категория: {deleteDialog.complaint.category}</li>
                <li>Локация: {deleteDialog.complaint.location}</li>
                <li>Статус: {deleteDialog.complaint.status}</li>
                <li>Дата создания: {new Date(deleteDialog.complaint.submittedAt).toLocaleString('ru-RU')}</li>
              </ul>
            </div>
          )}

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

      <Dialog open={deleteMultipleDialog.isOpen} onOpenChange={(open) => !open && handleCloseMultipleDeleteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Подтверждение удаления
            </DialogTitle>
            <DialogDescription>
              Вы собираетесь удалить {deleteMultipleDialog.complaintIds.length} жалоб. Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Выбранные жалобы:</p>
            <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
              {deleteMultipleDialog.complaintIds.map(id => {
                const complaint = complaints.find(c => c.id === id);
                return (
                  <li key={id} className="flex items-center gap-2">
                    <span>#{id}</span>
                    {complaint && (
                      <span className="text-gray-500">
                        ({complaint.category}, {complaint.status})
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseMultipleDeleteDialog}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleConfirmMultipleDelete}>
              Удалить выбранные
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTabs;

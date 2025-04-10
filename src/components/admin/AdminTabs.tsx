
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useComplaints } from '@/context/ComplaintContext';
import { toast } from 'sonner';
import { Complaint, ComplaintCategory } from '@/types';
import ComplaintsList from './ComplaintsList';
import ExportData from './ExportData';
import ResponseDialog from './ResponseDialog';

const AdminTabs: React.FC = () => {
  const navigate = useNavigate();
  const { complaints, updateComplaint, respondToComplaint } = useComplaints();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Complaint['status'] | 'all'>('all');
  const [responseDialog, setResponseDialog] = useState<{ isOpen: boolean; complaintId: string | null }>({
    isOpen: false,
    complaintId: null
  });
  const [responseText, setResponseText] = useState('');
  const [adminName, setAdminName] = useState('');

  const handleUpdateStatus = (id: string, status: Complaint['status']) => {
    updateComplaint(id, { status });
    toast.success('Статус успешно обновлен');
  };

  const handleOpenResponseDialog = (complaintId: string) => {
    setResponseDialog({
      isOpen: true,
      complaintId
    });
    setResponseText('');
    setAdminName('');
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
      
      <Tabs defaultValue="complaints" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="complaints">Жалобы</TabsTrigger>
          <TabsTrigger value="export">Экспорт данных</TabsTrigger>
        </TabsList>
        
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
          />
        </TabsContent>
        
        <TabsContent value="export">
          <ExportData complaints={complaints} />
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
    </div>
  );
};

export default AdminTabs;


import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { FileText, Search, Clock, CheckCircle2, AlertCircle, XCircle, MessageSquare } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { Complaint, ComplaintCategory } from '@/types';

interface ComplaintsListProps {
  complaints: Complaint[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterCategory: ComplaintCategory | 'all';
  setFilterCategory: (value: ComplaintCategory | 'all') => void;
  filterStatus: Complaint['status'] | 'all';
  setFilterStatus: (value: Complaint['status'] | 'all') => void;
  onUpdateStatus: (id: string, status: Complaint['status']) => void;
  onOpenResponseDialog: (complaintId: string) => void;
}

const ComplaintsList: React.FC<ComplaintsListProps> = ({
  complaints,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  onUpdateStatus,
  onOpenResponseDialog,
}) => {
  // Filter complaints based on search and filters
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || complaint.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort by date, newest first
  const sortedComplaints = [...filteredComplaints].sort(
    (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Поиск по описанию или локации" 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <Select 
            value={filterCategory} 
            onValueChange={(value) => setFilterCategory(value as ComplaintCategory | 'all')}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              <SelectItem value="Facilities">Помещения</SelectItem>
              <SelectItem value="Staff">Персонал</SelectItem>
              <SelectItem value="Equipment">Оборудование</SelectItem>
              <SelectItem value="Cleanliness">Чистота</SelectItem>
              <SelectItem value="Services">Услуги</SelectItem>
              <SelectItem value="Safety">Безопасность</SelectItem>
              <SelectItem value="Other">Другое</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filterStatus} 
            onValueChange={(value) => setFilterStatus(value as Complaint['status'] | 'all')}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="new">Новые</SelectItem>
              <SelectItem value="processing">В обработке</SelectItem>
              <SelectItem value="resolved">Решенные</SelectItem>
              <SelectItem value="rejected">Отклоненные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {sortedComplaints.length === 0 ? (
        <Card className="text-center p-10">
          <p className="text-gray-500">Жалобы не найдены</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedComplaints.map((complaint) => (
            <Card key={complaint.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-1">
                  <CardTitle className="text-lg">{complaint.locationName}</CardTitle>
                  <StatusBadge status={complaint.status} />
                </div>
                <CardDescription className="flex justify-between items-center">
                  <span>Категория: {complaint.category}</span>
                  <span className="text-sm text-gray-500">
                    {format(complaint.submittedAt, 'dd.MM.yyyy HH:mm')}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{complaint.description}</p>
                
                {complaint.attachments.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Вложения:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {complaint.attachments.map(attachment => (
                        <div key={attachment.id} className="relative">
                          {attachment.type === 'image' ? (
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="w-full h-24 object-cover rounded-md"
                            />
                          ) : (
                            <video
                              src={attachment.url}
                              controls
                              className="w-full h-24 object-cover rounded-md"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {complaint.response && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium text-blue-800 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Ответ администратора
                      </h4>
                      <span className="text-xs text-gray-500">
                        {format(complaint.response.respondedAt, 'dd.MM.yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{complaint.response.text}</p>
                    <p className="text-xs text-gray-500 mt-2">Ответил: {complaint.response.adminName}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between bg-gray-50 px-6 py-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Подробнее
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  {complaint.status === 'new' && (
                    <>
                      <Button variant="outline" size="sm" className="gap-1 border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                        onClick={() => onUpdateStatus(complaint.id, 'processing')}>
                        <Clock className="h-3.5 w-3.5" />
                        Взять в работу
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => onUpdateStatus(complaint.id, 'rejected')}>
                        <XCircle className="h-3.5 w-3.5" />
                        Отклонить
                      </Button>
                    </>
                  )}
                  
                  {complaint.status === 'processing' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 border-blue-500 text-blue-500 hover:bg-blue-50"
                        onClick={() => onOpenResponseDialog(complaint.id)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Ответить
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 border-green-500 text-green-500 hover:bg-green-50"
                        onClick={() => onUpdateStatus(complaint.id, 'resolved')}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Завершить
                      </Button>
                    </>
                  )}
                  
                  {(complaint.status === 'resolved' || complaint.status === 'rejected') && !complaint.response && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => onUpdateStatus(complaint.id, 'processing')}
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      Возобновить
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintsList;

import React, { useState } from 'react';
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
import { supabase } from '@/lib/supabase';
import { Rating } from '@/components/ui/rating';

interface ComplaintsListProps {
  complaints: Complaint[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: ComplaintCategory | 'all';
  setFilterCategory: (category: ComplaintCategory | 'all') => void;
  filterStatus: Complaint['status'] | 'all';
  setFilterStatus: (status: Complaint['status'] | 'all') => void;
  onUpdateStatus: (id: string, status: Complaint['status']) => void;
  onOpenResponseDialog: (complaint: Complaint) => void;
  onOpenDetailsDialog: (complaint: Complaint) => void;
  onDeleteResponse: (complaintId: string, responseId: string) => void;
  onDeleteComplaint: (complaintId: string) => void;
  onDeleteMultipleComplaints: (complaintIds: string[]) => void;
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
  onOpenDetailsDialog,
  onDeleteResponse,
  onDeleteComplaint,
  onDeleteMultipleComplaints,
}) => {
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);

  // Filter complaints based on search and filters
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || complaint.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort by date, newest first
  const sortedComplaints = [...filteredComplaints].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleSelectComplaint = (complaintId: string) => {
    setSelectedComplaints(prev => 
      prev.includes(complaintId) 
        ? prev.filter(id => id !== complaintId)
        : [...prev, complaintId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedComplaints.length > 0) {
      onDeleteMultipleComplaints(selectedComplaints);
      setSelectedComplaints([]);
    }
  };

  // Перевод категорий и статусов на русский
  const categoryRu: Record<string, string> = {
    facilities: 'Объекты и инфраструктура',
    staff: 'Персонал',
    equipment: 'Оборудование',
    cleanliness: 'Чистота',
    services: 'Услуги',
    safety: 'Безопасность',
    other: 'Другое',
  };
  const statusRu: Record<string, string> = {
    new: 'Новая',
    processing: 'В обработке',
    resolved: 'Решено',
    rejected: 'Отклонено',
  };

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
          {selectedComplaints.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              Удалить выбранные ({selectedComplaints.length})
            </Button>
          )}
          
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
          <p className="text-gray-500">обращения не найдены</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedComplaints.map(complaint => (
            <Card 
              key={complaint.id}
              className={selectedComplaints.includes(complaint.id) ? 'border-blue-500 bg-blue-50' : ''}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedComplaints.includes(complaint.id)}
                      onChange={() => handleSelectComplaint(complaint.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <CardTitle className="text-lg">
                        Обращение от {format(new Date(complaint.created_at || Date.now()), 'dd.MM.yyyy HH:mm')} — {complaint.title || 'Без темы'}
                      </CardTitle>
                      <CardDescription>
                        Категория: {categoryRu[complaint.category] || 'Другое'} | Локация: {'ТЦ "ЦСКА"'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={complaint.status} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDeleteComplaint(complaint.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-700 mb-4">{complaint.description}</p>
                
                {complaint.rating && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Оценка:</p>
                    <Rating value={complaint.rating} readonly size="md" />
                  </div>
                )}
                
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Вложения:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {complaint.attachments.map((attachment, index) => {
                        console.log('Attachment in ComplaintsList:', attachment);
                        const isString = typeof attachment === 'string';
                        
                        const url = isString ? attachment : attachment.url;
                        const name = isString ? `Вложение ${index + 1}` : attachment.name;
                        
                        console.log('Processing attachment:', { url, name });
                        
                        if (!url) {
                          console.error('No URL for attachment:', attachment);
                          return null;
                        }
                        
                        return (
                          <div key={isString ? index : attachment.id} className="relative group">
                            <img
                              src={url}
                              alt={name}
                              className="w-full h-24 object-cover rounded-md cursor-pointer"
                              onClick={() => window.open(url, '_blank')}
                              onError={(e) => {
                                console.error('Image load error:', e);
                                const target = e.target as HTMLImageElement;
                                console.log('Failed URL:', target.src);
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
                          </div>
                        );
                      })}
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {format(new Date(complaint.response.respondedAt), 'dd.MM.yyyy HH:mm')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDeleteResponse(complaint.id, complaint.response.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MessageSquare className="h-4 w-4" />
                      <span>
                        Ответ от {complaint.response.adminName} ({format(new Date(complaint.response.created_at), 'dd.MM.yyyy HH:mm')})
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => onOpenDetailsDialog(complaint)}>
                    <FileText className="h-3.5 w-3.5" />
                    Подробнее
                  </Button>
                </div>

                <div className="flex gap-2">
                  {complaint.status === 'new' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                        onClick={() => onUpdateStatus(complaint.id, 'processing')}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Взять в работу
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => onUpdateStatus(complaint.id, 'rejected')}
                      >
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
                        onClick={() => onOpenResponseDialog(complaint)}
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

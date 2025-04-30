import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useComplaintContext } from '@/context/ComplaintContext';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Clock, CheckCircle2, AlertCircle, XCircle, FileText } from 'lucide-react';
import { Complaint, ComplaintCategory } from '@/types';
import { formatDate } from '@/lib/utils';
import { ComplaintDetailsDialog } from '@/components/ComplaintDetailsDialog';

export default function ComplaintsListPage() {
  const navigate = useNavigate();
  const { complaints } = useComplaintContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | 'all'>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Get unique locations for filter
  const uniqueLocations = ['cska_default'];

  // Filter complaints based on search term and filters
  const filteredComplaints = complaints.filter(complaint => 
    (complaint.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (complaint.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by date, newest first
  const sortedComplaints = [...filteredComplaints].sort((a: Complaint, b: Complaint) => {
    const dateA = a.submittedat ? new Date(a.submittedat).getTime() : new Date(a.created_at || Date.now()).getTime();
    const dateB = b.submittedat ? new Date(b.submittedat).getTime() : new Date(b.created_at || Date.now()).getTime();
    return dateB - dateA;
  });

  // Перевод категорий на русский
  const categoryRu: Record<string, string> = {
    facilities: 'Объекты и инфраструктура',
    staff: 'Персонал',
    equipment: 'Оборудование',
    cleanliness: 'Чистота',
    services: 'Услуги',
    safety: 'Безопасность',
    other: 'Другое',
  };

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'new':
        return (
          <Badge className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" /> Новая
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="h-3 w-3 mr-1" /> В обработке
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Решено
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500">
            <XCircle className="h-3 w-3 mr-1" /> Отклонено
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 mt-8">
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
          <h1 className="text-2xl font-bold">Список обращений</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Поиск по описанию или теме" 
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
                <SelectItem value="facilities">Объекты и инфраструктура</SelectItem>
                <SelectItem value="staff">Персонал</SelectItem>
                <SelectItem value="equipment">Оборудование</SelectItem>
                <SelectItem value="cleanliness">Чистота</SelectItem>
                <SelectItem value="services">Услуги</SelectItem>
                <SelectItem value="safety">Безопасность</SelectItem>
                <SelectItem value="other">Другое</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filterLocation} 
              onValueChange={(value) => setFilterLocation(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Локация" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все локации</SelectItem>
                {uniqueLocations.map((locationId) => (
                  <SelectItem key={locationId || 'unknown'} value={locationId || 'unknown'}>
                    {'ТЦ "ЦСКА"'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {sortedComplaints.length === 0 ? (
          <Card className="text-center p-10">
            <p className="text-gray-500">Обращения не найдены</p>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Обращения</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Локация</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedComplaints.map((complaint: Complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="whitespace-nowrap">
                        {complaint.submittedat ? formatDate(new Date(complaint.submittedat)) : formatDate(new Date(complaint.created_at || Date.now()))}
                      </TableCell>
                      <TableCell>{'ТЦ "ЦСКА"'}</TableCell>
                      <TableCell>{categoryRu[complaint.category || 'other'] || 'Другое'}</TableCell>
                      <TableCell>{getStatusBadge(complaint.status || 'new')}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        <b>{complaint.title || 'Без темы'}</b>: {complaint.description && complaint.description.length > 50
                          ? `${complaint.description.substring(0, 50)}...`
                          : complaint.description || ''}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Подробнее
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {selectedComplaint && (
          <ComplaintDetailsDialog
            complaint={selectedComplaint}
            isOpen={!!selectedComplaint}
            onClose={() => {
              setSelectedComplaint(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}

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
import { useState } from 'react';

const ComplaintsListPage = () => {
  const navigate = useNavigate();
  const { complaints } = useComplaintContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | 'all'>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Get unique locations for filter
  const uniqueLocations = Array.from(new Set(complaints.map(complaint => complaint.locationId)));

  // Filter complaints based on search term and filters
  const filteredComplaints = complaints.filter((complaint: Complaint) => {
    const matchesSearch = 
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (complaint.locationName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || complaint.category === filterCategory;
    const matchesLocation = filterLocation === 'all' || complaint.locationId === filterLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Sort by date, newest first
  const sortedComplaints = [...filteredComplaints].sort((a: Complaint, b: Complaint) => {
    const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return dateB - dateA;
  });

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
              value={filterLocation} 
              onValueChange={(value) => setFilterLocation(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Локация" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все локации</SelectItem>
                {uniqueLocations.map((locationId) => {
                  const complaint = complaints.find(c => c.locationId === locationId);
                  return (
                    <SelectItem key={locationId} value={locationId || ''}>
                      {complaint?.locationName || locationId}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {sortedComplaints.length === 0 ? (
          <Card className="text-center p-10">
            <p className="text-gray-500">обращения не найдены</p>
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
                        {complaint.submittedAt ? formatDate(new Date(complaint.submittedAt)) : 'Не указано'}
                      </TableCell>
                      <TableCell>{complaint.locationName || 'Без названия'}</TableCell>
                      <TableCell>{complaint.category}</TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {complaint.description.length > 50
                          ? `${complaint.description.substring(0, 50)}...`
                          : complaint.description}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => navigate(`/complaints/${complaint.id}`)}
                        >
                          <FileText className="h-4 w-4" />
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
      </div>
    </Layout>
  );
};

export default ComplaintsListPage;


import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useComplaints } from '@/context/ComplaintContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, XCircle, MessageSquare } from 'lucide-react';
import { Complaint } from '@/types';
import { format } from 'date-fns';

const ComplaintDetailPage = () => {
  const { complaintId } = useParams<{ complaintId: string }>();
  const navigate = useNavigate();
  const { getComplaintById } = useComplaints();
  
  const complaint = getComplaintById(complaintId || '');

  if (!complaint) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Жалоба не найдена</h1>
          <Button onClick={() => navigate('/complaints')}>Вернуться к списку</Button>
        </div>
      </Layout>
    );
  }

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
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate('/complaints')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            К списку
          </Button>
          <h1 className="text-2xl font-bold">Подробности жалобы</h1>
        </div>

        <Card className="overflow-hidden mb-6">
          <CardHeader>
            <div className="flex justify-between items-start mb-1">
              <CardTitle className="text-lg">{complaint.locationName}</CardTitle>
              {getStatusBadge(complaint.status)}
            </div>
            <CardDescription className="flex justify-between items-center">
              <span>Категория: {complaint.category}</span>
              <span className="text-sm text-gray-500">
                {format(complaint.submittedAt, 'dd.MM.yyyy HH:mm')}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Описание:</h3>
              <p className="text-gray-700">{complaint.description}</p>
            </div>
            
            {complaint.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Вложения:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
        </Card>
      </div>
    </Layout>
  );
};

export default ComplaintDetailPage;

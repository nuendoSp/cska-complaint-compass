
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Complaint } from '@/types';

interface StatusBadgeProps {
  status: Complaint['status'];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
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

export default StatusBadge;

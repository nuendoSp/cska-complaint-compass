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
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <Clock className="h-3 w-3 mr-1" /> Новая
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <AlertCircle className="h-3 w-3 mr-1" /> В обработке
        </Badge>
      );
    case 'resolved':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Решено
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
          <XCircle className="h-3 w-3 mr-1" /> Отклонено
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

export default StatusBadge;

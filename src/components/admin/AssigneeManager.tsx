import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Complaint } from '../../types';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface Assignee {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const AssigneeManager = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [complaintsData, assigneesData] = await Promise.all([
        supabase.from('complaints').select('*').order('created_at', { ascending: false }),
        supabase.from('assignees').select('*').order('name')
      ]);

      if (complaintsData.error) throw complaintsData.error;
      if (assigneesData.error) throw assigneesData.error;

      setComplaints(complaintsData.data || []);
      setAssignees(assigneesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssigneeChange = async (complaintId: string, assigneeId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ assignee_id: assigneeId })
        .eq('id', complaintId);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error updating assignee:', error);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Управление назначением</h1>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID жалобы</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Ответственный</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow key={complaint.id}>
              <TableCell>{complaint.id}</TableCell>
              <TableCell>{complaint.category}</TableCell>
              <TableCell>{complaint.status}</TableCell>
              <TableCell>
                <Select
                  value={complaint.assignee_id || ''}
                  onValueChange={(value) => handleAssigneeChange(complaint.id, value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Выберите ответственного" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignees.map((assignee) => (
                      <SelectItem key={assignee.id} value={assignee.id}>
                        <div className="flex flex-col">
                          <span>{assignee.name}</span>
                          <span className="text-sm text-gray-500">{assignee.role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAssigneeChange(complaint.id, '')}
                >
                  Сбросить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 
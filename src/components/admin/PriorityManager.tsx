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

interface Priority {
  id: string;
  name: string;
  color: string;
  description: string;
}

export const PriorityManager = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [complaintsData, prioritiesData] = await Promise.all([
        supabase.from('complaints').select('*').order('created_at', { ascending: false }),
        supabase.from('priorities').select('*').order('name')
      ]);

      if (complaintsData.error) throw complaintsData.error;
      if (prioritiesData.error) throw prioritiesData.error;

      setComplaints(complaintsData.data || []);
      setPriorities(prioritiesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (complaintId: string, priorityId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ priority_id: priorityId })
        .eq('id', complaintId);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Управление приоритетами</h1>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID обращения</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Приоритет</TableHead>
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
                  value={complaint.priority_id || ''}
                  onValueChange={(value) => handlePriorityChange(complaint.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.id} value={priority.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: priority.color }}
                          />
                          {priority.name}
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
                  onClick={() => handlePriorityChange(complaint.id, '')}
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
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ChangeHistoryProps {
  complaintId: string;
}

interface ChangeRecord {
  id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  created_at: string;
}

export function ChangeHistory({ complaintId }: ChangeHistoryProps) {
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChangeHistory() {
      try {
        const { data, error } = await supabase
          .from('change_history')
          .select('*')
          .eq('complaint_id', complaintId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setChanges(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка при загрузке истории изменений');
      } finally {
        setLoading(false);
      }
    }

    fetchChangeHistory();
  }, [complaintId]);

  if (loading) {
    return <div>Загрузка истории изменений...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">История изменений</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Поле</TableHead>
            <TableHead>Старое значение</TableHead>
            <TableHead>Новое значение</TableHead>
            <TableHead>Кто изменил</TableHead>
            <TableHead>Дата</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {changes.map((change) => (
            <TableRow key={change.id}>
              <TableCell>{change.field_name}</TableCell>
              <TableCell>{change.old_value || '-'}</TableCell>
              <TableCell>{change.new_value || '-'}</TableCell>
              <TableCell>{change.changed_by}</TableCell>
              <TableCell>
                {new Date(change.created_at).toLocaleString('ru-RU')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {changes.length === 0 && (
        <div className="text-center text-gray-500">
          История изменений пуста
        </div>
      )}
    </div>
  );
} 
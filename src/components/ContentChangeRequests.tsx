import { useEffect, useCallback, useState } from 'react';
import { useContent } from '@/context/ContentContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ChangeRequest } from '@/types';

export function ContentChangeRequests() {
  const { getPendingChanges, approveChange, rejectChange } = useContent();
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; changeId: string | null }>({
    open: false,
    changeId: null,
  });
  const [rejectComment, setRejectComment] = useState('');

  const loadChanges = useCallback(async () => {
    try {
      const pendingChanges = await getPendingChanges();
      setChangeRequests(pendingChanges as ChangeRequest[]);
      setError(null);
    } catch (error) {
      console.error('Error loading changes:', error);
      setError('Ошибка при загрузке запросов на изменение');
    } finally {
      setLoading(false);
    }
  }, [getPendingChanges]);

  useEffect(() => {
    loadChanges();
  }, [loadChanges]);

  async function handleApprove(changeId: string) {
    try {
      await approveChange(changeId);
      await loadChanges();
    } catch (err) {
      console.error('Error approving change:', err);
      setError('Ошибка при одобрении изменения');
    }
  }

  async function handleReject() {
    if (!rejectDialog.changeId || !rejectComment.trim()) return;

    try {
      await rejectChange(rejectDialog.changeId, rejectComment);
      setRejectDialog({ open: false, changeId: null });
      setRejectComment('');
      await loadChanges();
    } catch (err) {
      console.error('Error rejecting change:', err);
      setError('Ошибка при отклонении изменения');
    }
  }

  if (loading) {
    return <div>Загрузка запросов на изменение...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Запросы на изменение контента</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Компонент</TableHead>
            <TableHead>Ключ</TableHead>
            <TableHead>Текущее значение</TableHead>
            <TableHead>Новое значение</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {changeRequests.map((change) => (
            <TableRow key={change.id}>
              <TableCell>{change.content_management.component_name}</TableCell>
              <TableCell>{change.content_management.content_key}</TableCell>
              <TableCell>{change.old_value}</TableCell>
              <TableCell>{change.new_value}</TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleApprove(change.id)}
                >
                  Одобрить
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setRejectDialog({ open: true, changeId: change.id })
                  }
                >
                  Отклонить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {changeRequests.length === 0 && (
        <div className="text-center text-gray-500">
          Нет ожидающих запросов на изменение
        </div>
      )}

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) =>
          setRejectDialog({ open, changeId: open ? rejectDialog.changeId : null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонение запроса на изменение</DialogTitle>
            <DialogDescription>
              Пожалуйста, укажите причину отклонения запроса
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder="Причина отклонения..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRejectDialog({ open: false, changeId: null })
              }
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectComment.trim()}
            >
              Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
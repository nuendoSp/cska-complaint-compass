
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  adminName: string;
  setAdminName: (name: string) => void;
  responseText: string;
  setResponseText: (text: string) => void;
}

const ResponseDialog: React.FC<ResponseDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  adminName,
  setAdminName,
  responseText,
  setResponseText
}) => {
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ответить на жалобу</DialogTitle>
          <DialogDescription>
            Введите текст ответа на жалобу клиента
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="admin-name" className="text-sm font-medium">
              Ваше имя
            </label>
            <Input
              id="admin-name"
              placeholder="Введите ваше имя"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="response" className="text-sm font-medium">
              Текст ответа
            </label>
            <Textarea
              id="response"
              placeholder="Введите текст ответа"
              rows={5}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" onClick={onSubmit}>
            Отправить ответ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResponseDialog;

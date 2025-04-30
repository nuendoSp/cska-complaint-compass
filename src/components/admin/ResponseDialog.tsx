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
import { supabase } from '../../lib/supabase';

interface ResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  responseText: string;
  setResponseText: (text: string) => void;
}

interface ResponseTemplate {
  id: string;
  title: string;
  content: string;
}

const ResponseDialog: React.FC<ResponseDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  responseText,
  setResponseText
}) => {
  const [templates, setTemplates] = React.useState<ResponseTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = React.useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setLoadingTemplates(true);
      (async () => {
        const { data } = await supabase
          .from('response_templates')
          .select('*')
          .order('created_at', { ascending: false });
        setTemplates(data || []);
        setLoadingTemplates(false);
        setSelectedTemplateId('');
        setResponseText('');
      })();
    }
  }, [isOpen]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplateId(e.target.value);
    const tpl = templates.find(t => t.id === e.target.value);
    if (tpl) setResponseText(tpl.content);
  };

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
            <label htmlFor="template-select" className="text-sm font-medium">
              Шаблон ответа
            </label>
            <select
              id="template-select"
              className="w-full border rounded px-2 py-1"
              disabled={loadingTemplates || templates.length === 0}
              onChange={handleTemplateChange}
              value={selectedTemplateId}
            >
              <option value="" disabled>Выберите шаблон...</option>
              {templates.map(tpl => (
                <option key={tpl.id} value={tpl.id}>{tpl.title}</option>
              ))}
            </select>
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

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { useComplaintContext } from '@/context/ComplaintContext';
import { ComplaintCategory, FileAttachment } from '@/types';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  "facilities",
  "staff",
  "equipment",
  "cleanliness",
  "services",
  "safety",
  "other"
] as const;

type FormData = {
  category: ComplaintCategory;
  description: string;
};

const complaintSchema = z.object({
  category: z.enum(categories) as z.ZodType<ComplaintCategory>,
  description: z.string().min(10, {
    message: "Описание должно содержать не менее 10 символов.",
  }),
});

interface ComplaintFormProps {
  locationId?: string;
  locationName?: string;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ locationId: propLocationId, locationName: propLocationName }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addComplaint } = useComplaintContext();
  
  const locationName = propLocationName || searchParams.get('locationName') || 'Теннисный центр ЦСКА';
  const locationId = propLocationId || searchParams.get('locationId') || '';
  
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      category: "facilities",
      description: "",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newAttachments: FileAttachment[] = [];
    const files = Array.from(e.target.files);

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast.error(`Файл ${file.name} не является изображением или видео`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Файл ${file.name} превышает 10MB`);
        continue;
      }

      if (attachments.length + newAttachments.length >= 5) {
        toast.error('Максимальное количество файлов - 5');
        break;
      }

      const fileType = isImage ? 'image' : 'video';
      const fileUrl = URL.createObjectURL(file);
      
      newAttachments.push({
        id: Math.random().toString(36).substring(2, 9),
        type: fileType,
        url: fileUrl,
        name: file.name,
        size: file.size
      });
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Reset input value so the same file can be selected again if removed
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    
    try {
      await addComplaint({
        location: locationName,
        locationId: locationId,
        locationName: propLocationName || locationName,
        category: data.category,
        description: data.description,
        attachments,
        contact_email: '',
        contact_phone: ''
      });
      
      toast.success("Жалоба успешно отправлена");
      navigate('/success');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error("Произошла ошибка при отправке жалобы");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-2">Оставить жалобу</h2>
      <p className="text-gray-500 mb-6">Объект: {locationName}</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Категория жалобы</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию жалобы" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="facilities">Объекты и инфраструктура</SelectItem>
                    <SelectItem value="staff">Персонал</SelectItem>
                    <SelectItem value="equipment">Оборудование</SelectItem>
                    <SelectItem value="cleanliness">Чистота</SelectItem>
                    <SelectItem value="services">Услуги</SelectItem>
                    <SelectItem value="safety">Безопасность</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Укажите, к чему относится ваша жалоба
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Описание</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Опишите вашу жалобу подробно" 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Укажите все детали проблемы
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel htmlFor="attachments">Прикрепить фото/видео</FormLabel>
            <div className="flex items-center gap-2">
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                <Upload className="h-4 w-4" />
                <span>Загрузить файлы</span>
              </label>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500">
                До 5 файлов, максимум 10MB каждый
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="relative group">
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
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <p className="text-xs text-gray-500 truncate mt-1">{attachment.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            variant="cska"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Отправка..." : "Отправить жалобу"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ComplaintForm;

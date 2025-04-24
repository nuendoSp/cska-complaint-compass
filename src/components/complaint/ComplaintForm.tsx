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

const complaintSchema = z.object({
  category: z.enum(categories),
  description: z.string().min(10, {
    message: "Описание должно содержать не менее 10 символов.",
  }),
  contact_phone: z.string().regex(/^\d\(\d{3}\)\d{3} \d{2} \d{2}$/, {
    message: "Формат телефона: X (XXX) XXX XX XX"
  }).optional(),
  contact_email: z.string().email({
    message: "Введите корректный email"
  }).optional(),
});

type FormData = z.infer<typeof complaintSchema>;

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
      contact_phone: "",
      contact_email: "",
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
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || ''
      });
      
      toast.success("Обращение успешно отправлено");
      navigate('/success');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error("Произошла ошибка при отправке обращения");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-2">Оставить обращение</h2>
      <p className="text-gray-500 mb-6">Объект: {locationName}</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Категория обращения</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию обращения" />
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
                  Укажите, к чему относится ваше обращение
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
                    placeholder="Опишите ваше обращение подробно" 
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон (необязательно)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="X (XXX) XXX XX XX"
                      {...field}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 0) {
                          value = value.match(new RegExp('.{1,1}|.{1,3}|.{1,3}|.{1,2}|.{1,2}', 'g'))?.join('') || '';
                          value = value.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1($2)$3 $4 $5');
                        }
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Контактный телефон для обратной связи
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (необязательно)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@mail.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email для обратной связи
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Отправка...
                </>
              ) : (
                'Отправить обращение'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ComplaintForm;

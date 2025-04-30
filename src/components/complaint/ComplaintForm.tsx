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
import InputMask from 'react-input-mask';
import { Rating } from '@/components/ui/rating';
import { supabase } from '@/lib/supabase';

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
  title: z.string().min(3, { message: 'Укажите тему обращения (минимум 3 символа)' }),
  category: z.enum(categories),
  description: z.string().min(10, {
    message: "Описание должно содержать не менее 10 символов.",
  }),
  contact_phone: z
    .string()
    .regex(/^(\+7\(\d{3}\)\d{3}-\d{2}-\d{2})?$/, { message: "Формат телефона: +7(XXX) XXX-XX-XX" })
    .or(z.literal(''))
    .optional(),
  contact_email: z.string().email({
    message: "Введите корректный email"
  }).optional().or(z.literal('')),
  rating: z.number().min(1).max(5).optional(),
});

type FormData = z.infer<typeof complaintSchema>;

interface ComplaintFormProps {
  locationId?: string;
  locationName?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
      title: '',
      category: "facilities",
      description: "",
      contact_phone: "",
      contact_email: "",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const newAttachments: FileAttachment[] = [];

    for (const file of Array.from(e.target.files)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Файл ${file.name} слишком большой. Максимальный размер: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        continue;
      }

      // Проверяем MIME-тип файла
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`Файл ${file.name} имеет неподдерживаемый формат. Разрешены только изображения и видео.`);
        continue;
      }

      const url = URL.createObjectURL(file);
      newAttachments.push({
        id: Math.random().toString(36).substring(2, 9),
        url,
        name: file.name,
        type: file.type,
        size: file.size,
        file: file
      });
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = ''; // Сбрасываем input для возможности повторной загрузки того же файла
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.url) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Загружаем файлы в Supabase Storage
      const uploadedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          try {
            console.log('Starting file upload for:', attachment.name);
            
            const file = attachment.file;
            if (!file) {
              console.error('No file available for attachment:', attachment);
              return null;
            }

            // Создаем безопасное имя файла
            const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${safeFileName}`;
            console.log('Generated filename:', fileName);

            // Загружаем файл в Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('complaint_files')
              .upload(fileName, file, {
                cacheControl: '3600',
                contentType: file.type,
                upsert: false
              });

            if (uploadError) {
              console.error('Error uploading file:', uploadError);
              toast.error(`Ошибка при загрузке файла ${attachment.name}`);
              return null;
            }

            // Получаем публичный URL для загруженного файла
            const { data: { publicUrl } } = supabase.storage
              .from('complaint_files')
              .getPublicUrl(fileName);

            console.log('File uploaded successfully:', uploadData);
            console.log('Public URL:', publicUrl);

            return {
              id: Math.random().toString(36).substring(2, 9),
              name: file.name,
              url: publicUrl,
              type: file.type,
              size: file.size
            };
          } catch (error) {
            console.error('Error processing attachment:', error);
            toast.error(`Ошибка при загрузке файла ${attachment.name}`);
            return null;
          }
        })
      );

      // Фильтруем неудачные загрузки
      const validAttachments = uploadedAttachments.filter((attachment): attachment is FileAttachment => attachment !== null);
      console.log('Valid attachments:', validAttachments);

      const complaintData = {
        title: data.title,
        description: data.description,
        category: data.category as ComplaintCategory,
        location: 'ТЦ "ЦСКА"',
        location_id: 'cska_default',
        locationname: 'ТЦ "ЦСКА"',
        user_id: 'anonymous',
        contact_phone: data.contact_phone || undefined,
        contact_email: data.contact_email || undefined,
        rating: data.rating,
        attachments: validAttachments.map(a => ({
          id: a.id,
          name: a.name,
          url: a.url,
          type: a.type,
          size: a.size
        }))
      };

      console.log('Sending complaint data:', complaintData);

      await addComplaint(complaintData);
      
      toast.success("Обращение успешно отправлено");
      navigate('/success');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Произошла ошибка при отправке обращения');
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тема обращения</FormLabel>
                <FormControl>
                  <Input placeholder="Кратко опишите суть обращения" {...field} />
                </FormControl>
                <FormDescription>
                  Например: "Плохое освещение на корте"
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <InputMask
                      mask="+7(999)999-99-99"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      {(inputProps) => (
                        <Input
                          {...inputProps}
                          placeholder="+7(XXX) XXX-XX-XX"
                        />
                      )}
                    </InputMask>
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

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Оценка</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Rating
                      value={field.value || 0}
                      onChange={field.onChange}
                      size="lg"
                    />
                    <p className="text-sm text-gray-500">
                      {field.value === 0 && "Поставьте оценку от 1 до 5 звезд"}
                      {field.value === 1 && "Очень плохо"}
                      {field.value === 2 && "Плохо"}
                      {field.value === 3 && "Нормально"}
                      {field.value === 4 && "Хорошо"}
                      {field.value === 5 && "Отлично"}
                    </p>
                  </div>
                </FormControl>
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
                До 5 файлов, максимум 5MB каждый
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="relative group">
                    {attachment.type.startsWith('image/') ? (
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
                      title="Удалить вложение"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Удалить вложение</span>
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


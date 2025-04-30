import React, { useState } from 'react';
import InputMask from 'react-input-mask';
import { useComplaintContext } from '@/context/ComplaintContext';
import { Rating } from '@/components/ui/rating';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComplaintCategory, Complaint } from '../types';

interface ComplaintFormData {
  title: string;
  description: string;
  category: ComplaintCategory;
  contact_phone: string;
  email: string;
  location: string;
}

export default function ComplaintForm() {
  const { addComplaint } = useComplaintContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('services');
  const [contact_phone, setContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description) {
      alert('Пожалуйста, заполните описание обращения');
      return;
    }

    try {
      const complaintData: ComplaintFormData = {
        title,
        description,
        category,
        contact_phone,
        email,
        location: 'ТЦ "ЦСКА"'
      };

      await addComplaint(complaintData);
      
      // Очистка формы
      setTitle('');
      setDescription('');
      setCategory('other');
      setContactPhone('');
      setEmail('');
      setRating(0);
    } catch (error) {
      console.error('Error submitting complaint:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Тема обращения
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Введите тему обращения"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Категория
        </label>
        <Select value={category} onValueChange={(value: ComplaintCategory) => setCategory(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
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
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Описание <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опишите вашу проблему"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Телефон
        </label>
        <InputMask
          mask="+7 (999) 999-99-99"
          value={contact_phone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="+7 (___) ___-__-__"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Оценка
        </label>
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
          <Rating
            value={rating}
            onChange={setRating}
            size="lg"
            className="mb-2"
          />
          <p className="text-sm text-gray-500">
            {rating === 0 && "Поставьте оценку от 1 до 5 звезд"}
            {rating === 1 && "Очень плохо"}
            {rating === 2 && "Плохо"}
            {rating === 3 && "Нормально"}
            {rating === 4 && "Хорошо"}
            {rating === 5 && "Отлично"}
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Отправить
      </Button>
    </form>
  );
} 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Временные учетные данные для тестирования
    if (email === 'admin@cska.ru' && password === 'admin123') {
      try {
        localStorage.setItem('isAdmin', 'true');
        toast.success('Вход выполнен успешно');
        console.log('Авторизация успешна, перенаправляем на /admin');
        navigate('/admin');
      } catch (error) {
        console.error('Ошибка при сохранении в localStorage:', error);
        toast.error('Ошибка при входе в систему');
      }
    } else {
      console.log('Неверные учетные данные:', { email, password });
      toast.error('Неверный email или пароль');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Вход для администратора</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-cska-blue hover:bg-blue-700">
              Войти
            </Button>
          </form>

          <div className="mt-4 text-sm text-gray-500">
            <p>Тестовые данные для входа:</p>
            <p>Email: admin@cska.ru</p>
            <p>Пароль: admin123</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminLoginPage; 
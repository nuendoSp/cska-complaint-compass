import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    
    // Проверка учетных данных администратора
    if (email === 'cska.tennis.alm@gmail.com' && password === 'admin_Cska') {
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
              <div className="text-right">
                <Link
                  to="/admin/reset-password"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Забыли пароль?
                </Link>
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-cska-blue hover:bg-blue-700">
              Войти
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminLoginPage; 
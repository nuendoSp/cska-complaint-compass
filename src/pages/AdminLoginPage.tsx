import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const AdminLoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Временные учетные данные для теста
    if (login === 'admin' && password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
      toast({
        title: "Успешный вход",
        description: "Вы успешно вошли в систему как администратор",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: "Неверный логин или пароль",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Вход для администратора</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Введите логин"
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
        </Card>
      </div>
    </Layout>
  );
};

export default AdminLoginPage; 
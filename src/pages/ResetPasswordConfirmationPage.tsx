import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const ResetPasswordConfirmationPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast.success('Пароль успешно изменен');
      navigate('/admin/login');
    } catch (error) {
      console.error('Ошибка при изменении пароля:', error);
      toast.error('Ошибка при изменении пароля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Создание нового пароля</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Введите новый пароль"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Подтвердите пароль</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Подтвердите новый пароль"
                required
                minLength={8}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-cska-blue hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPasswordConfirmationPage; 
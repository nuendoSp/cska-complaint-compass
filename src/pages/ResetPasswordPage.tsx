import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password-confirmation`,
      });

      if (error) {
        throw error;
      }

      toast.success('Инструкции по восстановлению пароля отправлены на вашу почту');
      navigate('/admin/login');
    } catch (error) {
      console.error('Ошибка при отправке письма для восстановления:', error);
      toast.error('Ошибка при отправке письма для восстановления пароля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Восстановление пароля</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email администратора"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-cska-blue hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Отправка...' : 'Отправить инструкции'}
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => navigate('/admin/login')}
            >
              Вернуться к входу
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage; 
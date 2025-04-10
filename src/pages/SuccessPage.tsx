import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home } from 'lucide-react';

const SuccessPage = () => {
  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-cska-green" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Жалоба успешно отправлена!</h1>
          
          <p className="text-gray-600 mb-8">
            Спасибо за ваш отзыв. Администрация теннисного центра ЦСКА рассмотрит вашу жалобу в ближайшее время.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button variant="default" className="w-full flex items-center gap-2 justify-center bg-cska-blue hover:bg-blue-700">
                <Home className="h-4 w-4" />
                Вернуться на главную
              </Button>
            </Link>
            <Link to="/locations">
              <Button variant="outline" className="w-full">
                Подать еще одну жалобу
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default SuccessPage;

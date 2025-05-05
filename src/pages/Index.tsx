import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const Index = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center pb-12">
        <div className="text-center mb-12 mt-8">
          <h1 className="text-3xl font-bold mb-4">Книга отзывов и предложений</h1>
          <p className="text-lg text-gray-600 mb-8">
            Помогите нам улучшить качество обслуживания.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 w-full max-w-4xl">
          <Link to="/locations" className="w-full">
            <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="bg-cska-blue/10 p-4 rounded-full mb-4">
                <FileText className="h-10 w-10 text-cska-blue" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Список объектов</h2>
              <p className="text-gray-500 flex-grow">
                Выберите объект из списка, чтобы создать обращение
              </p>
              <Button variant="outline" className="mt-4 border-cska-blue text-cska-blue hover:bg-cska-blue hover:text-white w-full">
                Посмотреть список
              </Button>
            </div>
          </Link>
        </div>
        
        <div className="mt-12 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold mb-4">О Книге отзывов и предложений</h2>
          <p className="text-gray-600 mb-4">
            Мы стремимся обеспечить высочайший уровень качества обслуживания.
            Ваши отзывы помогают нам становиться лучше.
          </p>
          <p className="text-gray-600">
            С помощью нашей системы обработки вы можете легко сообщить о любых проблемах,
            с которыми вы столкнулись. Мы гарантируем, что каждая жалоба будет рассмотрена нашими
            специалистами в кратчайшие сроки.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Index;

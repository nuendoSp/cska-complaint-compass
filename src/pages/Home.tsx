import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cska-blue to-cska-blue-light">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-cska-blue mb-4">
            Complaint Compass
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Система для работы с обращениями граждан
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-cska-blue mb-2">
                Создать обращение
              </h2>
              <p className="text-gray-600 mb-4">
                Оставьте своё обращение или жалобу
              </p>
              <button className="bg-cska-blue text-white px-6 py-2 rounded-lg hover:bg-cska-blue-light transition-colors">
                Создать
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-cska-blue mb-2">
                Мои обращения
              </h2>
              <p className="text-gray-600 mb-4">
                Просмотр статуса ваших обращений
              </p>
              <button className="bg-cska-blue text-white px-6 py-2 rounded-lg hover:bg-cska-blue-light transition-colors">
                Просмотреть
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 
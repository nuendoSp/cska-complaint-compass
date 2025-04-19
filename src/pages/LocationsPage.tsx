import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

// Updated locations with outdoor clay courts, indoor hard courts, added toilets and staff
const locations = [
  { id: 'outdoor-clay-courts', name: 'Корты на улице - Грунт', description: 'Теннисные корты с грунтовым покрытием' },
  { id: 'indoor-hard-courts', name: 'Корты в зале - Хард', description: 'Теннисные корты с твердым покрытием' },
  { id: 'locker-rooms', name: 'Раздевалки', description: 'Мужские и женские раздевалки' },
  { id: 'cafe', name: 'Кафе', description: 'Зона питания' },
  { id: 'reception', name: 'Ресепшен', description: 'Зона администрации' },
  { id: 'parking', name: 'Парковка', description: 'Парковочная зона' },
  { id: 'toilets', name: 'Туалеты', description: 'Общественные туалеты' },
  { id: 'staff', name: 'Персонал', description: 'Сотрудники клуба' },
];

const LocationsPage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center mt-8">Выберите объект</h1>
        <p className="text-gray-600 text-center mb-8">Выберите объект, чтобы создать обращение</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((location) => (
            <Link
              key={location.id}
              to={`/complaint?locationId=${location.id}&locationName=${encodeURIComponent(location.name)}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cska-blue" />
                    {location.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-sm">{location.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default LocationsPage;

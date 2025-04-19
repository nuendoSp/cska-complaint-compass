import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ComplaintForm from '@/components/complaint/ComplaintForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ComplaintPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('locationId') || '';
  const locationName = searchParams.get('locationName') || 'Теннисный центр ЦСКА';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pt-8 pb-12">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold">Создать обращение</h1>
        </div>
        
        <Card className="p-0 overflow-hidden">
          <ComplaintForm locationId={locationId} locationName={locationName} />
        </Card>
      </div>
    </Layout>
  );
};

export default ComplaintPage;

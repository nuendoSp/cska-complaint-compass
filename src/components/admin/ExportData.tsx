import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { FileText, FileSpreadsheet, Download, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Complaint } from '@/types';

interface ExportDataProps {
  complaints: Complaint[];
}

const ExportData: React.FC<ExportDataProps> = ({ complaints }) => {
  const handleExportCsv = () => {
    // Prepare CSV content
    const headers = ["ID", "Локация", "Категория", "Описание", "Статус", "Дата подачи", "Ответ"];
    
    const csvContent = complaints.map(complaint => {
      return [
        complaint.id,
        complaint.locationName,
        complaint.category,
        `"${complaint.description.replace(/"/g, '""')}"`, // Escape quotes
        complaint.status,
        format(complaint.submittedAt, 'dd.MM.yyyy HH:mm'),
        complaint.response ? `"${complaint.response.text.replace(/"/g, '""')}"` : ""
      ].join(',');
    });
    
    const csv = [headers.join(','), ...csvContent].join('\n');
    
    // Create a download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `complaints_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Экспорт CSV успешно выполнен');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Экспорт данных</CardTitle>
        <CardDescription>
          Экспортируйте данные обращений для отчетности
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 flex flex-col items-center">
            <FileText className="h-12 w-12 mb-4 text-cska-blue" />
            <h3 className="font-medium mb-1">PDF Отчет</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Подробный отчет в формате PDF для печати
            </p>
            <Button className="mt-auto w-full" variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Скачать PDF
            </Button>
          </Card>
          
          <Card className="p-4 flex flex-col items-center">
            <FileSpreadsheet className="h-12 w-12 mb-4 text-green-600" />
            <h3 className="font-medium mb-1">Excel Отчет</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Таблица данных для анализа в Excel
            </p>
            <Button className="mt-auto w-full" variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Скачать Excel
            </Button>
          </Card>
          
          <Card className="p-4 flex flex-col items-center">
            <Download className="h-12 w-12 mb-4 text-blue-500" />
            <h3 className="font-medium mb-1">CSV Файл</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Данные в формате CSV для импорта в другие системы
            </p>
            <Button 
              className="mt-auto w-full" 
              variant="outline"
              onClick={handleExportCsv}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Скачать CSV
            </Button>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportData;

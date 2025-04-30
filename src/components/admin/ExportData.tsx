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
import { utils, writeFile } from 'xlsx';

interface ExportDataProps {
  complaints: Complaint[];
}

const statusRu: Record<string, string> = {
  new: 'Новая',
  processing: 'В обработке',
  resolved: 'Решено',
  rejected: 'Отклонено',
  in_progress: 'В процессе',
  closed: 'Закрыта',
};

const categoryRu: Record<string, string> = {
  facilities: 'Объекты и инфраструктура',
  staff: 'Персонал',
  equipment: 'Оборудование',
  cleanliness: 'Чистота',
  services: 'Услуги',
  safety: 'Безопасность',
  other: 'Другое',
};

const ExportData: React.FC<ExportDataProps> = ({ complaints }) => {
  const handleExportPdf = async () => {
    try {
      // Динамически импортируем pdfmake только когда нужно
      const pdfMake = (await import('pdfmake/build/pdfmake')).default;
      const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
      pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

      // Подготавливаем данные для таблицы
      const tableBody = complaints.map(complaint => [
        complaint.id,
        complaint.title || 'Без темы',
        complaint.locationname || complaint.location,
        categoryRu[complaint.category] || complaint.category,
        statusRu[complaint.status] || complaint.status,
        format(new Date(complaint.submittedat), 'dd.MM.yyyy HH:mm'),
        (complaint.response?.text || '').substring(0, 50) + (complaint.response?.text?.length > 50 ? '...' : '')
      ]);

      // Определяем документ
      const docDefinition = {
        pageOrientation: 'landscape' as const,
        pageMargins: [15, 30, 15, 30],
        header: {
          text: 'Отчет по обращениям',
          alignment: 'center',
          margin: [0, 10],
          fontSize: 16,
          bold: true
        },
        footer: function(currentPage: number, pageCount: number) {
          return {
            text: `Страница ${currentPage} из ${pageCount}`,
            alignment: 'right',
            margin: [0, 0, 15, 0]
          };
        },
        content: [
          {
            text: `Дата формирования: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`,
            margin: [0, 0, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: [40, 80, 70, 70, 50, 60, '*'],
              body: [
                [
                  { text: 'ID', style: 'tableHeader' },
                  { text: 'Тема', style: 'tableHeader' },
                  { text: 'Локация', style: 'tableHeader' },
                  { text: 'Категория', style: 'tableHeader' },
                  { text: 'Статус', style: 'tableHeader' },
                  { text: 'Дата', style: 'tableHeader' },
                  { text: 'Ответ', style: 'tableHeader' }
                ],
                ...tableBody
              ]
            }
          }
        ],
        defaultStyle: {
          font: 'Roboto'
        },
        styles: {
          tableHeader: {
            bold: true,
            fontSize: 10,
            color: 'white',
            fillColor: '#2980b9',
            alignment: 'center'
          }
        }
      };

      // Генерируем PDF
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.download(`complaints_export_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast.success('Экспорт PDF успешно выполнен');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Ошибка при экспорте в PDF');
    }
  };

  const handleExportExcel = () => {
    try {
      const data = complaints.map(complaint => ({
        'ID': complaint.id,
        'Тема': complaint.title || '',
        'Локация': complaint.locationname || complaint.location,
        'Категория': categoryRu[complaint.category] || complaint.category,
        'Описание': complaint.description,
        'Статус': statusRu[complaint.status] || complaint.status,
        'Дата подачи': format(new Date(complaint.submittedat), 'dd.MM.yyyy HH:mm'),
        'Ответ': complaint.response?.text || '',
        'Email': complaint.contact_email || '',
        'Телефон': complaint.contact_phone || ''
      }));

      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Обращения');
      
      // Генерируем Excel файл
      writeFile(wb, `complaints_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
      toast.success('Экспорт Excel успешно выполнен');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Ошибка при экспорте в Excel');
    }
  };

  const handleExportCsv = () => {
    try {
      // Prepare CSV content
      const headers = ["ID", "Тема", "Локация", "Категория", "Описание", "Статус", "Дата подачи", "Ответ", "Email", "Телефон"];
      
      const csvContent = complaints.map(complaint => {
        const fields = [
          complaint.id,
          complaint.title || 'Без темы',
          complaint.locationname || complaint.location,
          categoryRu[complaint.category] || complaint.category,
          complaint.description,
          statusRu[complaint.status] || complaint.status,
          format(new Date(complaint.submittedat), 'dd.MM.yyyy HH:mm'),
          complaint.response?.text || '',
          complaint.contact_email || '',
          complaint.contact_phone || ''
        ];
        
        // Экранируем специальные символы и добавляем кавычки для текстовых полей
        return fields.map(field => {
          if (typeof field === 'string') {
            // Заменяем кавычки на двойные кавычки и оборачиваем в кавычки
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        }).join(',');
      });
      
      // Добавляем BOM для корректного отображения кириллицы в Excel
      const BOM = '\uFEFF';
      const csv = BOM + [headers.join(','), ...csvContent].join('\n');
      
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
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Ошибка при экспорте в CSV');
    }
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
            <Button 
              className="mt-auto w-full" 
              variant="outline"
              onClick={handleExportPdf}
            >
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
            <Button 
              className="mt-auto w-full" 
              variant="outline"
              onClick={handleExportExcel}
            >
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

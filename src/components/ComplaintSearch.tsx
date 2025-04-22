import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Complaint {
  id: number;
  title: string;
  description: string;
  status: string;
  category: string;
  created_at: string;
}

export default function ComplaintSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints', searchTerm, selectedStatus, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('complaints')
        .select('*');

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Complaint[];
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск обращений..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex items-center gap-2 text-gray-600 md:hidden"
        >
          Фильтры
          <ChevronDown className={`transform transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className={`flex flex-col md:flex-row gap-4 ${isFiltersOpen ? 'block' : 'hidden md:flex'}`}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все статусы</option>
            <option value="new">Новое</option>
            <option value="in_progress">В работе</option>
            <option value="resolved">Решено</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все категории</option>
            <option value="maintenance">Обслуживание</option>
            <option value="repair">Ремонт</option>
            <option value="cleaning">Уборка</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : complaints?.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">Обращения не найдены</p>
      ) : (
        <div className="grid gap-4 mt-8">
          {complaints?.map((complaint) => (
            <div
              key={complaint.id}
              className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold">{complaint.title}</h3>
              <p className="text-gray-600 mt-2">{complaint.description}</p>
              <div className="flex gap-2 mt-4">
                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                  {complaint.status}
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
                  {complaint.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Complaint } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Star } from 'lucide-react';

interface Feedback {
  id: string;
  complaint_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const FeedbackSystem = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [complaints, setComplaints] = useState<Record<string, Complaint>>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feedbacksData, complaintsData] = await Promise.all([
        supabase.from('feedbacks').select('*').order('created_at', { ascending: false }),
        supabase.from('complaints').select('*')
      ]);

      if (feedbacksData.error) throw feedbacksData.error;
      if (complaintsData.error) throw complaintsData.error;

      setFeedbacks(feedbacksData.data || []);
      const complaintsMap = (complaintsData.data || []).reduce((acc, complaint) => {
        acc[complaint.id] = complaint;
        return acc;
      }, {} as Record<string, Complaint>);
      setComplaints(complaintsMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert([{
          complaint_id: selectedComplaint.id,
          rating: formData.rating,
          comment: formData.comment
        }]);

      if (error) throw error;
      await fetchData();
      setIsDialogOpen(false);
      setFormData({ rating: 0, comment: '' });
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Обратная связь</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Добавить отзыв</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый отзыв</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label>Оценка</label>
                <div className="flex gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: i + 1 })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          i < formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="comment">Комментарий</label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <Button type="submit">Сохранить</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Обращение</TableHead>
            <TableHead>Оценка</TableHead>
            <TableHead>Комментарий</TableHead>
            <TableHead>Дата</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbacks.map((feedback) => (
            <TableRow key={feedback.id}>
              <TableCell>
                {complaints[feedback.complaint_id]?.description || 'Неизвестно'}
              </TableCell>
              <TableCell>
                <div className="flex">
                  {renderStars(feedback.rating)}
                </div>
              </TableCell>
              <TableCell>{feedback.comment}</TableCell>
              <TableCell>
                {new Date(feedback.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 
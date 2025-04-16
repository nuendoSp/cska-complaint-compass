import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ComplaintProvider } from "@/context/ComplaintContext";
import { ContentProvider } from "@/context/ContentContext";
import { createTables } from "@/lib/supabase";
import { useEffect } from "react";
import Index from "./pages/Index";
import ComplaintPage from "./pages/ComplaintPage";
import LocationsPage from "./pages/LocationsPage";
import SuccessPage from "./pages/SuccessPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResetPasswordConfirmationPage from "./pages/ResetPasswordConfirmationPage";
import NotFound from "./pages/NotFound";
import ComplaintsListPage from "./pages/ComplaintsListPage";
import ComplaintDetailPage from "./pages/ComplaintDetailPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { toast } from 'sonner';

const queryClient = new QueryClient();

const AppContent = () => {
  useEffect(() => {
    const initDb = async () => {
      try {
        await createTables();
      } catch (error) {
        console.error('Ошибка при инициализации базы данных:', error);
      }
    };
    initDb();
  }, []);

  return (
    <ComplaintProvider>
      <ContentProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/complaint" element={<ComplaintPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
            <Route path="/reset-password-confirmation" element={<ResetPasswordConfirmationPage />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/complaints" element={<ComplaintsListPage />} />
            <Route path="/complaints/:complaintId" element={<ComplaintDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </ContentProvider>
    </ComplaintProvider>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

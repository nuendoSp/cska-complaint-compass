import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import ComplaintsListPage from "./pages/ComplaintsListPage";
import ComplaintDetailPage from "./pages/ComplaintDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";

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
        <BrowserRouter basename="/cska-complaint-compass">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/complaint" element={<ComplaintPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/complaints" element={<ComplaintsListPage />} />
            <Route path="/complaints/:complaintId" element={<ComplaintDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ContentProvider>
    </ComplaintProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LoadingScreen } from '@/components/ui/loading-screen';
import AppRoutes from '@/routes';

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <AppRoutes />
        <Toaster position="top-right" />
      </Suspense>
    </Router>
  );
};

export default App;

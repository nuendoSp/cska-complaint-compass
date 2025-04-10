import React from 'react';
import Navbar from './Navbar';
import { ComplaintProvider } from '@/context/ComplaintContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ComplaintProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="bg-gray-100 py-4 mt-auto">
          <div className="container mx-auto px-4">
            <p>© {new Date().getFullYear()} ТЦ "ЦСКА"</p>
          </div>
        </footer>
      </div>
    </ComplaintProvider>
  );
};

export default Layout;

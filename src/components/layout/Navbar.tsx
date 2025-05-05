import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Navbar: React.FC = () => {
  return (
    <header className="bg-[#1a365d] text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-6">
            <span className="font-bold text-2xl"></span>
            <Link to="/" className="w-full">
              <span className="w-full text-right block text-red-500 font-semibold text-xl sm:text-2xl">АФ РОО "Федерация тенниса"</span>
            </Link>
          </Link>
          
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-lg hover:text-gray-200 transition-colors font-medium"
            >
              Главная
            </Link>
            <Link 
              to="/locations" 
              className="text-lg hover:text-gray-200 transition-colors font-medium"
            >
              Список объектов
            </Link>
            <Link 
              to="/complaints" 
              className="text-lg hover:text-gray-200 transition-colors font-medium"
            >
              Обращения
            </Link>
            <Link 
              to="/admin/login" 
              className="text-lg hover:text-gray-200 transition-colors font-medium"
            >
              Администратор
            </Link>
          </nav>

          {/* Mobile menu */}
          <div className="block md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-[#2a4a7f]">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    to="/" 
                    className="px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Главная
                  </Link>
                  <Link 
                    to="/locations" 
                    className="px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Список объектов
                  </Link>
                  <Link 
                    to="/complaints" 
                    className="px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Обращения
                  </Link>
                  <Link 
                    to="/admin/login" 
                    className="px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Администратор
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

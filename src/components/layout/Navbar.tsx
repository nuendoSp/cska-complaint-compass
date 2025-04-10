import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Navbar: React.FC = () => {
  return (
    <header className="bg-cska-blue text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">ЦСКА</span>
            <span className="text-cska-red font-bold">Книга жалоб</span>
          </Link>
          
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="px-4 py-2 hover:bg-accent rounded-md">
                  Главная
                </Link>
                <Link to="/complaints" className="px-4 py-2 hover:bg-accent rounded-md">
                  Жалобы и предложения
                </Link>
                <Link to="/admin/login" className="px-4 py-2 hover:bg-accent rounded-md">
                  Администратор
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-gray-200 transition">
              Главная
            </Link>
            <Link to="/complaints" className="hover:text-gray-200 transition">
              Жалобы и предложения
            </Link>
            <Link to="/admin/login" className="hover:text-gray-200 transition">
              Администратор
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

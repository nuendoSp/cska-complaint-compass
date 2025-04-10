
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from '@/components/layout/Layout';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-cska-blue">404</h1>
          <p className="text-xl text-gray-600 mb-8">Страница не найдена</p>
          <Link to="/">
            <Button className="bg-cska-blue hover:bg-blue-700">
              Вернуться на главную
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;

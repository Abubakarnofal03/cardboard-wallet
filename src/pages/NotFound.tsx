
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-factory-blue mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/" className="bg-cardboard hover:bg-cardboard-dark">
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;

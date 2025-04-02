
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Package, Users, BarChart3 } from "lucide-react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    {
      name: "Add Transaction",
      path: "/",
      icon: <Package className="h-5 w-5 mr-2" />,
    },
    {
      name: "Person List",
      path: "/persons",
      icon: <Users className="h-5 w-5 mr-2" />,
    },
    {
      name: "Factory Summary",
      path: "/factory",
      icon: <BarChart3 className="h-5 w-5 mr-2" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-factory-tan">
      <header className="sticky top-0 z-10 bg-factory-blue shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Package className="h-8 w-8 text-cardboard" />
            <span className="ml-2 text-xl font-bold text-white">
              Khata Tracker
            </span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col md:flex-row">
        <nav className="md:w-64 mb-6 md:mb-0 md:mr-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center px-4 py-2 rounded-md transition-colors",
                      location.pathname === item.path
                        ? "bg-cardboard text-white"
                        : "hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="flex-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            {children}
          </div>
        </main>
      </div>

      <footer className="mt-auto bg-gray-100 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Khata Tracker</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

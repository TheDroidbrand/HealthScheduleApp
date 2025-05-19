import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Heart, 
  Users, 
  CalendarCheck, 
  UserCog, 
  LayoutDashboard, 
  Clock, 
  LineChart, 
  Settings, 
  LogOut,
  User,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const isMobile = useMobile();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      // The router will handle the redirect to /auth
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const sidebarItemClass = (path: string) => {
    return cn(
      "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
      isActive(path) ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
    );
  };

  const patientLinks = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { path: "/patient/doctors", label: "Find Doctors", icon: <Users className="mr-3 h-5 w-5" /> },
    { path: "/patient/appointments", label: "My Appointments", icon: <CalendarCheck className="mr-3 h-5 w-5" /> },
    { path: "/patient/medical-records", label: "Medical Records", icon: <FileText className="mr-3 h-5 w-5" /> },
    { path: "/patient/profile", label: "Profile", icon: <UserCog className="mr-3 h-5 w-5" /> },
  ];

  const doctorLinks = [
    { path: "/doctor", label: "Doctor Dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { path: "/doctor/appointments", label: "Manage Appointments", icon: <CalendarCheck className="mr-3 h-5 w-5" /> },
    { path: "/doctor/schedule", label: "My Schedule", icon: <Clock className="mr-3 h-5 w-5" /> },
    { path: "/doctor/medical-records", label: "Medical Records", icon: <FileText className="mr-3 h-5 w-5" /> },
  ];

  const adminLinks = [
    { path: "/admin", label: "Admin Dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { path: "/admin/appointments", label: "Manage Appointments", icon: <CalendarCheck className="mr-3 h-5 w-5" /> },
    { path: "/admin/schedules", label: "Doctor Schedules", icon: <Clock className="mr-3 h-5 w-5" /> },
    { path: "/admin/analytics", label: "Analytics", icon: <LineChart className="mr-3 h-5 w-5" /> },
    { path: "/admin/settings", label: "Settings", icon: <Settings className="mr-3 h-5 w-5" /> },
  ];

  // Show overlay on mobile when sidebar is open
  return (
    <>
      {isMobile && open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
        />
      )}

      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform overflow-y-auto bg-white transition duration-300 lg:translate-x-0 lg:static lg:inset-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary-600" />
            <h1 className="text-xl font-semibold text-primary-800">HealthSchedule</h1>
          </div>
          {isMobile && (
            <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <nav className="mt-5 px-4 space-y-1">
          {user?.role === "admin" ? (
            <div className="space-y-1">
              {adminLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <div className={sidebarItemClass(link.path)} onClick={isMobile ? onClose : undefined}>
                    {link.icon}
                    {link.label}
                  </div>
                </Link>
              ))}
            </div>
          ) : user?.role === "doctor" ? (
            <div className="space-y-1">
              {doctorLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <div className={sidebarItemClass(link.path)} onClick={isMobile ? onClose : undefined}>
                    {link.icon}
                    {link.label}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {patientLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <div className={sidebarItemClass(link.path)} onClick={isMobile ? onClose : undefined}>
                    {link.icon}
                    {link.label}
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="space-y-1">
              {user?.role === "patient" && (
                <>
                  <Link href="/admin">
                    <div 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      onClick={isMobile ? onClose : undefined}
                    >
                      <User className="mr-3 h-5 w-5" />
                      Switch to Admin View
                    </div>
                  </Link>
                  <Link href="/doctor">
                    <div 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      onClick={isMobile ? onClose : undefined}
                    >
                      <User className="mr-3 h-5 w-5" />
                      Switch to Doctor View
                    </div>
                  </Link>
                </>
              )}
              
              {user?.role === "admin" && (
                <>
                  <Link href="/">
                    <div 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      onClick={isMobile ? onClose : undefined}
                    >
                      <User className="mr-3 h-5 w-5" />
                      Switch to Patient View
                    </div>
                  </Link>
                  <Link href="/doctor">
                    <div 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      onClick={isMobile ? onClose : undefined}
                    >
                      <User className="mr-3 h-5 w-5" />
                      Switch to Doctor View
                    </div>
                  </Link>
                </>
              )}
              
              {user?.role === "doctor" && (
                <>
                  <Link href="/">
                    <div 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      onClick={isMobile ? onClose : undefined}
                    >
                      <User className="mr-3 h-5 w-5" />
                      Switch to Patient View
                    </div>
                  </Link>
                  <Link href="/admin">
                    <div 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      onClick={isMobile ? onClose : undefined}
                    >
                      <User className="mr-3 h-5 w-5" />
                      Switch to Admin View
                    </div>
                  </Link>
                </>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
  Clock,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function DoctorSidebar() {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
    { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { name: 'Patients', href: '/doctor/patients', icon: Users },
    { name: 'Schedule', href: '/doctor/schedule', icon: Clock },
    { name: 'Medical Records', href: '/doctor/records', icon: FileText },
    { name: 'Messages', href: '/doctor/messages', icon: MessageSquare },
    { name: 'Settings', href: '/doctor/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r h-[calc(100vh-64px)]">
      <nav className="flex flex-col h-full">
        <div className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary-50 text-primary-700"
                )}
                onClick={() => setLocation(item.href)}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Button>
            );
          })}
        </div>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </nav>
    </div>
  );
} 
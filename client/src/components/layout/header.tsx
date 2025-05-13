import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
  onOpenSidebar: () => void;
}

export function Header({ title, onOpenSidebar }: HeaderProps) {
  const { user } = useAuth();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={onOpenSidebar} 
              className="text-gray-500 focus:outline-none lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-4 lg:ml-0">
              <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar className="h-8 w-8 border-2 border-primary-100">
              <AvatarImage src="" alt={user?.fullName || "User"} />
              <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}

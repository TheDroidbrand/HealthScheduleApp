import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
}

export function StatsCard({ title, value, description, icon, iconColor, iconBgColor }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-center">
      <div className={`rounded-full ${iconBgColor} p-3 mr-4`}>
        <div className={iconColor}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="font-semibold">{value}</p>
        <p className="text-sm text-gray-700">{description}</p>
      </div>
    </div>
  );
}

import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SpecialtyCardProps {
  title: string;
  icon: LucideIcon;
  specialty: string;
  count: number;
}

export function SpecialtyCard({ title, icon: Icon, specialty, count }: SpecialtyCardProps) {
  return (
    <Link href={`/doctors?specialty=${encodeURIComponent(specialty)}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{count}</div>
          <p className="text-xs text-muted-foreground">Doctors available</p>
        </CardContent>
      </Card>
    </Link>
  );
}

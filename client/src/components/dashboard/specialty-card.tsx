import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface SpecialtyCardProps {
  title: string;
  description: string;
  imageUrl: string;
}

export function SpecialtyCard({ title, description, imageUrl }: SpecialtyCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-32 w-full bg-gray-200">
        <img className="h-full w-full object-cover" src={imageUrl} alt={title} />
      </div>
      <div className="p-4">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
        <Button asChild className="mt-3 w-full">
          <Link href="/doctors">
            <a>Find Specialist</a>
          </Link>
        </Button>
      </div>
    </div>
  );
}

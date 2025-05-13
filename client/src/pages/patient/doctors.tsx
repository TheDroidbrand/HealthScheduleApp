import { MainLayout } from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import { Doctor } from "@shared/schema";
import { DoctorCard } from "@/components/doctors/doctor-card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Search } from "lucide-react";

const searchSchema = z.object({
  specialty: z.string().optional(),
  date: z.string().optional(),
  search: z.string().optional(),
});

type SearchValues = z.infer<typeof searchSchema>;

export default function PatientDoctors() {
  const [filters, setFilters] = useState<SearchValues>({});

  const form = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      specialty: "",
      date: "",
      search: "",
    },
  });

  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  const handleSearch = (values: SearchValues) => {
    setFilters(values);
  };

  // Apply filters to the doctor list
  const filteredDoctors = doctors?.filter((doctor) => {
    if (filters.specialty && doctor.specialty !== filters.specialty) {
      return false;
    }
    if (filters.search) {
      // In a real app, this would search by name which would be in the doctor object
      // For the mock, we'll assume all doctors match the search
      return true;
    }
    return true;
  });

  return (
    <MainLayout title="Find Doctors">
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All Specialties" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">All Specialties</SelectItem>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="dermatology">Dermatology</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="search"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Doctor name or keyword"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">Search</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          // Show loading state
          <div className="text-center py-10">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="mt-2 text-gray-500">Loading doctors...</p>
          </div>
        ) : filteredDoctors && filteredDoctors.length > 0 ? (
          // Show doctors
          filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))
        ) : (
          // Show empty state
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="inline-flex items-center justify-center bg-gray-100 rounded-full p-6 mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No doctors found</h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search criteria or check back later.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

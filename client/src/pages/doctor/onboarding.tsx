import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { userService } from "@/lib/firebase-service";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const specialties = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
  "Ophthalmology",
  "ENT",
  "Psychiatry",
  "Dentistry",
  "Other"
];

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Arabic",
  "Hindi",
  "Other"
];

const onboardingSchema = z.object({
  specialty: z.string().min(1, "Please select a specialty"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  education: z.string().min(10, "Please provide your education details"),
  languages: z.string().min(1, "Please select at least one language"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function DoctorOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      specialty: "",
      bio: "",
      education: "",
      languages: "",
    },
  });

  const updateDoctorMutation = useMutation({
    mutationFn: async (data: OnboardingFormValues) => {
      if (!user) throw new Error("User not found");
      
      const doctorData = {
        id: user.id,
        userId: user.id,
        email: user.email,
        specialty: data.specialty,
        bio: data.bio,
        education: data.education,
        languages: data.languages,
        avatarUrl: null,
        rating: null,
        reviewCount: null,
        updatedAt: new Date().toISOString()
      };

      await userService.createUser(user.id, doctorData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your profile has been updated successfully",
      });
      setLocation("/doctor");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: OnboardingFormValues) {
    updateDoctorMutation.mutate(data);
  }

  if (!user || user.role !== "doctor") {
    return (
      <MainLayout title="Access Denied">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2">This page is only accessible to doctors.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Complete Your Profile">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Complete Your Doctor Profile</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your specialty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your experience and expertise..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List your degrees, certifications, and training..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Languages</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select languages you speak" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={updateDoctorMutation.isPending}
              >
                {updateDoctorMutation.isPending ? "Saving..." : "Complete Profile"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </MainLayout>
  );
} 
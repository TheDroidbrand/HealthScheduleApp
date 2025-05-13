import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Building,
  Clock,
  CloudLightning,
  Mail,
  Save,
  Shield,
  Users,
} from "lucide-react";

const systemSettingsSchema = z.object({
  clinicName: z.string().min(2, "Clinic name must be at least 2 characters"),
  clinicAddress: z.string().min(5, "Address must be at least 5 characters"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  defaultAppointmentDuration: z.string(),
  operatingHoursStart: z.string(),
  operatingHoursEnd: z.string(),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  appointmentReminders: z.boolean(),
  schedulingUpdates: z.boolean(),
  marketingCommunications: z.boolean(),
});

const securitySettingsSchema = z.object({
  twoFactorAuth: z.boolean(),
  sessionTimeout: z.string(),
  passwordExpiryDays: z.string(),
});

type SystemSettingsValues = z.infer<typeof systemSettingsSchema>;
type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;
type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>;

export default function AdminSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("system");

  // System Settings Form
  const systemForm = useForm<SystemSettingsValues>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      clinicName: "HealthSchedule Medical Center",
      clinicAddress: "123 Healthcare Ave, Medical District",
      contactEmail: "contact@healthschedule.com",
      contactPhone: "555-123-4567",
      defaultAppointmentDuration: "30",
      operatingHoursStart: "09:00",
      operatingHoursEnd: "17:00",
    },
  });

  // Notification Settings Form
  const notificationForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
      appointmentReminders: true,
      schedulingUpdates: true,
      marketingCommunications: false,
    },
  });

  // Security Settings Form
  const securityForm = useForm<SecuritySettingsValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      twoFactorAuth: false,
      sessionTimeout: "30",
      passwordExpiryDays: "90",
    },
  });

  const onSystemSubmit = (data: SystemSettingsValues) => {
    console.log("System Settings:", data);
    toast({
      title: "System settings updated",
      description: "Your system settings have been saved successfully",
    });
  };

  const onNotificationSubmit = (data: NotificationSettingsValues) => {
    console.log("Notification Settings:", data);
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved",
    });
  };

  const onSecuritySubmit = (data: SecuritySettingsValues) => {
    console.log("Security Settings:", data);
    toast({
      title: "Security settings updated",
      description: "Your security settings have been updated successfully",
    });
  };

  return (
    <MainLayout title="Settings">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Manage your clinic's basic information and operating parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...systemForm}>
                <form onSubmit={systemForm.handleSubmit(onSystemSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={systemForm.control}
                      name="clinicName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinic Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={systemForm.control}
                      name="clinicAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinic Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={systemForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input className="pl-10" type="email" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={systemForm.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Scheduling Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="defaultAppointmentDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Appointment Duration (minutes)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="45">45 minutes</SelectItem>
                                <SelectItem value="60">60 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={systemForm.control}
                        name="operatingHoursStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Operating Hours Start</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pl-10" type="time" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={systemForm.control}
                        name="operatingHoursEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Operating Hours End</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pl-10" type="time" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how the system communicates with patients and staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Send appointment notifications via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="smsNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">SMS Notifications</FormLabel>
                            <FormDescription>
                              Send appointment notifications via text message
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="appointmentReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Appointment Reminders</FormLabel>
                            <FormDescription>
                              Send reminders before scheduled appointments
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="schedulingUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Scheduling Updates</FormLabel>
                            <FormDescription>
                              Send notifications for schedule changes
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="marketingCommunications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Marketing Communications</FormLabel>
                            <FormDescription>
                              Send promotional content and newsletters
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Bell className="mr-2 h-4 w-4" />
                      Save Notification Settings
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={securityForm.control}
                      name="twoFactorAuth"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                            <FormDescription>
                              Require a second form of authentication when logging in
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={securityForm.control}
                        name="sessionTimeout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Timeout (minutes)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timeout" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">60 minutes</SelectItem>
                                <SelectItem value="120">120 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Automatically log out inactive users after this period
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="passwordExpiryDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password Expiry (days)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select expiry period" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="60">60 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="180">180 days</SelectItem>
                                <SelectItem value="365">365 days</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Force password change after this number of days
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Shield className="mr-2 h-4 w-4" />
                      Save Security Settings
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium">System Users</h3>
                  <p className="text-sm text-muted-foreground">Manage user accounts and access levels</p>
                </div>
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </div>
              
              <div className="border rounded-lg">
                <div className="grid grid-cols-5 bg-muted px-4 py-3 text-sm font-medium">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>
                
                <div className="divide-y">
                  <div className="grid grid-cols-5 px-4 py-3 items-center">
                    <div>Admin User</div>
                    <div>admin@example.com</div>
                    <div>
                      <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Administrator
                      </span>
                    </div>
                    <div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 px-4 py-3 items-center">
                    <div>Dr. Sarah Johnson</div>
                    <div>sarah.j@example.com</div>
                    <div>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Doctor
                      </span>
                    </div>
                    <div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 px-4 py-3 items-center">
                    <div>Jane Smith</div>
                    <div>jane.smith@example.com</div>
                    <div>
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Staff
                      </span>
                    </div>
                    <div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 px-4 py-3 items-center">
                    <div>Michael Brown</div>
                    <div>michael.b@example.com</div>
                    <div>
                      <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Patient
                      </span>
                    </div>
                    <div>
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Inactive
                      </span>
                    </div>
                    <div className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                <Button variant="outline" size="sm">Previous</Button>
                <span className="mx-4 flex items-center">Page 1 of 1</span>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}

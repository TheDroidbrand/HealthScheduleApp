import { MainLayout } from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import { Bar, Line, Pie } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, PieChart, LineChart, CartesianGrid } from "recharts";

// Sample data for charts - in a real app this would come from API
const appointmentsByDepartment = [
  { name: 'Cardiology', appointments: 42, color: '#0ea5e9' },
  { name: 'Dermatology', appointments: 28, color: '#10b981' },
  { name: 'Neurology', appointments: 36, color: '#f59e0b' },
  { name: 'Orthopedics', appointments: 22, color: '#ef4444' },
  { name: 'Pediatrics', appointments: 30, color: '#8b5cf6' },
];

const waitTimeByDepartment = [
  { name: 'Cardiology', waitTime: 15 },
  { name: 'Dermatology', waitTime: 10 },
  { name: 'Neurology', waitTime: 18 },
  { name: 'Orthopedics', waitTime: 12 },
  { name: 'Pediatrics', waitTime: 8 },
];

const weeklyAppointments = [
  { name: 'Mon', appointments: 35 },
  { name: 'Tue', appointments: 42 },
  { name: 'Wed', appointments: 38 },
  { name: 'Thu', appointments: 40 },
  { name: 'Fri', appointments: 45 },
  { name: 'Sat', appointments: 20 },
  { name: 'Sun', appointments: 15 },
];

const patientSatisfaction = [
  { name: 'Very Satisfied', value: 65 },
  { name: 'Satisfied', value: 25 },
  { name: 'Neutral', value: 6 },
  { name: 'Dissatisfied', value: 3 },
  { name: 'Very Dissatisfied', value: 1 },
];

const patientSatisfactionColors = ['#10b981', '#34d399', '#f59e0b', '#fb923c', '#ef4444'];

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("week");

  return (
    <MainLayout title="Analytics">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">265</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 min</div>
            <p className="text-xs text-muted-foreground">-15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Doctor Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="appointments" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="wait-times">Wait Times</TabsTrigger>
            <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          </TabsList>
          
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointments by Department</CardTitle>
              <CardDescription>
                Distribution of appointments across different departments
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentsByDepartment}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="appointments" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Weekly Appointment Trends</CardTitle>
              <CardDescription>
                Number of appointments by day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyAppointments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="appointments" stroke="#0ea5e9" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wait-times">
          <Card>
            <CardHeader>
              <CardTitle>Average Wait Time by Department</CardTitle>
              <CardDescription>
                Average wait time in minutes across different departments
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waitTimeByDepartment}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="waitTime" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="satisfaction">
          <Card>
            <CardHeader>
              <CardTitle>Patient Satisfaction Ratings</CardTitle>
              <CardDescription>
                Overall patient satisfaction with healthcare services
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={patientSatisfaction}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {patientSatisfaction.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={patientSatisfactionColors[index % patientSatisfactionColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Optimization Metrics</CardTitle>
            <CardDescription>
              Key optimization metrics for the healthcare system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Doctor Utilization</span>
                  <span className="text-sm font-medium text-gray-500">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Wait Time Reduction</span>
                  <span className="text-sm font-medium text-gray-500">62%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Scheduling Efficiency</span>
                  <span className="text-sm font-medium text-gray-500">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Patient Satisfaction</span>
                  <span className="text-sm font-medium text-gray-500">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Scheduling Insights</CardTitle>
            <CardDescription>
              Smart scheduling insights to improve efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="rounded-full bg-amber-100 p-1 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Morning Slot Optimization</h4>
                  <p className="text-sm text-gray-600">Increasing morning slots for Cardiology by 20% can reduce afternoon wait times by up to 15 minutes.</p>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="rounded-full bg-amber-100 p-1 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Pediatrics Staffing</h4>
                  <p className="text-sm text-gray-600">Adding another pediatrician on Mondays would address high demand and reduce wait times by 35%.</p>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="rounded-full bg-amber-100 p-1 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Appointment Duration</h4>
                  <p className="text-sm text-gray-600">Adjusting routine checkup durations from 30 to 20 minutes could increase daily capacity by 33%.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

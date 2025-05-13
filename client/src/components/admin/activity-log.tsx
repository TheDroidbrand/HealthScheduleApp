import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Check, Clock, X } from "lucide-react";

export function ActivityLog() {
  return (
    <Card>
      <CardHeader className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Button variant="link" className="text-sm text-primary-600 hover:text-primary-700 font-medium p-0 h-auto">
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flow-root">
          <ul className="-mb-8">
            <li className="relative pb-8">
              <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm font-medium text-gray-900">New Patient Registration</div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      James Thompson registered as a new patient
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>20 minutes ago</span>
                  </div>
                </div>
              </div>
            </li>
            
            <li className="relative pb-8">
              <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Appointment Completed</div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Dr. Chen completed appointment with Michael Brown
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>45 minutes ago</span>
                  </div>
                </div>
              </div>
            </li>
            
            <li className="relative pb-8">
              <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center ring-8 ring-white">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Appointment Rescheduled</div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Emily Wilson rescheduled appointment with Dr. Johnson
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>1 hour ago</span>
                  </div>
                </div>
              </div>
            </li>
            
            <li className="relative">
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center ring-8 ring-white">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Appointment Cancelled</div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      William Davis cancelled appointment with Dr. Rodriguez
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>2 hours ago</span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

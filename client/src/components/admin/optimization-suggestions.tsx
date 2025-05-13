import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LightbulbIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function OptimizationSuggestions() {
  const { toast } = useToast();
  
  const handleApply = (suggestion: string) => {
    toast({
      title: "Optimization Applied",
      description: `The suggestion "${suggestion}" has been applied.`,
    });
  };

  const handleApplyAll = () => {
    toast({
      title: "All Optimizations Applied",
      description: "All optimization suggestions have been applied.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Optimization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Current Issues</h4>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">3 issues found</span>
          </div>
          <div className="space-y-3">
            <Alert className="flex items-start border-red-200 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div className="ml-3">
                <AlertTitle className="text-red-800 font-medium">High Wait Time in Cardiology</AlertTitle>
                <AlertDescription className="text-sm text-red-700 mt-1">
                  Average wait time for Dr. Johnson on Monday afternoons is 32 minutes, exceeding the target of 15 minutes.
                </AlertDescription>
                <div className="mt-3">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white hover:bg-gray-50 text-primary-700 border border-primary-200"
                    onClick={() => handleApply("Reduce cardiology wait times")}
                  >
                    Apply Optimization
                  </Button>
                </div>
              </div>
            </Alert>
            
            <Alert className="flex items-start border-amber-200 bg-amber-50">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div className="ml-3">
                <AlertTitle className="text-amber-800 font-medium">Underutilized Time Slots</AlertTitle>
                <AlertDescription className="text-sm text-amber-700 mt-1">
                  Dr. Chen has 4 unfilled appointment slots on Tuesday mornings, causing inefficient resource allocation.
                </AlertDescription>
                <div className="mt-3">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white hover:bg-gray-50 text-primary-700 border border-primary-200"
                    onClick={() => handleApply("Fill underutilized time slots")}
                  >
                    Apply Optimization
                  </Button>
                </div>
              </div>
            </Alert>
            
            <Alert className="flex items-start border-amber-200 bg-amber-50">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div className="ml-3">
                <AlertTitle className="text-amber-800 font-medium">Scheduling Conflict</AlertTitle>
                <AlertDescription className="text-sm text-amber-700 mt-1">
                  Dr. Rodriguez has overlapping schedules with specialty rounds on Thursday afternoon from 2-3 PM.
                </AlertDescription>
                <div className="mt-3">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white hover:bg-gray-50 text-primary-700 border border-primary-200"
                    onClick={() => handleApply("Resolve scheduling conflict")}
                  >
                    Apply Optimization
                  </Button>
                </div>
              </div>
            </Alert>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Optimization Suggestions</h4>
            <Button 
              variant="link" 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium p-0 h-auto"
              onClick={handleApplyAll}
            >
              Apply All
            </Button>
          </div>
          <div className="space-y-3">
            <Alert className="flex items-start border bg-gray-50">
              <LightbulbIcon className="h-5 w-5 text-green-600" />
              <div className="ml-3">
                <AlertTitle className="text-gray-800 font-medium">Adjust Appointment Durations</AlertTitle>
                <AlertDescription className="text-sm text-gray-600 mt-1">
                  Reduce routine follow-up appointments from 30 to 20 minutes for Dr. Johnson to accommodate more patients.
                </AlertDescription>
                <div className="mt-3 flex space-x-2">
                  <Button 
                    onClick={() => handleApply("Adjust appointment durations")}
                    size="sm"
                  >
                    Apply
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </Alert>
            
            <Alert className="flex items-start border bg-gray-50">
              <LightbulbIcon className="h-5 w-5 text-green-600" />
              <div className="ml-3">
                <AlertTitle className="text-gray-800 font-medium">Redistribute Load</AlertTitle>
                <AlertDescription className="text-sm text-gray-600 mt-1">
                  Move 30% of Dr. Chen's Tuesday appointments to Wednesday to balance patient load and reduce wait times.
                </AlertDescription>
                <div className="mt-3 flex space-x-2">
                  <Button 
                    onClick={() => handleApply("Redistribute patient load")}
                    size="sm"
                  >
                    Apply
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </Alert>
            
            <Alert className="flex items-start border bg-gray-50">
              <LightbulbIcon className="h-5 w-5 text-green-600" />
              <div className="ml-3">
                <AlertTitle className="text-gray-800 font-medium">Add Flex Time</AlertTitle>
                <AlertDescription className="text-sm text-gray-600 mt-1">
                  Incorporate 15-minute buffer periods for Dr. Rodriguez at 11:45 AM and 3:45 PM to handle emergency cases.
                </AlertDescription>
                <div className="mt-3 flex space-x-2">
                  <Button 
                    onClick={() => handleApply("Add flex time buffer periods")}
                    size="sm"
                  >
                    Apply
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </Alert>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

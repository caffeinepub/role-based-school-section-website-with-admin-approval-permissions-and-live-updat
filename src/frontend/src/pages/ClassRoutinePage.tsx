import { useGetRoutines } from '../hooks/useQueries';
import { useGetSectionLock } from '../hooks/useLocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import LockIndicator from '../components/LockIndicator';

export default function ClassRoutinePage() {
  const { data: routines = [], isLoading } = useGetRoutines();
  const { data: sectionLocked = false } = useGetSectionLock('routine');

  const latestRoutine = routines.length > 0 ? routines[routines.length - 1] : null;

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Class Routine</h1>
          <p className="text-gray-600">Weekly class schedule for Class 8 (DOLON)</p>
        </div>
        <LockIndicator isLocked={sectionLocked} />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading routine...</div>
      ) : !latestRoutine ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No class routine available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {latestRoutine.routines.map((day) => (
            <Card key={day.dayName} className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-700">{day.dayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {day.periods.map((period) => (
                        <TableRow key={Number(period.periodNumber)}>
                          <TableCell className="font-medium">
                            Period {Number(period.periodNumber)}
                          </TableCell>
                          <TableCell>
                            {period.startTime} - {period.endTime}
                          </TableCell>
                          <TableCell className="font-medium text-purple-600">
                            {period.subject}
                          </TableCell>
                          <TableCell>{period.teacher}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

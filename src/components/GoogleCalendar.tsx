import { useState, useEffect } from 'react';
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isToday,
  getHours,
  getMinutes,
  parseISO,
  setHours,
  setMinutes,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from 'date-fns';
import { he } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoogleCalendarProps {
  therapistId: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'appointment' | 'availability';
  status?: string;
  patientName?: string;
}

const HOURS = Array.from({ length: 24 }).map((_, i) => i);
const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6]; // Sun to Sat

const GoogleCalendar = ({ therapistId }: GoogleCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = DAYS_OF_WEEK.map(day => addDays(weekStart, day));

  useEffect(() => {
    fetchEvents();
  }, [therapistId, currentDate]);

  const fetchEvents = async () => {
    if (!therapistId) return;
    setIsLoading(true);

    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      // 1. Fetch Appointments
      const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', therapistId)
        .gte('appointment_date', monthStart.toISOString().split('T')[0])
        .lte('appointment_date', monthEnd.toISOString().split('T')[0]);

      if (apptError) throw apptError;

      // 2. Fetch Availability (Recurring or specific)
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('therapist_schedules')
        .select('weekly_schedule')
        .eq('therapist_id', therapistId)
        .single();

      const calendarEvents: CalendarEvent[] = [];

      // Process Appointments
      appointments?.forEach(appt => {
        const start = `${appt.appointment_date}T${appt.appointment_time}`;
        // Assume 50 min session if not specified
        const startDate = parseISO(start);
        const endDate = new Date(startDate.getTime() + (appt.duration_minutes || 50) * 60000);

        calendarEvents.push({
          id: appt.id,
          title: appt.patient_first_name,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          type: 'appointment',
          status: appt.status || 'pending',
          patientName: appt.patient_first_name
        });
      });

      // Process Weekly Schedule (Availability)
      if (scheduleData?.weekly_schedule && Array.isArray(scheduleData.weekly_schedule)) {
        const schedule = scheduleData.weekly_schedule;

        // Project availability onto the current week
        weekDays.forEach((day, index) => {
          const daySchedule = schedule[index]; // Sunday is 0
          if (daySchedule?.active && Array.isArray(daySchedule.timeRanges)) {
            daySchedule.timeRanges.forEach((range: string) => {
              let startHour = 9, endHour = 17;
              if (range === 'morning') { startHour = 8; endHour = 12; }
              else if (range === 'afternoon') { startHour = 12; endHour = 16; }
              else if (range === 'evening') { startHour = 16; endHour = 20; }

              const startDate = setHours(setMinutes(day, 0), startHour);
              const endDate = setHours(setMinutes(day, 0), endHour);

              calendarEvents.push({
                id: `avail-${index}-${range}`,
                title: 'זמינות',
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                type: 'availability'
              });
            });
          }
        });
      }

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        variant: 'destructive',
        title: 'שגיאה בטעינת היומן',
        description: 'לא הצלחנו לטעון את הפגישות והזמינות שלך.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const getDayEvents = (day: Date) => events.filter(e => isSameDay(parseISO(e.start), day));

  const renderEvent = (event: CalendarEvent) => {
    const start = parseISO(event.start);
    const end = parseISO(event.end);
    const startHour = getHours(start);
    const startMin = getMinutes(start);
    const duration = (end.getTime() - start.getTime()) / 60000;

    const top = (startHour * 60 + startMin) * (60 / 60); // 60px per hour
    const height = duration * (60 / 60);

    const isAppt = event.type === 'appointment';

    return (
      <div
        key={event.id}
        className={cn(
          "absolute inset-x-1 rounded-sm p-1 text-[10px] leading-tight overflow-hidden border-r-2 animate-fade-in",
          isAppt
            ? "bg-blue-100 text-blue-700 border-blue-500 z-20"
            : "bg-emerald-50 text-emerald-600 border-emerald-400 z-10 opacity-60"
        )}
        style={{ top: `${top}px`, height: `${height}px` }}
      >
        <div className="font-bold truncate">{event.title}</div>
        <div className="truncate">{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background border rounded-xl shadow-sm overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">
              {format(currentDate, 'MMMM yyyy', { locale: he })}
            </h2>
          </div>
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToday} className="px-3 h-8">
              היום
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextWeek} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            זמינות
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            פגישות
          </Badge>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b bg-muted/30">
          <div className="border-l py-2"></div>
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={cn(
                "py-3 text-center border-l last:border-l-0 flex flex-col items-center",
                isToday(day) && "bg-primary/5"
              )}
            >
              <span className="text-xs uppercase font-medium text-muted-foreground">
                {format(day, 'EEEE', { locale: he })}
              </span>
              <span className={cn(
                "text-lg font-semibold mt-1 w-10 h-10 flex items-center justify-center rounded-full",
                isToday(day) ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground"
              )}>
                {format(day, 'd')}
              </span>
            </div>
          ))}
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] relative">
            {/* Hour Labels */}
            <div className="border-l bg-card sticky right-0 z-30">
              {HOURS.map(hour => (
                <div key={hour} className="h-[60px] pr-2 text-[10px] text-muted-foreground flex items-center justify-end -mt-3">
                  {hour > 0 && `${hour}:00`}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((day, i) => (
              <div key={i} className={cn("relative border-l last:border-l-0 group", isToday(day) && "bg-primary/[0.02]")}>
                {HOURS.map(hour => (
                  <div key={hour} className="h-[60px] border-b border-muted/30 group-hover:bg-muted/5 transition-colors"></div>
                ))}

                {/* Events for this day */}
                <div className="absolute inset-0 pointer-events-none">
                  {getDayEvents(day).map(renderEvent)}
                </div>
              </div>
            ))}
          </div>

          {/* Current Time Indicator */}
          {weekDays.some(d => isToday(d)) && (
            <div
              className="absolute left-0 right-[60px] border-t-2 border-primary z-40 pointer-events-none flex items-center"
              style={{ top: `${(getHours(new Date()) * 60 + getMinutes(new Date())) * (60 / 60)}px` }}
            >
              <div className="w-3 h-3 rounded-full bg-primary -mr-[6px]"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendar;

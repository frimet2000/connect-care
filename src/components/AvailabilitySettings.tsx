import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { WeeklySchedule, daysOfWeek, DaySchedule } from '@/data/therapists';
import { Sun, Sunset, Moon } from 'lucide-react';

interface AvailabilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: WeeklySchedule;
  onSave: (schedule: WeeklySchedule) => void;
}

const timeRanges = [
  { id: 'morning', label: 'בוקר (08:00-12:00)', icon: Sun },
  { id: 'afternoon', label: 'צהריים (12:00-16:00)', icon: Sunset },
  { id: 'evening', label: 'ערב (16:00-20:00)', icon: Moon },
] as const;

export const AvailabilitySettings = ({
  isOpen,
  onClose,
  schedule,
  onSave,
}: AvailabilitySettingsProps) => {
  const [localSchedule, setLocalSchedule] = useState<WeeklySchedule>(schedule);

  useEffect(() => {
    // Ensure timeRanges is initialized
    const normalizedSchedule = schedule.map(day => ({
      ...day,
      timeRanges: day.timeRanges || []
    }));
    setLocalSchedule(normalizedSchedule);
  }, [schedule, isOpen]);

  const handleDayToggle = (dayIndex: number) => {
    const newSchedule = [...localSchedule];
    newSchedule[dayIndex] = {
      ...newSchedule[dayIndex],
      active: !newSchedule[dayIndex].active,
    };
    setLocalSchedule(newSchedule);
  };

  const handleRangeToggle = (dayIndex: number, rangeId: 'morning' | 'afternoon' | 'evening') => {
    const newSchedule = [...localSchedule];
    const currentRanges = newSchedule[dayIndex].timeRanges || [];

    let newRanges;
    if (currentRanges.includes(rangeId)) {
      newRanges = currentRanges.filter(id => id !== rangeId);
    } else {
      newRanges = [...currentRanges, rangeId];
    }

    newSchedule[dayIndex] = {
      ...newSchedule[dayIndex],
      timeRanges: newRanges,
      active: true, // Auto-activate the day if a range is toggled
    };
    setLocalSchedule(newSchedule);
  };

  const handleUpdate = (
    dayIndex: number,
    field: keyof DaySchedule,
    value: any
  ) => {
    const newSchedule = [...localSchedule];
    newSchedule[dayIndex] = {
      ...newSchedule[dayIndex],
      [field]: value,
    };
    setLocalSchedule(newSchedule);
  };

  const handleSave = () => {
    onSave(localSchedule);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            ניהול שעות זמינות
          </DialogTitle>
          <DialogDescription>
            בחר את הימים וטווחי השעות בהם תרצה לקבל מטופלים.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4" dir="rtl">
          {localSchedule.map((day, index) => (
            <div
              key={day.day}
              className={`p-4 rounded-xl border transition-all ${day.active
                  ? 'border-primary bg-primary/5'
                  : 'border-border opacity-80 hover:opacity-100'
                }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Checkbox
                  checked={day.active}
                  onCheckedChange={() => handleDayToggle(index)}
                  id={`day-${day.day}`}
                />
                <Label
                  htmlFor={`day-${day.day}`}
                  className="text-lg font-medium cursor-pointer"
                >
                  {daysOfWeek.find((d) => d.id === day.day)?.label}
                </Label>
              </div>

              {day.active && (
                <div className="mr-8 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {timeRanges.map((range) => {
                      const Icon = range.icon;
                      const isSelected = day.timeRanges?.includes(range.id as any);
                      return (
                        <div
                          key={range.id}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                            ${isSelected ? 'border-primary bg-background shadow-sm ring-1 ring-primary/20' : 'border-border/50 bg-background/50 hover:bg-background'}
                          `}
                          onClick={() => handleRangeToggle(index, range.id as any)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleRangeToggle(index, range.id as any)}
                            id={`range-${day.day}-${range.id}`}
                            className="data-[state=checked]:bg-primary"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                              {range.label.split(' (')[0]}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {range.label.match(/\((.*?)\)/)?.[1]}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <Label className="text-xs mb-1.5 block">
                      הערות (יוצג למטופל)
                    </Label>
                    <Input
                      placeholder="לדוגמה: קליניקה ברמת גן"
                      value={day.notes || ''}
                      onChange={(e) =>
                        handleUpdate(index, 'notes', e.target.value)
                      }
                      className="bg-background text-right"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="sm:justify-start gap-2">
          <Button onClick={handleSave} className="w-full sm:w-auto">שמור הגדרות</Button>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

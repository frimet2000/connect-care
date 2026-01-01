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
import { X, Plus } from 'lucide-react';

interface AvailabilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'slots' | 'reception_days';
  schedule: WeeklySchedule;
  onSave: (schedule: WeeklySchedule) => void;
}

const SlotInput = ({ hour, minute, onUpdate, onDelete }: { hour: string, minute: string, onUpdate: (m: string) => void, onDelete: () => void }) => {
  const [val, setVal] = useState(minute);

  useEffect(() => {
    setVal(minute);
  }, [minute]);

  const handleBlur = () => {
    // Pad with 0 if needed
    let padded = val;
    if (padded.length === 1) padded = '0' + padded;
    if (padded === '') padded = '00';
    
    // Validate 00-59
    const num = parseInt(padded);
    if (isNaN(num) || num < 0 || num > 59) {
      setVal(minute); // Revert
      return;
    }
    
    if (padded !== minute) {
      onUpdate(padded);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-secondary/20 p-1 rounded px-2 group hover:bg-secondary/30 transition-colors">
       <span className="text-sm font-medium">{hour}:</span>
       <Input 
         className="w-12 h-8 px-1 text-center bg-background border-transparent hover:border-input focus:border-primary transition-all" 
         dir="ltr"
         value={val}
         onChange={(e) => {
           if (e.target.value.length <= 2) setVal(e.target.value);
         }}
         onBlur={handleBlur}
         onKeyDown={(e) => {
           if (e.key === 'Enter') {
             e.currentTarget.blur();
           }
         }}
       />
       <Button 
         variant="ghost" 
         size="icon" 
         className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive" 
         onClick={onDelete}
       >
         <X className="h-3 w-3" />
       </Button>
    </div>
  );
};

export const AvailabilitySettings = ({
  isOpen,
  onClose,
  mode,
  schedule,
  onSave,
}: AvailabilitySettingsProps) => {
  const [localSchedule, setLocalSchedule] = useState<WeeklySchedule>(schedule);

  // Sync local state when prop changes
  useEffect(() => {
    setLocalSchedule(schedule);
  }, [schedule, isOpen]);

  const handleDayToggle = (dayIndex: number) => {
    const newSchedule = [...localSchedule];
    newSchedule[dayIndex] = {
      ...newSchedule[dayIndex],
      active: !newSchedule[dayIndex].active,
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

  const [customTime, setCustomTime] = useState("");

  const addCustomTime = (dayIndex: number) => {
    if (!customTime) return;
    // Simple validation for HH:MM format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(customTime)) return;
    
    // Normalize format
    let [h, m] = customTime.split(':');
    if (h.length === 1) h = '0' + h;
    const formatted = `${h}:${m}`;
    
    const currentSlots = localSchedule[dayIndex].slots || [];
    if (!currentSlots.includes(formatted)) {
       handleUpdate(dayIndex, 'slots', [...currentSlots, formatted].sort());
    }
    setCustomTime("");
  };

  const addSlot = (dayIndex: number, slot: string) => {
    const currentSlots = localSchedule[dayIndex].slots || [];
    if (!currentSlots.includes(slot)) {
      handleUpdate(dayIndex, 'slots', [...currentSlots, slot].sort());
    }
  };

  const removeSlot = (dayIndex: number, slot: string) => {
    const currentSlots = localSchedule[dayIndex].slots || [];
    handleUpdate(dayIndex, 'slots', currentSlots.filter(s => s !== slot));
  };

  const updateSlotMinute = (dayIndex: number, oldSlot: string, newMinute: string) => {
    const [h] = oldSlot.split(':');
    const newSlot = `${h}:${newMinute}`;
    
    const currentSlots = localSchedule[dayIndex].slots || [];
    // Replace oldSlot with newSlot, remove duplicates, sort
    let newSlots = currentSlots.map(s => s === oldSlot ? newSlot : s);
    newSlots = Array.from(new Set(newSlots)).sort();
    
    handleUpdate(dayIndex, 'slots', newSlots);
  };

  const handleSave = () => {
    onSave(localSchedule);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'slots' ? 'ניהול יומן תורים' : 'ניהול ימי קבלה'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'slots' 
              ? 'סמן את הימים והשעות בהם תרצה לקבל מטופלים. ניתן לערוך את דקות התור לכל שעה.'
              : 'סמן את ימי ושעות הפעילות שלך. המידע יוצג למטופלים ליצירת קשר.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4" dir="rtl">
          {localSchedule.map((day, index) => (
            <div
              key={day.day}
              className={`p-4 rounded-xl border transition-all ${
                day.active
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
                  {mode === 'reception_days' ? (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-xs mb-1.5 block">
                          שעות פעילות (טקסט חופשי)
                        </Label>
                        <Input
                          placeholder="לדוגמה: 08:00 - 14:00"
                          value={day.hoursRange || ''}
                          onChange={(e) =>
                            handleUpdate(index, 'hoursRange', e.target.value)
                          }
                          className="bg-background text-right"
                        />
                      </div>
                    </div>
                  ) : (
                    // Slots Mode
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs mb-3 block font-semibold">
                          שעות קבלה (ניתן לערוך את הדקות):
                        </Label>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {Array.from({ length: 15 }, (_, i) => i + 7).map(hour => {
                            const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
                            const hourSlots = day.slots.filter(s => s.startsWith(hourStr + ':'));
                            
                            return (
                              <div key={hour} className="space-y-2 p-2 rounded-lg border bg-background/50">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-bold text-muted-foreground">שעה {hourStr}</Label>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 hover:bg-primary hover:text-primary-foreground rounded-full" 
                                    onClick={() => addSlot(index, `${hourStr}:00`)}
                                    title={`הוסף תור ב-${hourStr}:00`}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-[2rem]">
                                   {hourSlots.length === 0 && (
                                      <div className="text-[10px] text-muted-foreground italic w-full text-center py-1">אין תורים</div>
                                   )}
                                   {hourSlots.map((slot, idx) => (
                                      <SlotInput 
                                        key={`${slot}-${idx}`}
                                        hour={hourStr}
                                        minute={slot.split(':')[1]}
                                        onUpdate={(newMin) => updateSlotMinute(index, slot, newMin)}
                                        onDelete={() => removeSlot(index, slot)}
                                      />
                                   ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                          <Label className="text-sm shrink-0">הוספה מהירה:</Label>
                          <Input 
                            placeholder="08:30" 
                            className="w-24 h-9 text-sm" 
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => addCustomTime(index)}
                          >
                            הוסף שעה
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
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
                    </div>
                  )}
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

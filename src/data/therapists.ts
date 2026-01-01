export type Profession = 'speech_therapy' | 'physiotherapy' | 'occupational_therapy' | 'nutrition' | 'psychotherapy';

export type AgeGroup = 'infant' | 'toddler' | 'child_5_9' | 'child_10_13' | 'teen' | 'adult' | 'senior';

export type AvailabilityStatus = 'available_full' | 'available_partial' | 'specific_hours' | 'waitlist';

export type SchedulingMode = 'slots' | 'reception_days';

export interface DaySchedule {
  day: string;
  active: boolean;
  slots: string[];
  hoursRange?: string;
  notes?: string;
}

export type WeeklySchedule = DaySchedule[];

export interface Therapist {
  id: string;
  name: string;
  profession: Profession;
  professionLabel: string;
  avatar: string;
  yearsExperience: number;
  city: string;
  address?: string;
  distance?: number;
  pricePerSession: number;
  sessionDuration: number;
  specializations: string[];
  targetAudience: AgeGroup[];
  availabilityStatus: AvailabilityStatus;
  availabilityText?: string;
  bio: string;
  homeVisits: boolean;
  acceptsBtl: boolean;
  healthFunds: string[];
  phoneNumber: string;
  additionalPhoneNumber?: string;
  email?: string;
  website?: string;
  weeklySchedule?: WeeklySchedule;
  availableToday?: boolean;
  instantBooking?: boolean;
  schedulingMode: SchedulingMode;
}

export const daysOfWeek = [
  { id: 'sunday', label: 'ראשון' },
  { id: 'monday', label: 'שני' },
  { id: 'tuesday', label: 'שלישי' },
  { id: 'wednesday', label: 'רביעי' },
  { id: 'thursday', label: 'חמישי' },
  { id: 'friday', label: 'שישי' },
  { id: 'saturday', label: 'שבת' },
];

export const generateEmptySchedule = (): WeeklySchedule => {
  return daysOfWeek.map(day => ({
    day: day.id,
    active: false,
    slots: [],
    hoursRange: '',
    notes: ''
  }));
};

export const professionOptions = [
  { value: 'speech_therapy', label: 'קלינאות תקשורת' },
  { value: 'occupational_therapy', label: 'ריפוי בעיסוק' },
  { value: 'physiotherapy', label: 'פיזיותרפיה' },
  { value: 'nutrition', label: 'תזונה' },
  { value: 'psychotherapy', label: 'פסיכותרפיה' },
];

export const ageGroupOptions = [
  { value: 'infant', label: 'תינוקות' },
  { value: 'toddler', label: 'הגיל הרך' },
  { value: 'child_5_9', label: '5-9' },
  { value: 'child_10_13', label: '10-13' },
  { value: 'teen', label: 'נוער' },
  { value: 'adult', label: '18+' },
  { value: 'senior', label: '65+' },
];

export const specializationsByProfession: Record<Profession, { value: string; label: string }[]> = {
  speech_therapy: [
    { value: 'developmental_delay', label: 'עיכוב התפתחותי' },
    { value: 'articulation', label: 'הגייה' },
    { value: 'language_delay', label: 'שפה' },
    { value: 'stuttering', label: 'גמגום ואי שטף' },
    { value: 'voice', label: 'קול וצרידות' },
    { value: 'communication', label: 'ASD (אוטיזם)' },
    { value: 'eating_swallowing', label: 'אכילה ובליעה' },
    { value: 'oral_functions', label: 'תפקודי פה' },
  ],
  occupational_therapy: [
    { value: 'sensory', label: 'ויסות חושי' },
    { value: 'fine_motor', label: 'מוטוריקה עדינה' },
    { value: 'adhd', label: 'ADHD' },
    { value: 'graphomotor', label: 'גרפומוטוריקה' },
    { value: 'adl', label: 'תפקודי יומיום (ADL)' },
  ],
  physiotherapy: [
    { value: 'motor_development', label: 'התפתחות מוטורית' },
    { value: 'orthopedics', label: 'אורתופדיה' },
    { value: 'respiratory', label: 'נשימתי' },
    { value: 'neurology', label: 'נוירולוגיה' },
  ],
  nutrition: [
    { value: 'picky_eating', label: 'בררנות אכילה' },
    { value: 'obesity', label: 'עודף משקל' },
    { value: 'allergies', label: 'אלרגיות' },
    { value: 'diabetes', label: 'סוכרת' },
    { value: 'digestive', label: 'בעיות עיכול' },
  ],
  psychotherapy: [
    { value: 'emotional_regulation', label: 'ויסות רגשי' },
    { value: 'anxiety', label: 'חרדה' },
    { value: 'social_skills', label: 'מיומנויות חברתיות' },
    { value: 'parental_guidance', label: 'הדרכת הורים' },
    { value: 'trauma', label: 'טראומה' },
  ],
};

// Flattened list for backward compatibility or global search if needed
export const specializationOptions = Object.values(specializationsByProfession).flat();

export const healthFundOptions = [
  { value: 'clalit', label: 'כללית' },
  { value: 'maccabi', label: 'מכבי' },
  { value: 'meuhedet', label: 'מאוחדת' },
  { value: 'leumit', label: 'לאומית' },
];

export const mockTherapists: Therapist[] = [];

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

export const mockTherapists: Therapist[] = [
  {
    id: '1',
    name: 'לי',
    profession: 'speech_therapy',
    professionLabel: 'קלינאית תקשורת',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    yearsExperience: 12,
    city: 'תל אביב',
    address: 'דרך מנחם בגין 121, תל אביב',
    distance: 2.3,
    pricePerSession: 320,
    sessionDuration: 45,
    specializations: ['ASD (אוטיזם)', 'עיכוב שפתי', 'הגייה'],
    targetAudience: ['toddler', 'child_5_9', 'child_10_13'],
    availabilityStatus: 'available_partial',
    availabilityText: 'פנויה בימי א׳ ו-ג׳ בבוקר',
    bio: 'קלינאית תקשורת מוסמכת עם התמחות בטיפול בילדים על הספקטרום האוטיסטי. גישה חמה ומקצועית.',
    homeVisits: true,
    acceptsBtl: true,
    healthFunds: ['מכבי', 'כללית'],
    phoneNumber: '050-1111111',
    email: 'li@example.com',
    website: 'https://www.lispeech.co.il',
    schedulingMode: 'slots',
    weeklySchedule: [
      { day: 'sunday', active: true, slots: ['08:00', '09:00', '10:00'], hoursRange: '08:00 - 12:00', notes: 'קליניקה ברמת גן' },
      { day: 'monday', active: false, slots: [], hoursRange: '', notes: '' },
      { day: 'tuesday', active: true, slots: ['14:00', '15:00', '16:00'], hoursRange: '14:00 - 18:00', notes: '' },
      { day: 'wednesday', active: false, slots: [], hoursRange: '', notes: '' },
      { day: 'thursday', active: false, slots: [], hoursRange: '', notes: '' },
      { day: 'friday', active: false, slots: [], hoursRange: '', notes: '' },
      { day: 'saturday', active: false, slots: [], hoursRange: '', notes: '' },
    ]
  },
  {
    id: '2',
    name: 'ד"ר יוסי לוי',
    profession: 'physiotherapy',
    professionLabel: 'פיזיותרפיסט',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    yearsExperience: 15,
    city: 'רמת גן',
    address: 'ז\'בוטינסקי 35, רמת גן',
    distance: 4.1,
    pricePerSession: 280,
    sessionDuration: 45,
    specializations: ['מוטוריקה', 'עיכוב התפתחותי'],
    targetAudience: ['infant', 'toddler', 'child_5_9', 'child_10_13'],
    availabilityStatus: 'waitlist',
    availabilityText: 'רשימת המתנה בלבד',
    bio: 'פיזיותרפיסט ילדים עם ניסיון רב בטיפול בבעיות מוטוריות והתפתחותיות.',
    homeVisits: true,
    acceptsBtl: true,
    healthFunds: ['כללית', 'מאוחדת', 'לאומית'],
    phoneNumber: '050-2222222',
    schedulingMode: 'reception_days',
  },
  {
    id: '3',
    name: 'מיכל כהן',
    profession: 'occupational_therapy',
    professionLabel: 'מרפאה בעיסוק',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    yearsExperience: 8,
    city: 'הרצליה',
    distance: 8.5,
    pricePerSession: 300,
    sessionDuration: 50,
    specializations: ['ויסות חושי', 'ADHD', 'מוטוריקה'],
    targetAudience: ['child_5_9', 'child_10_13', 'teen'],
    availabilityStatus: 'available_full',
    availabilityText: 'זמינות מלאה',
    bio: 'מרפאה בעיסוק המתמחה בויסות חושי וטיפול בילדים עם קשיי קשב וריכוז.',
    homeVisits: false,
    acceptsBtl: false,
    healthFunds: ['מכבי'],
    phoneNumber: '050-3333333',
    schedulingMode: 'slots',
  },
  {
    id: '4',
    name: 'דנה אברהם',
    profession: 'speech_therapy',
    professionLabel: 'קלינאית תקשורת',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    yearsExperience: 6,
    city: 'תל אביב',
    distance: 1.8,
    pricePerSession: 350,
    sessionDuration: 45,
    specializations: ['גמגום', 'הגייה'],
    targetAudience: ['teen', 'adult'],
    availabilityStatus: 'specific_hours',
    availabilityText: 'פנויה ביום ה׳ 16:00-19:00',
    bio: 'מומחית לטיפול בגמגום בילדים ומבוגרים. שיטות טיפול מתקדמות ותוצאות מוכחות.',
    homeVisits: true,
    acceptsBtl: true,
    healthFunds: ['מכבי', 'כללית', 'מאוחדת'],
    phoneNumber: '050-4444444',
    schedulingMode: 'slots',
  },
  {
    id: '5',
    name: 'אורי גולן',
    profession: 'physiotherapy',
    professionLabel: 'פיזיותרפיסט',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
    yearsExperience: 20,
    city: 'פתח תקווה',
    distance: 12.3,
    pricePerSession: 250,
    sessionDuration: 45,
    specializations: ['מוטוריקה', 'עיכוב התפתחותי'],
    targetAudience: ['child_5_9', 'child_10_13', 'teen'],
    availabilityStatus: 'available_partial',
    availabilityText: 'פנוי בבקרים בלבד',
    bio: 'פיזיותרפיסט ותיק עם ניסיון עשיר בטיפול בילדים מכל הגילאים.',
    homeVisits: true,
    acceptsBtl: true,
    healthFunds: ['כללית', 'לאומית'],
    phoneNumber: '050-5555555',
    schedulingMode: 'reception_days',
  },
];

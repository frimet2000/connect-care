export type Profession = 'speech_therapy' | 'physiotherapy' | 'occupational_therapy';

export interface Therapist {
  id: string;
  name: string;
  profession: Profession;
  professionLabel: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  city: string;
  distance?: number;
  pricePerSession: number;
  sessionDuration: number;
  specializations: string[];
  bio: string;
  homeVisits: boolean;
  acceptsBtl: boolean;
  healthFunds: string[];
  availableToday: boolean;
  instantBooking: boolean;
}

export const professionOptions = [
  { value: 'speech_therapy', label: 'קלינאות תקשורת' },
  { value: 'physiotherapy', label: 'פיזיותרפיה' },
  { value: 'occupational_therapy', label: 'ריפוי בעיסוק' },
];

export const specializationOptions = [
  { value: 'autism', label: 'אוטיזם' },
  { value: 'stuttering', label: 'גמגום' },
  { value: 'language_delay', label: 'עיכוב שפתי' },
  { value: 'articulation', label: 'הגייה' },
  { value: 'motor_skills', label: 'מוטוריקה' },
  { value: 'sensory', label: 'ויסות חושי' },
  { value: 'adhd', label: 'ADHD' },
  { value: 'developmental_delay', label: 'עיכוב התפתחותי' },
];

export const healthFundOptions = [
  { value: 'clalit', label: 'כללית' },
  { value: 'maccabi', label: 'מכבי' },
  { value: 'meuhedet', label: 'מאוחדת' },
  { value: 'leumit', label: 'לאומית' },
];

export const mockTherapists: Therapist[] = [
  {
    id: '1',
    name: 'רונית שפירא',
    profession: 'speech_therapy',
    professionLabel: 'קלינאית תקשורת',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    rating: 4.9,
    reviewCount: 127,
    yearsExperience: 12,
    city: 'תל אביב',
    distance: 2.3,
    pricePerSession: 320,
    sessionDuration: 45,
    specializations: ['אוטיזם', 'עיכוב שפתי', 'הגייה'],
    bio: 'קלינאית תקשורת מוסמכת עם התמחות בטיפול בילדים על הספקטרום האוטיסטי. גישה חמה ומקצועית.',
    homeVisits: true,
    acceptsBtl: true,
    healthFunds: ['מכבי', 'כללית'],
    availableToday: true,
    instantBooking: true,
  },
  {
    id: '2',
    name: 'ד"ר יוסי לוי',
    profession: 'physiotherapy',
    professionLabel: 'פיזיותרפיסט',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    rating: 4.8,
    reviewCount: 89,
    yearsExperience: 15,
    city: 'רמת גן',
    distance: 4.1,
    pricePerSession: 280,
    sessionDuration: 45,
    specializations: ['מוטוריקה', 'עיכוב התפתחותי'],
    bio: 'פיזיותרפיסט ילדים עם ניסיון רב בטיפול בבעיות מוטוריות והתפתחותיות.',
    homeVisits: true,
    acceptsBtl: true,
    healthFunds: ['כללית', 'מאוחדת', 'לאומית'],
    availableToday: false,
    instantBooking: false,
  },
  {
    id: '3',
    name: 'מיכל כהן',
    profession: 'occupational_therapy',
    professionLabel: 'מרפאה בעיסוק',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    rating: 4.7,
    reviewCount: 64,
    yearsExperience: 8,
    city: 'הרצליה',
    distance: 8.5,
    pricePerSession: 300,
    sessionDuration: 50,
    specializations: ['ויסות חושי', 'ADHD', 'מוטוריקה'],
    bio: 'מרפאה בעיסוק המתמחה בויסות חושי וטיפול בילדים עם קשיי קשב וריכוז.',
    homeVisits: false,
    acceptsBtl: false,
    healthFunds: ['מכבי'],
    availableToday: true,
    instantBooking: true,
  },
  {
    id: '4',
    name: 'דנה אברהם',
    profession: 'speech_therapy',
    professionLabel: 'קלינאית תקשורת',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 43,
    yearsExperience: 6,
    city: 'תל אביב',
    distance: 1.8,
    pricePerSession: 350,
    sessionDuration: 45,
    specializations: ['גמגום', 'הגייה'],
    bio: 'מומחית לטיפול בגמגום בילדים ומבוגרים. שיטות טיפול מתקדמות ותוצאות מוכחות.',
    homeVisits: true,
    acceptsBtl: true,
    healthFunds: ['מכבי', 'כללית', 'מאוחדת'],
    availableToday: false,
    instantBooking: true,
  },
  {
    id: '5',
    name: 'אורי גולן',
    profession: 'physiotherapy',
    professionLabel: 'פיזיותרפיסט',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
    rating: 4.6,
    reviewCount: 112,
    yearsExperience: 20,
    city: 'פתח תקווה',
    distance: 12.3,
    pricePerSession: 250,
    sessionDuration: 45,
    specializations: ['מוטוריקה', 'עיכוב התפתחותי'],
    bio: 'פיזיותרפיסט ותיק עם ניסיון עשיר בטיפול בילדים מכל הגילאים.',
    homeVisits: true,
    acceptsBtl: true,
    healthFunds: ['כללית', 'לאומית'],
    availableToday: true,
    instantBooking: false,
  },
];

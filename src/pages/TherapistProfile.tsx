import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  Zap,
  Home,
  Shield,
  ArrowRight,
  Calendar,
  MessageCircle,
  Award,
  GraduationCap,
  Heart,
  Share2,
  Navigation,
  Phone,
  Mail,
  Globe,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingFlow from "@/components/BookingFlow";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Therapist, professionOptions, WeeklySchedule, daysOfWeek } from "@/data/therapists";
import { toast } from "@/hooks/use-toast";

const TherapistProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTherapist(id);
    }
  }, [id]);

  const fetchTherapist = async (therapistId: string) => {
    setLoading(true);
    try {
      // 1. Fetch therapist details
      const { data: therapistData, error: therapistError } = await supabase
        .from("therapists")
        .select("*")
        .eq("id", therapistId)
        .single();

      if (therapistError) throw therapistError;

      // 2. Fetch profile details
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("user_id", therapistData.user_id)
        .single();

      if (profileError) throw profileError;

      // 3. Fetch dedicated schedule (preferred)
      const { data: scheduleData } = await supabase
        .from("therapist_schedules")
        .select("*")
        .eq("therapist_id", therapistId)
        .maybeSingle();

      // 4. Determine schedule source
      let weeklySchedule: WeeklySchedule | null = 
          (scheduleData?.weekly_schedule as WeeklySchedule) || 
          (therapistData.weekly_schedule as WeeklySchedule);
      
      let schedulingMode = scheduleData?.scheduling_mode || therapistData.scheduling_mode || 'slots';
      let availabilityText = scheduleData?.availability_text || therapistData.availability_text;

      if (weeklySchedule) {
        weeklySchedule = weeklySchedule.map(day => {
          if (day.active && !day.hoursRange && day.slots && day.slots.length > 0) {
             const sortedSlots = [...day.slots].sort();
             const start = sortedSlots[0];
             const end = sortedSlots[sortedSlots.length - 1];
             // Simple range from first to last slot start time
             return { ...day, hoursRange: `${start} - ${end}` };
          }
          return day;
        });
      }

      if (!weeklySchedule) {
        const { data: availabilityData, error: availabilityError } = await supabase
          .from("availability")
          .select("*")
          .eq("therapist_id", therapistId);

        if (availabilityError) throw availabilityError;

        // Map availability to WeeklySchedule
        weeklySchedule = daysOfWeek.map(dayObj => {
          // Map day IDs (sunday..saturday) to DB day_of_week (0..6, assuming 0 is Sunday)
          const dayIndex = daysOfWeek.findIndex(d => d.id === dayObj.id);
          const dayAvailability = availabilityData?.find(a => a.day_of_week === dayIndex);

          let slots: string[] = [];
          let hoursRange = "";

          if (dayAvailability && dayAvailability.is_active) {
            // Generate slots every hour
            const start = parseInt(dayAvailability.start_time.split(':')[0]);
            const end = parseInt(dayAvailability.end_time.split(':')[0]);
            hoursRange = `${dayAvailability.start_time.slice(0, 5)} - ${dayAvailability.end_time.slice(0, 5)}`;
            
            for (let h = start; h < end; h++) {
              slots.push(`${h.toString().padStart(2, '0')}:00`);
            }
          }

          return {
            day: dayObj.id,
            active: !!(dayAvailability && dayAvailability.is_active),
            slots,
            hoursRange,
            notes: ""
          };
        });
      }

      const professionLabel =
        professionOptions.find((p) => p.value === therapistData.profession)?.label ||
        therapistData.profession;

      const mappedTherapist: Therapist = {
        id: therapistData.id,
        name: profileData.full_name,
        profession: therapistData.profession as any,
        professionLabel,
        avatar: therapistData.avatar_url || undefined,
        yearsExperience: therapistData.years_experience || 0,
        city: therapistData.city,
        address: therapistData.address || undefined,
        distance: 0,
        sessionDuration: therapistData.session_duration_minutes || 45,
        specializations: therapistData.specializations || [],
        availabilityStatus: therapistData.available_today
          ? "available_full"
          : "available_partial",
        availabilityText: availabilityText || (therapistData.available_today ? "זמין היום" : "זמין"),
        bio: therapistData.bio || "",
        homeVisits: therapistData.home_visits || false,
        acceptsBtl: therapistData.accepts_btl || false,
        healthFunds: therapistData.health_funds || [],
        phoneNumber: profileData.phone || "",
        schedulingMode: schedulingMode as any,
        availableToday: therapistData.available_today || false,
        instantBooking: therapistData.instant_booking || false,
        weeklySchedule
      };

      setTherapist(mappedTherapist);
    } catch (error) {
      console.error("Error fetching therapist:", error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן היה לטעון את פרטי המטפל",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען פרטי מטפל...</p>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">מטפל לא נמצא</h1>
          <Button onClick={() => navigate("/")}>חזרה לדף הבית</Button>
        </div>
      </div>
    );
  }

  // Generate next 7 days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split("T")[0],
        dayName: dayNames[date.getDay()],
        dayNum: date.getDate(),
        month: date.toLocaleDateString("he-IL", { month: "short" }),
        isToday: i === 0,
      });
    }
    return days;
  };

  const availableDays = getNextDays();

  const handleShare = (platform: 'whatsapp' | 'email') => {
    const url = window.location.href;
    const text = `היי, רציתי לשתף איתך את הפרופיל של ${therapist.name} ב-TherapyConnect:\n${url}`;
    
    if (platform === 'whatsapp') {
      // Share with others (select contact)
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      
      // Track click for analytics
      try {
        const clicks = JSON.parse(localStorage.getItem('whatsapp_clicks') || '{}');
        clicks[therapist.id] = (clicks[therapist.id] || 0) + 1;
        localStorage.setItem('whatsapp_clicks', JSON.stringify(clicks));
      } catch (e) {
        console.error('Failed to track WhatsApp click', e);
      }
    } else {
      window.open(`mailto:?subject=שיתוף פרופיל מטפל&body=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const getSlotsForDate = (dateStr: string) => {
    if (!therapist?.weeklySchedule) {
      return [
        { time: "09:00", available: true },
        { time: "10:00", available: false },
        { time: "11:00", available: true },
        { time: "14:00", available: true },
        { time: "15:00", available: true },
        { time: "16:00", available: false },
        { time: "17:00", available: true },
      ];
    }
    
    const date = new Date(dateStr);
    const dayIndex = date.getDay();
    const dayId = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayIndex];
    
    const daySchedule = therapist.weeklySchedule.find(d => d.day === dayId);
    if (!daySchedule || !daySchedule.active) return [];
    
    return daySchedule.slots.map(slot => ({
      time: slot,
      available: true
    })).sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <>
      <Helmet>
        <title>{therapist.name} - {therapist.professionLabel} | TherapyConnect</title>
        <meta
          name="description"
          content={`${therapist.name}, ${therapist.professionLabel} ב${therapist.city}. ${therapist.yearsExperience} שנות ניסיון.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background text-right" dir="rtl">
        <Header />

        <main className="pt-20">
          {/* Back Button */}
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span>חזרה לתוצאות</span>
            </button>
          </div>

          {/* Profile Header */}
          <section className="container mx-auto px-4 pb-8">
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              {/* Cover */}
              <div className="h-32 gradient-hero relative">
                <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-transparent" />
              </div>

              {/* Profile Info */}
              <div className="px-6 pb-6 -mt-16 relative">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {therapist.avatar ? (
                      <img
                        src={therapist.avatar}
                        alt={therapist.name}
                        className="w-32 h-32 rounded-2xl object-cover ring-4 ring-card shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-muted flex items-center justify-center ring-4 ring-card shadow-lg">
                        <User className="w-16 h-16 text-muted-foreground/50" />
                      </div>
                    )}
                    {therapist.availableToday && (
                      <div className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        זמין היום
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 pt-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                            {therapist.name}
                          </h1>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                                <Share2 className="w-5 h-5 text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2" align="start">
                              <div className="flex flex-col gap-1">
                                <Button variant="ghost" className="justify-start gap-2" onClick={() => handleShare('whatsapp')}>
                                  WhatsApp
                                </Button>
                                <Button variant="ghost" className="justify-start gap-2" onClick={() => handleShare('email')}>
                                  Email
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <p className="text-lg text-primary font-medium mt-1">
                          {therapist.professionLabel}
                        </p>

                        {/* Contact Info */}
                        <div className="flex flex-col gap-2 mt-3 mb-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span dir="ltr">{therapist.phoneNumber}</span>
                          </div>
                          {therapist.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span>{therapist.email}</span>
                            </div>
                          )}
                          {therapist.website && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Globe className="w-4 h-4" />
                              <a href={therapist.website} target="_blank" rel="noreferrer" className="hover:text-primary underline">
                                לאתר המטפל
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Quick Info */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{therapist.city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            <span>{therapist.yearsExperience} שנות ניסיון</span>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        {therapist.instantBooking && (
                          <Badge variant="default" className="gap-1">
                            <Zap className="w-3 h-3" />
                            הזמנה מיידית
                          </Badge>
                        )}
                        {therapist.homeVisits && (
                          <Badge variant="secondary" className="gap-1">
                            <Home className="w-3 h-3" />
                            ביקורי בית
                          </Badge>
                        )}
                        {therapist.acceptsBtl && (
                          <Badge variant="outline" className="gap-1 border-secondary text-secondary">
                            <Shield className="w-3 h-3" />
                            ביטוח לאומי
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="container mx-auto px-4 pb-12">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                <div className="bg-card rounded-2xl shadow-card p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    אודות
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{therapist.bio}</p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    אני מאמינה בגישה טיפולית משחקית המותאמת אישית לכל ילד. עובדת בשיתוף פעולה הדוק עם
                    ההורים ומספקת כלים להמשך העבודה בבית. הקליניקה שלי מאובזרת במגוון רחב של משחקים
                    וחומרי עזר מתקדמים.
                  </p>
                </div>

                {/* Specializations */}
                <div className="bg-card rounded-2xl shadow-card p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    התמחויות
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {therapist.specializations.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-sm py-1.5 px-3">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Reception Times */}
                {therapist.weeklySchedule && (
                  <div className="bg-card rounded-2xl shadow-card p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      מועדי קבלה
                    </h2>
                    <div className="space-y-3">
                      {therapist.weeklySchedule.filter(d => d.active).map(day => (
                        <div key={day.day} className="bg-muted/50 p-3 rounded-xl">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm">
                              {day.day === 'sunday' ? 'ראשון' : 
                               day.day === 'monday' ? 'שני' : 
                               day.day === 'tuesday' ? 'שלישי' : 
                               day.day === 'wednesday' ? 'רביעי' : 
                               day.day === 'thursday' ? 'חמישי' : 
                               day.day === 'friday' ? 'שישי' : 'שבת'}
                            </span>
                          </div>
                          {day.hoursRange && (
                            <div className="text-sm flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              {day.hoursRange}
                            </div>
                          )}
                          {day.notes && (
                            <p className="text-xs text-muted-foreground mt-1 border-t border-border/50 pt-1">
                              {day.notes}
                            </p>
                          )}
                        </div>
                      ))}
                      {therapist.weeklySchedule.filter(d => d.active).length === 0 && (
                        <p className="text-muted-foreground">לא צוינו מועדי קבלה</p>
                      )}
                    </div>
                    
                    {therapist.availabilityText && 
                     therapist.availabilityText !== "זמין" && 
                     therapist.availabilityText !== "זמין היום" && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-primary" />
                          מידע נוסף על זמינות
                        </h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {therapist.availabilityText}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Health Funds */}
                {therapist.healthFunds.length > 0 && (
                  <div className="bg-card rounded-2xl shadow-card p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      קופות חולים והחזרים
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {therapist.healthFunds.map((fund) => (
                        <div
                          key={fund}
                          className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg"
                        >
                          <div className="w-2 h-2 rounded-full bg-secondary" />
                          <span className="text-foreground">{fund}</span>
                        </div>
                      ))}
                    </div>
                    {therapist.acceptsBtl && (
                      <p className="text-sm text-muted-foreground mt-4">
                        ✓ מקבל מטופלים מביטוח לאומי
                      </p>
                    )}
                  </div>
                )}

                {/* Location */}
                <div className="bg-card rounded-2xl shadow-card p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    מיקום ודרכי הגעה
                  </h2>
                  <p className="text-foreground font-medium mb-4">
                    {therapist.address || therapist.city}
                  </p>
                  
                  {/* Map */}
                  <div className="w-full h-64 bg-muted rounded-xl overflow-hidden mb-4 relative">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(therapist.address || therapist.city)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      allowFullScreen
                    ></iframe>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => window.open(`https://waze.com/ul?q=${encodeURIComponent(therapist.address || therapist.city)}`, '_blank')}
                    >
                      <Navigation className="w-4 h-4" />
                      נווט עם Waze
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(therapist.address || therapist.city)}`, '_blank')}
                    >
                      <MapPin className="w-4 h-4" />
                      Google Maps
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column - Booking */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl shadow-card p-6 sticky top-24">
                  {therapist.schedulingMode === 'slots' && therapist.weeklySchedule?.some(d => d.active && d.slots.length > 0) ? (
                    <>
                      <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        קביעת תור
                      </h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        בחרו תאריך ושעה נוחים
                      </p>

                      {/* Date Selection */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-3">
                          בחרו יום
                        </label>
                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                          {availableDays.map((day) => (
                            <button
                              key={day.date}
                              onClick={() => {
                                setSelectedDate(day.date);
                                setSelectedTime(null);
                              }}
                              className={`flex-shrink-0 w-16 py-3 rounded-xl border-2 transition-all text-center ${
                                selectedDate === day.date
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <p className="text-xs font-medium">
                                {day.isToday ? "היום" : day.dayName}
                              </p>
                              <p className="text-lg font-bold">{day.dayNum}</p>
                              <p className="text-xs text-muted-foreground">{day.month}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time Selection */}
                      {selectedDate && (
                        <div className="mb-6 animate-fade-in">
                          <label className="block text-sm font-medium text-foreground mb-3">
                            בחרו שעה
                          </label>
                          {getSlotsForDate(selectedDate).length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                              {getSlotsForDate(selectedDate).map((slot) => (
                                <button
                                  key={slot.time}
                                  onClick={() => slot.available && setSelectedTime(slot.time)}
                                  disabled={!slot.available}
                                  className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                                    !slot.available
                                      ? "border-border bg-muted/50 text-muted-foreground cursor-not-allowed line-through"
                                      : selectedTime === slot.time
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-muted/30 rounded-lg">
                              <p className="text-muted-foreground">אין תורים פנויים ביום זה</p>
                              {therapist.weeklySchedule?.find(d => d.day === ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(selectedDate).getDay()])?.notes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {therapist.weeklySchedule.find(d => d.day === ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(selectedDate).getDay()])?.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Session Info */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Clock className="w-4 h-4" />
                        <span>משך הטיפול: {therapist.sessionDuration} דקות</span>
                      </div>

                      {/* Book Button */}
                      {!showBookingFlow ? (
                        <>
                          <Button
                            variant="gradient"
                            size="xl"
                            className="w-full"
                            disabled={!selectedDate || !selectedTime}
                            onClick={() => setShowBookingFlow(true)}
                          >
                            {therapist.instantBooking ? "הזמן עכשיו" : "בקש תור"}
                          </Button>

                          {therapist.instantBooking && (
                            <p className="text-xs text-center text-secondary mt-3 flex items-center justify-center gap-1">
                              <Zap className="w-3 h-3" />
                              התור יאושר מיידית
                            </p>
                          )}
                        </>
                      ) : (
                        <BookingFlow
                          therapistName={therapist.name}
                          selectedDate={selectedDate!}
                          selectedTime={selectedTime!}
                          sessionDuration={therapist.sessionDuration}
                          instantBooking={therapist.instantBooking || false}
                          onClose={() => navigate("/")}
                          onBack={() => setShowBookingFlow(false)}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        יצירת קשר
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        המטפל זמין לפניות טלפוניות או בהודעה.
                        ניתן לראות את מועדי הקבלה בפרטי הפרופיל.
                      </p>
                      
                      <div className="space-y-3">
                        <Button 
                          variant="gradient" 
                          size="xl" 
                          className="w-full gap-2"
                          onClick={() => window.open(`tel:${therapist.phoneNumber}`, '_self')}
                        >
                          <Phone className="w-5 h-5" />
                          חייג למטפל
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="xl" 
                          className="w-full gap-2"
                          onClick={() => handleShare('whatsapp')}
                        >
                          <MessageCircle className="w-5 h-5" />
                          שלח הודעה ב-WhatsApp
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TherapistProfile;

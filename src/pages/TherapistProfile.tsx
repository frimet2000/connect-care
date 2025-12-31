import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mockTherapists } from "@/data/therapists";
import { Helmet } from "react-helmet";

const TherapistProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const therapist = mockTherapists.find((t) => t.id === id);

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

  // Mock time slots
  const timeSlots = [
    { time: "09:00", available: true },
    { time: "10:00", available: false },
    { time: "11:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: false },
    { time: "17:00", available: true },
  ];

  // Mock reviews
  const reviews = [
    {
      id: 1,
      name: "שרה כ.",
      rating: 5,
      date: "לפני שבוע",
      text: "רונית היא מטפלת מדהימה! הילד שלי עשה התקדמות משמעותית תוך חודשיים בלבד. ממליצה בחום!",
    },
    {
      id: 2,
      name: "דוד מ.",
      rating: 5,
      date: "לפני חודש",
      text: "גישה מקצועית וחמה. רואים שהיא אוהבת את העבודה שלה. התוצאות מדברות בעד עצמן.",
    },
    {
      id: 3,
      name: "מיכל א.",
      rating: 4,
      date: "לפני חודשיים",
      text: "מרוצים מאוד מהטיפול. המיקום נוח והמרפאה נעימה. השיפור בהגייה של הילד ניכר.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>{therapist.name} - {therapist.professionLabel} | TherapyConnect</title>
        <meta
          name="description"
          content={`${therapist.name}, ${therapist.professionLabel} ב${therapist.city}. ${therapist.yearsExperience} שנות ניסיון. דירוג ${therapist.rating} מתוך 5.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
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
                    <img
                      src={therapist.avatar}
                      alt={therapist.name}
                      className="w-32 h-32 rounded-2xl object-cover ring-4 ring-card shadow-lg"
                    />
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
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                          {therapist.name}
                        </h1>
                        <p className="text-lg text-primary font-medium mt-1">
                          {therapist.professionLabel}
                        </p>

                        {/* Quick Info */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-accent text-accent" />
                            <span className="font-semibold text-foreground">
                              {therapist.rating}
                            </span>
                            <span>({therapist.reviewCount} ביקורות)</span>
                          </div>
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

                {/* Reviews */}
                <div className="bg-card rounded-2xl shadow-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      ביקורות ({therapist.reviewCount})
                    </h2>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-accent text-accent" />
                      <span className="font-bold text-foreground">{therapist.rating}</span>
                      <span className="text-muted-foreground">מתוך 5</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-border last:border-0 pb-4 last:pb-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <span className="font-semibold text-muted-foreground">
                                {review.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{review.name}</p>
                              <p className="text-xs text-muted-foreground">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-accent text-accent"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">{review.text}</p>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    הצג את כל הביקורות
                  </Button>
                </div>
              </div>

              {/* Right Column - Booking */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl shadow-card p-6 sticky top-24">
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
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((slot) => (
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
                    </div>
                  )}

                  {/* Session Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Clock className="w-4 h-4" />
                    <span>משך הטיפול: {therapist.sessionDuration} דקות</span>
                  </div>

                  {/* Book Button */}
                  <Button
                    variant="gradient"
                    size="xl"
                    className="w-full"
                    disabled={!selectedDate || !selectedTime}
                  >
                    {therapist.instantBooking ? "הזמן עכשיו" : "בקש תור"}
                  </Button>

                  {therapist.instantBooking && (
                    <p className="text-xs text-center text-secondary mt-3 flex items-center justify-center gap-1">
                      <Zap className="w-3 h-3" />
                      התור יאושר מיידית
                    </p>
                  )}

                  {/* Contact */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 ml-2" />
                      שלח הודעה
                    </Button>
                  </div>
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

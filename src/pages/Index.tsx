import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SearchResults from "@/components/SearchResults";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Therapist, professionOptions } from "@/data/therapists";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedProfession, setSelectedProfession] = useState("");
  const [location, setLocation] = useState("");
  const [therapistName, setTherapistName] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const { data: therapistsData, error: therapistsError } = await supabase
        .from("therapists")
        .select("*")
        .eq("is_active", true);

      if (therapistsError) throw therapistsError;

      if (!therapistsData || therapistsData.length === 0) {
        setTherapists([]);
        setLoading(false);
        return;
      }

      const userIds = therapistsData.map((t) => t.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Fetch all schedules for these therapists
      const { data: schedulesData } = await supabase
        .from("therapist_schedules")
        .select("*")
        .in("therapist_id", therapistsData.map(t => t.id));

      const mappedTherapists: Therapist[] = therapistsData.map((t) => {
        const profile = profilesData?.find((p) => p.user_id === t.user_id);
        const schedule = schedulesData?.find((s) => s.therapist_id === t.id);
        const professionLabel =
          professionOptions.find((p) => p.value === t.profession)?.label ||
          t.profession;

        return {
          id: t.id,
          name: profile?.full_name || "מטפל",
          profession: t.profession as any, // Cast to specific enum type
          professionLabel,
          avatar: t.avatar_url || undefined,
          yearsExperience: t.years_experience || 0,
          city: t.city,
          address: t.address || undefined,
          distance: 0, // Placeholder as we don't calculate distance yet
          sessionDuration: t.session_duration_minutes || 45,
          specializations: t.specializations || [],
          availabilityStatus: t.available_today
            ? "available_full"
            : "available_partial", // Approximation
          availabilityText: t.available_today ? "זמין היום" : "זמין",
          bio: t.bio || "",
          homeVisits: t.home_visits || false,
          acceptsBtl: t.accepts_btl || false,
          healthFunds: t.health_funds || [],
          phoneNumber: profile?.phone || "",
          availableToday: t.available_today || false,
          instantBooking: t.instant_booking || false,
          pricePerSession: t.price_per_session || 0,
          targetAudience: t.target_audience || [],
          weeklySchedule: (schedule?.weekly_schedule as any) || (t.weekly_schedule as any),
        };
      });

      setTherapists(mappedTherapists);
    } catch (error) {
      console.error("Error fetching therapists:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת נתונים",
        description: "לא ניתן היה לטעון את רשימת המטפלים",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setShowResults(true);
    // Scroll to results after a brief delay
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Filter therapists based on search
  const filteredTherapists = therapists.filter((t) => {
    if (selectedProfession && t.profession !== selectedProfession) return false;
    if (location && !t.city.includes(location) && !(t.address || "").includes(location))
      return false;
    if (therapistName && !t.name.includes(therapistName)) return false;
    return true;
  });

  const searchQuery =
    [
      selectedProfession
        ? professionOptions.find((p) => p.value === selectedProfession)?.label
        : "",
      location,
    ]
      .filter(Boolean)
      .join(" ב") || "";

  return (
    <>
      <Helmet>
        <title>TherapyConnect - מצאו מטפלים פרה-רפואיים מובילים</title>
        <meta
          name="description"
          content="הפלטפורמה המובילה בישראל לחיבור הורים עם קלינאי תקשורת, פיזיותרפיסטים ומרפאים בעיסוק. חיפוש קל, הזמנת תור מהירה."
        />
      </Helmet>

      <div className="min-h-screen bg-background text-right" dir="rtl">
        <Header />

        <main>
          <HeroSection
            selectedProfession={selectedProfession}
            setSelectedProfession={setSelectedProfession}
            location={location}
            setLocation={setLocation}
            therapistName={therapistName}
            setTherapistName={setTherapistName}
            onSearch={handleSearch}
          />

          {showResults && (
            <div ref={resultsRef}>
              <SearchResults
                therapists={filteredTherapists}
                searchQuery={searchQuery}
              />
            </div>
          )}

          <FeaturesSection />
          <CTASection />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;

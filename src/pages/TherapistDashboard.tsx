import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Plus,
  Trash2,
  Pencil,
  MapPin,
  Globe,
  Building2,
  Plane,
  Check,
  ChevronsUpDown,
  Image as ImageIcon,
  X,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { israelCities } from "@/data/cities";
import {
  Therapist,
  specializationOptions,
  professionOptions,
  specializationsByProfession,
  Profession,
  AvailabilityStatus,
  WeeklySchedule,
  generateEmptySchedule,
  daysOfWeek,
  timeRangeOptions,
} from "@/data/therapists";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AvailabilitySettings } from "@/components/AvailabilitySettings";
import { Helmet } from "react-helmet";

interface Appointment {
  id: string;
  patientName: string;
  patientAge: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const AppointmentCard = ({
  appointment,
  onApprove,
  onDecline
}: {
  appointment: Appointment;
  onApprove?: (id: string) => void;
  onDecline?: (id: string) => void;
}) => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {appointment.patientName.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{appointment.patientName}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {appointment.time}
            </span>
            {appointment.notes && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {appointment.notes}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {appointment.status === 'pending' && onApprove && onDecline ? (
          <>
            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive/20 h-8" onClick={() => onDecline(appointment.id)}>
              סירוב
            </Button>
            <Button size="sm" className="h-8" onClick={() => onApprove(appointment.id)}>
              אישור
            </Button>
          </>
        ) : (
          <Badge
            variant="outline"
            className={cn(
              "px-2.5 py-0.5",
              appointment.status === 'confirmed' && "text-green-600 bg-green-50 border-green-200",
              appointment.status === 'completed' && "text-blue-600 bg-blue-50 border-blue-200",
              appointment.status === 'cancelled' && "text-muted-foreground bg-muted border-muted-foreground/20",
              appointment.status === 'pending' && "ממתין"
            )}
          >
            {appointment.status === 'confirmed' && "מאושר"}
            {appointment.status === 'completed' && "הושלם"}
            {appointment.status === 'cancelled' && "בוטל"}
            {appointment.status === 'pending' && "ממתין"}
          </Badge>
        )}
      </div>
    </div>
  );
};

const TherapistDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("today");

  const [profile, setProfile] = useState({
    name: "",
    profession: "speech_therapy" as Profession,
    professionLabel: "",
    yearsExperience: 0,
    sessionDuration: 45,
    city: "",
    address: "",
    bio: "",
    education: "",
    licenseNumber: "",
    additionalPhoneNumber: "",
    website: "",
    availabilityStatus: "available_partial" as AvailabilityStatus,
    availabilityText: "",
    specializations: [] as string[],
    phoneNumber: "",
    weeklySchedule: generateEmptySchedule(),
    hasHealthFundAgreement: "no",
    healthFunds: [] as string[],
    hasPrivateInsuranceAgreement: "no",
    privateInsuranceName: "",
    profileImage: null as string | null,
  });

  // Local state for address handling
  const [isAbroad, setIsAbroad] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [citySelection, setCitySelection] = useState("");
  const [openCitySelect, setOpenCitySelect] = useState(false);
  const [streetAddress, setStreetAddress] = useState("");
  const [abroadCity, setAbroadCity] = useState("");
  const [abroadCountry, setAbroadCountry] = useState("");

  const [customSpecs, setCustomSpecs] = useState<string[]>([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Load profile from Supabase
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        // Fetch therapist data
        const { data: therapistData } = await supabase
          .from("therapists")
          .select("*")
          .eq("user_id", user.id)
          .single();

        // Fetch availability slots and general info from the NEW normalized tables
        const { data: slotData } = await (supabase as any)
          .from("therapist_availability_slots")
          .select("*")
          .eq("therapist_id", therapistData?.id);

        const { data: infoData } = await (supabase as any)
          .from("therapist_availability_info")
          .select("*")
          .eq("therapist_id", therapistData?.id)
          .maybeSingle();

        if (profileData && therapistData) {
          // Reconstruct the WeeklySchedule object from the normalized slots
          let loadedSchedule = generateEmptySchedule();
          if (slotData && slotData.length > 0) {
            loadedSchedule = loadedSchedule.map(day => {
              const daySlots = slotData.filter(s => s.day_of_week === day.day);
              if (daySlots.length > 0) {
                return {
                  ...day,
                  active: true,
                  timeRanges: daySlots.map(s => s.time_range),
                  notes: daySlots[0]?.notes || ""
                };
              }
              return day;
            });
          }

          setProfile(prev => ({
            ...prev,
            name: profileData.full_name || prev.name,
            phoneNumber: profileData.phone || prev.phoneNumber,

            profession: (therapistData.profession as Profession) || prev.profession,
            yearsExperience: therapistData.years_experience || prev.yearsExperience,
            city: therapistData.city || prev.city,
            address: therapistData.address || prev.address,
            bio: therapistData.bio || prev.bio,
            licenseNumber: therapistData.license_number || prev.licenseNumber,
            profileImage: therapistData.avatar_url || prev.profileImage,
            sessionDuration: therapistData.session_duration_minutes || prev.sessionDuration,
            specializations: therapistData.specializations || prev.specializations,
            healthFunds: therapistData.health_funds || prev.healthFunds,
            hasHealthFundAgreement: (therapistData.health_funds && therapistData.health_funds.length > 0) ? "yes" : "no",
            weeklySchedule: loadedSchedule,
            availabilityText: infoData?.free_text || "",
          }));

          // Set local state for address
          if (therapistData.city) {
            setCitySelection(therapistData.city);
            if (therapistData.address && therapistData.address.includes(therapistData.city)) {
              // Try to extract street
              const parts = therapistData.address.split(',');
              if (parts.length > 0) {
                setStreetAddress(parts[0].trim());
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    loadProfile();
  }, []);

  // Sync custom specs from profile on load or when profession changes
  useEffect(() => {
    if (profile.profession) {
      const predefined = (specializationsByProfession[profile.profession as Profession] || []).map(o => o.label);
      const currentCustom = profile.specializations.filter(s => !predefined.includes(s) && s !== "אחר");

      if (currentCustom.length > 0) {
        setCustomSpecs(currentCustom);
        setIsOtherSelected(true);
      } else if (profile.specializations.includes("אחר")) {
        setCustomSpecs([""]);
        setIsOtherSelected(true);
      } else {
        setCustomSpecs([]);
        setIsOtherSelected(false);
      }
    }
  }, [profile.profession]);

  // Update address and city when local address state changes
  useEffect(() => {
    if (isAbroad) {
      const fullAddress = abroadCity && abroadCountry ? `${abroadCity}, ${abroadCountry}` : "חו\"ל";
      setProfile(prev => ({ ...prev, city: abroadCity || "חו\"ל", address: fullAddress }));
    } else {
      const fullAddress = streetAddress && citySelection ? `${streetAddress}, ${citySelection}` : citySelection;
      setProfile(prev => ({ ...prev, city: citySelection, address: fullAddress }));
    }
  }, [isAbroad, citySelection, streetAddress, abroadCity, abroadCountry]);

  const handleCustomSpecChange = (index: number, value: string) => {
    const newCustomSpecs = [...customSpecs];
    newCustomSpecs[index] = value;
    setCustomSpecs(newCustomSpecs);

    // Update profile
    const predefined = (specializationsByProfession[profile.profession as Profession] || []).map(o => o.label);
    const currentPredefined = profile.specializations.filter(s => predefined.includes(s));

    // Filter out empty strings when saving to profile
    const validCustomSpecs = newCustomSpecs.filter(s => s.trim() !== "");

    let newSpecializations = [...currentPredefined];
    if (isOtherSelected) {
      newSpecializations.push("אחר");
      newSpecializations = [...newSpecializations, ...validCustomSpecs];
    }

    setProfile(prev => ({ ...prev, specializations: newSpecializations }));
  };

  const addCustomSpecField = () => {
    setCustomSpecs(prev => [...prev, ""]);
  };

  const removeCustomSpecField = (index: number) => {
    const newCustomSpecs = customSpecs.filter((_, i) => i !== index);
    setCustomSpecs(newCustomSpecs);

    // Update profile immediately
    const predefined = (specializationsByProfession[profile.profession as Profession] || []).map(o => o.label);
    const currentPredefined = profile.specializations.filter(s => predefined.includes(s));
    const validCustomSpecs = newCustomSpecs.filter(s => s.trim() !== "");

    let newSpecializations = [...currentPredefined];
    if (isOtherSelected) {
      newSpecializations.push("אחר");
      newSpecializations = [...newSpecializations, ...validCustomSpecs];
    }

    setProfile(prev => ({ ...prev, specializations: newSpecializations }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfile(prev => ({ ...prev, profileImage: null }));
  };

  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("משתמש לא מחובר");
      }

      console.log("Saving profile for user:", user.id);

      // 1. Update basic profile info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.name,
          phone: profile.phoneNumber,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Update therapist basic info (removed cursed availability_text)
      const { data: therapistData, error: therapistError } = await supabase
        .from('therapists')
        .upsert({
          user_id: user.id,
          profession: profile.profession,
          city: profile.city || '',
          address: profile.address,
          bio: profile.bio,
          license_number: profile.licenseNumber,
          years_experience: profile.yearsExperience,
          specializations: profile.specializations,
          session_duration_minutes: profile.sessionDuration,
          health_funds: profile.healthFunds,
          avatar_url: profile.profileImage,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select('id')
        .single();

      if (therapistError) throw therapistError;

      const therapistId = therapistData.id;

      // 3. Update Availability Info (separate table to avoid cache issue)
      const { error: infoError } = await (supabase as any)
        .from('therapist_availability_info')
        .upsert({
          therapist_id: therapistId,
          free_text: profile.availabilityText,
          updated_at: new Date().toISOString()
        }, { onConflict: 'therapist_id' });

      if (infoError) throw infoError;

      // 4. Update Availability Slots (Delete old, insert new)

      // Wipe existing
      const { error: deleteError } = await (supabase as any)
        .from('therapist_availability_slots')
        .delete()
        .eq('therapist_id', therapistId);

      if (deleteError) throw deleteError;

      // Prepare new slots
      const newSlots = [];
      for (const day of profile.weeklySchedule) {
        if (day.active && day.timeRanges.length > 0) {
          for (const range of day.timeRanges) {
            newSlots.push({
              therapist_id: therapistId,
              day_of_week: day.day,
              time_range: range,
              notes: day.notes
            });
          }
        }
      }

      // Bulk insert
      if (newSlots.length > 0) {
        const { error: insertError } = await (supabase as any)
          .from('therapist_availability_slots')
          .insert(newSlots);
        if (insertError) throw insertError;
      }

      toast({
        title: "הפרופיל עודכן בהצלחה",
        description: "השינויים נשמרו במערכת",
      });
    } catch (error: any) {
      console.error("Save failed:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בשמירת הפרופיל",
        description: error.message || "אירעה שגיאה בחיבור לשרת",
      });
    }
  };

  const toggleProfileSelection = (field: 'specializations', value: string) => {
    if (value === 'אחר') {
      const newIsOtherSelected = !isOtherSelected;
      setIsOtherSelected(newIsOtherSelected);

      if (newIsOtherSelected) {
        // If turning ON, add "אחר" and initialize custom specs if empty
        if (customSpecs.length === 0) setCustomSpecs([""]);
        setProfile(prev => ({
          ...prev,
          specializations: [...prev.specializations, "אחר"]
        }));
      } else {
        // If turning OFF, remove "אחר" and all custom specs from profile
        const predefined = (specializationsByProfession[profile.profession as Profession] || []).map(o => o.label);
        setProfile(prev => ({
          ...prev,
          specializations: prev.specializations.filter(s => predefined.includes(s))
        }));
        setCustomSpecs([]);
      }
      return;
    }

    setProfile(prev => {
      const current = prev[field] as string[];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const stats = {
    todayAppointments: 0,
    pendingRequests: 0,
    monthlyAppointments: 0,
    totalVisits: parseInt(localStorage.getItem("total_system_visits") || "0"),
  };

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const todayAppointments = appointments.filter(
    (apt) => apt.date === "2025-01-01" && apt.status !== "cancelled"
  );
  const pendingAppointments = appointments.filter((apt) => apt.status === "pending");
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "confirmed" && apt.date >= "2025-01-01"
  );

  const handleApprove = (id: string) => {
    setAppointments(prev => prev.map(apt =>
      apt.id === id ? { ...apt, status: 'confirmed' } : apt
    ));
    toast({
      title: "התור אושר",
      description: "הודעה נשלחה למטופל",
    });
  };

  const handleDecline = (id: string) => {
    setAppointments(prev => prev.map(apt =>
      apt.id === id ? { ...apt, status: 'cancelled' } : apt
    ));
    toast({
      title: "התור נדחה",
      description: "הודעה נשלחה למטופל",
    });
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
            <AlertCircle className="w-3 h-3 ml-1" />
            ממתין לאישור
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/10">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            מאושר
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            הושלם
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
            <XCircle className="w-3 h-3 ml-1" />
            בוטל
          </Badge>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>לוח בקרה - TherapyConnect</title>
        <meta name="description" content="ניהול תורים וזמינות למטפלים" />
      </Helmet>

      <AvailabilitySettings
        isOpen={isAvailabilityOpen}
        onClose={() => setIsAvailabilityOpen(false)}
        schedule={profile.weeklySchedule}
        onSave={async (newSchedule) => {
          setProfile(prev => ({ ...prev, weeklySchedule: newSchedule }));

          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              // Get therapist ID first
              const { data: therapist } = await supabase
                .from('therapists')
                .select('id')
                .eq('user_id', user.id)
                .single();

              if (therapist) {
                // Upsert to dedicated schedule table
                const { error } = await supabase
                  .from('therapist_schedules')
                  .upsert({
                    therapist_id: therapist.id,
                    weekly_schedule: newSchedule as unknown as any,
                    availability_text: profile.availabilityText,
                    updated_at: new Date().toISOString()
                  }, { onConflict: 'therapist_id' });

                if (error) {
                  console.error('Error saving to therapist_schedules:', error);
                  // Fallback to updating therapists table directly if new table doesn't exist
                  const { error: fallbackError } = await supabase
                    .from('therapists')
                    .update({ weekly_schedule: newSchedule as unknown as any })
                    .eq('user_id', user.id);

                  if (fallbackError) throw fallbackError;
                }

                toast({
                  title: "היומן נשמר בהצלחה",
                  description: "השינויים בזמינות עודכנו במערכת"
                });
              }
            }
          } catch (error) {
            console.error('Error saving schedule:', error);
            toast({
              variant: "destructive",
              title: "שגיאה בשמירת היומן",
              description: "נא לנסות שוב או לשמור דרך הכפתור הראשי"
            });
          }
        }}
      />

      <div className="min-h-screen bg-background text-right" dir="rtl">
        <Header />

        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                שלום, {profile.name || user?.email?.split('@')[0]} 👋
              </h1>
              <p className="text-muted-foreground">
                הנה סיכום הפעילות שלך להיום
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.todayAppointments}
                    </p>
                    <p className="text-sm text-muted-foreground">תורים היום</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.pendingRequests}
                    </p>
                    <p className="text-sm text-muted-foreground">ממתינים לאישור</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.monthlyAppointments}
                    </p>
                    <p className="text-sm text-muted-foreground">החודש</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalVisits}
                    </p>
                    <p className="text-sm text-muted-foreground">כניסות למערכת</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-muted/40 p-1.5 h-auto rounded-xl w-full flex-wrap justify-start gap-2">
                <TabsTrigger
                  value="today"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 py-2.5 transition-all duration-200 flex-1 md:flex-none border border-transparent data-[state=active]:border-border/50 justify-start"
                >
                  <Calendar className="w-4 h-4 ml-2 text-blue-500" />
                  היום ({todayAppointments.length})
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 py-2.5 transition-all duration-200 flex-1 md:flex-none border border-transparent data-[state=active]:border-border/50 justify-start"
                >
                  <AlertCircle className="w-4 h-4 ml-2 text-amber-500" />
                  ממתינים ({pendingAppointments.length})
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 py-2.5 transition-all duration-200 flex-1 md:flex-none border border-transparent data-[state=active]:border-border/50 justify-start"
                >
                  <Clock className="w-4 h-4 ml-2 text-purple-500" />
                  קרובים
                </TabsTrigger>
                <TabsTrigger
                  value="availability"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 py-2.5 transition-all duration-200 flex-1 md:flex-none border border-transparent data-[state=active]:border-border/50 justify-start"
                >
                  <Calendar className="w-4 h-4 ml-2 text-indigo-500" />
                  זמינות
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-6 py-2.5 transition-all duration-200 flex-1 md:flex-none border border-transparent data-[state=active]:border-border/50 justify-start"
                >
                  <Users className="w-4 h-4 ml-2 text-teal-500" />
                  פרופיל
                </TabsTrigger>
              </TabsList>

              {/* Today's Appointments */}
              <TabsContent value="today" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">תורים להיום</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("he-IL", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {todayAppointments.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">אין תורים מתוכננים להיום</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map((apt) => (
                      <AppointmentCard key={apt.id} appointment={apt} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Pending Requests */}
              <TabsContent value="pending" className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">בקשות ממתינות</h2>

                {pendingAppointments.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-4" />
                    <p className="text-muted-foreground">אין בקשות ממתינות</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingAppointments.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        onApprove={handleApprove}
                        onDecline={handleDecline}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Upcoming Appointments */}
              <TabsContent value="upcoming" className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">תורים קרובים</h2>

                {upcomingAppointments.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">אין תורים מאושרים קרובים</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((apt) => (
                      <AppointmentCard key={apt.id} appointment={apt} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Availability Management */}
              <TabsContent value="availability" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">ניהול זמינות</h2>
                  <Button onClick={() => setIsAvailabilityOpen(true)}>
                    <Calendar className="w-4 h-4 ml-2" />
                    ערוך זמינות
                  </Button>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">הגדרות זמינות נוכחיות</h3>
                      <p className="text-muted-foreground">
                        ניהול שעות פעילות
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {profile.weeklySchedule.map((day, index) => {
                      const dayLabel = daysOfWeek.find(d => d.id === day.day)?.label || day.day;
                      return (
                        <div key={day.day} className={cn("p-4 rounded-lg border", day.active ? "bg-background border-primary/20" : "bg-muted/30 border-border")}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{dayLabel}</span>
                            {day.active ? (
                              <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">פעיל</Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">לא פעיל</Badge>
                            )}
                          </div>
                          {day.active && (
                            <div className="text-sm text-muted-foreground">
                              {day.slots.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {day.slots.map(s => (
                                    <span key={s} className="bg-secondary/10 px-1.5 py-0.5 rounded text-xs">{s}</span>
                                  ))}
                                </div>
                              ) : "אין תורים מוגדרים"}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Profile Management */}
              <TabsContent value="profile" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">עריכת פרופיל</h2>
                </div>

                <div className="bg-card rounded-xl border border-border p-6 space-y-8">

                  {/* Profile Image */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">תמונת פרופיל</Label>
                    <div className="flex items-start gap-4">
                      <div className="flex-1 max-w-sm">
                        <div className="relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg border-muted-foreground/25 hover:border-primary/50 transition-colors bg-muted/5">
                          {profile.profileImage ? (
                            <div className="relative w-full h-full p-2">
                              <img
                                src={profile.profileImage}
                                alt="Profile Preview"
                                className="w-full h-full object-contain rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 p-1.5 bg-destructive/90 text-destructive-foreground rounded-full hover:bg-destructive transition-colors shadow-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor="image-upload"
                              className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                            >
                              <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground">לחץ להעלאת תמונה</span>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">שם מלא</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>מקצוע</Label>
                      <div className="flex flex-wrap gap-2">
                        {professionOptions.map((opt) => (
                          <Button
                            key={opt.value}
                            type="button"
                            variant={profile.profession === opt.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setProfile({
                              ...profile,
                              profession: opt.value as Profession,
                              professionLabel: opt.label,
                              specializations: []
                            })}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">טלפון נייד</Label>
                      <Input
                        id="phone"
                        value={profile.phoneNumber}
                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="additionalPhone">טלפון נוסף</Label>
                      <Input
                        id="additionalPhone"
                        value={profile.additionalPhoneNumber}
                        onChange={(e) => setProfile({ ...profile, additionalPhoneNumber: e.target.value })}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">אתר אינטרנט</Label>
                      <Input
                        id="website"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        placeholder="https://www.example.com"
                        className="text-right"
                      />
                    </div>

                    {/* Address Section */}
                    <div className="space-y-2 md:col-span-2 bg-muted/30 p-4 rounded-xl">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            כתובת הקליניקה
                          </Label>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="abroad-mode" className="text-sm cursor-pointer">קליניקה בחו"ל</Label>
                            <Switch
                              id="abroad-mode"
                              checked={isAbroad}
                              onCheckedChange={setIsAbroad}
                            />
                          </div>
                        </div>

                        {isAbroad ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                              <Label>מדינה</Label>
                              <div className="relative">
                                <Globe className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="הכנס מדינה"
                                  value={abroadCountry}
                                  onChange={(e) => setAbroadCountry(e.target.value)}
                                  className="pr-9 text-right"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>עיר</Label>
                              <div className="relative">
                                <Building2 className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="הכנס עיר"
                                  value={abroadCity}
                                  onChange={(e) => setAbroadCity(e.target.value)}
                                  className="pr-9 text-right"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            {/* Address Inputs - Swapped Order */}
                            <div className="space-y-2">
                              <Label>רחוב ומספר</Label>
                              <Input
                                placeholder="לדוגמה: הרצל 15"
                                value={streetAddress}
                                onChange={(e) => setStreetAddress(e.target.value)}
                                className="text-right"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>עיר/יישוב</Label>
                              <Popover open={openCitySelect} onOpenChange={setOpenCitySelect}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCitySelect}
                                    className="w-full justify-between"
                                  >
                                    {citySelection || "בחר עיר..."}
                                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                  <Command>
                                    <CommandInput placeholder="חפש עיר..." />
                                    <CommandList>
                                      <CommandEmpty>לא נמצאה עיר.</CommandEmpty>
                                      <CommandGroup>
                                        {israelCities.map((city) => (
                                          <CommandItem
                                            key={city}
                                            value={city}
                                            onSelect={(currentValue) => {
                                              setCitySelection(currentValue === citySelection ? "" : currentValue);
                                              setOpenCitySelect(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "ml-2 h-4 w-4",
                                                citySelection === city ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {city}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>


                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">שנות ניסיון</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={profile.yearsExperience}
                        onChange={(e) => setProfile({ ...profile, yearsExperience: Number(e.target.value) })}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">משך טיפול (דקות)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={profile.sessionDuration}
                        onChange={(e) => setProfile({ ...profile, sessionDuration: Number(e.target.value) })}
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="education">השכלה והכשרות</Label>
                      <Textarea
                        id="education"
                        placeholder="פרט/י את התארים האקדמיים, לימודי תעודה והשתלמויות רלוונטיות..."
                        value={profile.education}
                        onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                        className="min-h-[80px] text-right"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="licenseNumber">מספר רישיון</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="מספר רישיון משרד הבריאות / איגוד מקצועי"
                        value={profile.licenseNumber}
                        onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                        className="text-right"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">אודות</Label>
                    <Textarea
                      id="bio"
                      className="min-h-[100px] text-right"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>



                  {/* Specializations */}
                  <div className="space-y-3">
                    <Label>תחומי התמחות</Label>
                    <div className="flex flex-wrap gap-2">
                      {(specializationsByProfession[profile.profession] || []).map((spec) => (
                        <Button
                          key={spec.value}
                          type="button"
                          variant={profile.specializations.includes(spec.label) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleProfileSelection('specializations', spec.label)}
                        >
                          {spec.label}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant={profile.specializations.includes('אחר') ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleProfileSelection('specializations', 'אחר')}
                      >
                        אחר
                      </Button>
                    </div>

                    {isOtherSelected && (
                      <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-2 bg-muted/30 p-4 rounded-xl">
                        <Label className="text-xs text-muted-foreground">פרט תחומי התמחות נוספים:</Label>
                        {customSpecs.map((spec, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <Input
                              placeholder="הקלד תחום התמחות..."
                              value={spec}
                              onChange={(e) => handleCustomSpecChange(index, e.target.value)}
                              className="h-9 text-right"
                            />
                            {index === customSpecs.length - 1 ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={addCustomSpecField}
                                className="h-9 w-9 shrink-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCustomSpecField(index)}
                                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Insurance Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      הסדרים וביטוחים
                    </h3>

                    <div className="space-y-2">
                      <Label>בהסדר עם קופת חולים</Label>
                      <RadioGroup
                        value={profile.hasHealthFundAgreement}
                        onValueChange={(val) => {
                          setProfile(prev => ({
                            ...prev,
                            hasHealthFundAgreement: val,
                            healthFunds: val === "no" ? [] : prev.healthFunds
                          }));
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="yes" id="hf-yes" />
                          <Label htmlFor="hf-yes" className="font-normal cursor-pointer">כן</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="no" id="hf-no" />
                          <Label htmlFor="hf-no" className="font-normal cursor-pointer">לא</Label>
                        </div>
                      </RadioGroup>

                      {profile.hasHealthFundAgreement === "yes" && (
                        <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-muted/30 rounded-lg animate-in fade-in slide-in-from-top-1">
                          {['מכבי', 'כללית', 'כללית מושלם', 'מאוחדת', 'לאומית'].map((fund) => (
                            <div key={fund} className="flex items-center space-x-2 space-x-reverse">
                              <Checkbox
                                id={`fund-${fund}`}
                                checked={profile.healthFunds.includes(fund)}
                                onCheckedChange={(checked) => {
                                  setProfile(prev => {
                                    const current = prev.healthFunds;
                                    const updated = checked
                                      ? [...current, fund]
                                      : current.filter(f => f !== fund);
                                    return { ...prev, healthFunds: updated };
                                  });
                                }}
                              />
                              <Label htmlFor={`fund-${fund}`} className="text-sm font-normal cursor-pointer">{fund}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>בהסדר עם ביטוח פרטי</Label>
                      <RadioGroup
                        value={profile.hasPrivateInsuranceAgreement}
                        onValueChange={(val) => {
                          setProfile(prev => ({
                            ...prev,
                            hasPrivateInsuranceAgreement: val,
                            privateInsuranceName: val === "no" ? "" : prev.privateInsuranceName
                          }));
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="yes" id="pi-yes" />
                          <Label htmlFor="pi-yes" className="font-normal cursor-pointer">כן</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="no" id="pi-no" />
                          <Label htmlFor="pi-no" className="font-normal cursor-pointer">לא</Label>
                        </div>
                      </RadioGroup>

                      {profile.hasPrivateInsuranceAgreement === "yes" && (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                          <Label htmlFor="insuranceName" className="text-xs text-muted-foreground mb-1.5 block">שם חברת הביטוח</Label>
                          <Input
                            id="insuranceName"
                            placeholder="הזן את שם חברת הביטוח..."
                            value={profile.privateInsuranceName}
                            onChange={(e) => setProfile({ ...profile, privateInsuranceName: e.target.value })}
                            className="text-right"
                          />
                        </div>
                      )}
                    </div>
                  </div>



                  {/* Availability */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="font-semibold text-lg">הגדרות זמינות</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label>סטטוס זמינות</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: 'available_full', label: 'זמינות מלאה', color: 'bg-green-500' },
                            { id: 'available_partial', label: 'זמינות חלקית', color: 'bg-yellow-500' },
                            { id: 'specific_hours', label: 'שעות ספציפיות', color: 'bg-blue-500' },
                            { id: 'waitlist', label: 'רשימת המתנה בלבד', color: 'bg-red-500' },
                          ].map((status) => (
                            <button
                              key={status.id}
                              type="button"
                              onClick={() => setProfile({ ...profile, availabilityStatus: status.id as any })}
                              className={cn(
                                "flex items-center w-full px-4 py-3 rounded-xl border transition-all text-right",
                                profile.availabilityStatus === status.id
                                  ? "border-primary bg-[#0EA5E9] text-white"
                                  : "border-border bg-muted/30 hover:bg-muted/50 text-foreground"
                              )}
                            >
                              <div className={cn("w-2 h-2 rounded-full ml-3", status.color, profile.availabilityStatus === status.id && "bg-white")} />
                              <span className="text-sm font-medium">{status.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {profile.availabilityStatus !== 'waitlist' && (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <Label>ימי פעילות</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                              {daysOfWeek.map((day) => {
                                const isDayActive = profile.weeklySchedule.find(d => d.day === day.id)?.active;
                                return (
                                  <div
                                    key={day.id}
                                    className={cn(
                                      "flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                                      isDayActive
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border bg-background hover:bg-muted/10 text-muted-foreground"
                                    )}
                                    onClick={() => {
                                      const newSchedule = profile.weeklySchedule.map(d =>
                                        d.day === day.id ? { ...d, active: !d.active } : d
                                      );
                                      setProfile({ ...profile, weeklySchedule: newSchedule });
                                    }}
                                  >
                                    <Checkbox
                                      id={`day-check-${day.id}`}
                                      checked={isDayActive}
                                      onCheckedChange={() => { }} // Controlled by div click
                                      className="data-[state=checked]:bg-primary pointer-events-none"
                                    />
                                    <Label htmlFor={`day-check-${day.id}`} className="text-sm font-medium cursor-pointer pointer-events-none">
                                      {day.label}
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label>שעות זמינות מועדפות (ניתן לסמן כמה)</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {timeRangeOptions.map((range) => {
                                const Icon = range.value === 'morning' ? Sun : range.value === 'afternoon' ? Sunset : Moon;
                                const isSelected = profile.weeklySchedule.some(day => day.active && day.timeRanges?.includes(range.value as any));

                                return (
                                  <div
                                    key={range.value}
                                    onClick={() => {
                                      const isCurrentlySelected = profile.weeklySchedule.some(day => day.active && day.timeRanges?.includes(range.value as any));
                                      const newSchedule = profile.weeklySchedule.map(day => {
                                        if (!day.active) return day; // Only affect active days

                                        const currentRanges = day.timeRanges || [];
                                        let newRanges;

                                        if (isCurrentlySelected) {
                                          newRanges = currentRanges.filter(r => r !== range.value);
                                        } else {
                                          if (!currentRanges.includes(range.value as any)) {
                                            newRanges = [...currentRanges, range.value as any];
                                          } else {
                                            newRanges = currentRanges;
                                          }
                                        }
                                        return { ...day, timeRanges: newRanges };
                                      });
                                      setProfile({ ...profile, weeklySchedule: newSchedule });
                                    }}
                                    className={cn(
                                      "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                                      profile.weeklySchedule.some(day => day.timeRanges?.includes(range.value as any))
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border bg-background hover:bg-muted/10 text-muted-foreground"
                                    )}
                                  >
                                    <Checkbox
                                      id={`range-check-${range.value}`}
                                      checked={profile.weeklySchedule.some(day => day.timeRanges?.includes(range.value as any))}
                                      onCheckedChange={() => { }} // Controlled by div click
                                      className="data-[state=checked]:bg-primary pointer-events-none"
                                    />
                                    <div className="flex flex-col flex-1 pointer-events-none">
                                      <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm font-semibold">{range.label}</span>
                                      </div>
                                      <span className="text-[11px] opacity-70 mt-0.5">{range.description}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              בחירה כאן תעדכן אוטומטית את כל ימי הפעילות שבחרת למעלה.
                            </p>
                          </div>

                          {profile.availabilityStatus !== 'available_full' && (
                            <div className="space-y-2">
                              <Label htmlFor="availabilityText">טקסט זמינות חופשי (אופציונלי)</Label>
                              <Input
                                id="availabilityText"
                                placeholder="לדוגמה: פנויה בימי ראשון בבוקר"
                                value={profile.availabilityText}
                                onChange={(e) => setProfile({ ...profile, availabilityText: e.target.value })}
                                className="text-right"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="sticky bottom-0 -mx-6 -mb-6 p-4 bg-background/95 backdrop-blur border-t border-border flex justify-end rounded-b-xl z-10 shadow-sm">
                    <Button onClick={handleSaveProfile} size="lg" className="w-full md:w-auto">
                      שמור שינויים
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TherapistDashboard;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, User, MapPin, Phone, Globe, Calendar as CalendarIcon, Building2, Plane, Plus, X, Check, ChevronsUpDown, Image as ImageIcon, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import {
  ageGroupOptions,
  professionOptions,
  specializationsByProfession,
  Profession,
  SchedulingMode,
  generateEmptySchedule,
  AvailabilityStatus,
} from "@/data/therapists";
import { israelCities } from "@/data/cities";

const emailSchema = z.string().email("כתובת מייל לא תקינה");
const passwordSchema = z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים");

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Local state for address handling
  const [isAbroad, setIsAbroad] = useState(false);
  const [citySelection, setCitySelection] = useState("");
  const [openCitySelect, setOpenCitySelect] = useState(false);
  const [streetAddress, setStreetAddress] = useState("");
  const [abroadCity, setAbroadCity] = useState("");
  const [abroadCountry, setAbroadCountry] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    additionalPhoneNumber: "",
    website: "",
    aboutMe: "",
    education: "",
    licenseNumber: "",
    treatsRemotely: false,
    userType: "therapist" as "therapist",
    address: "",
    city: "",
    profession: "" as Profession | "",
    schedulingMode: "slots" as SchedulingMode,
    targetAudience: [] as string[],
    specializations: [] as string[],
    hasHealthFundAgreement: "no",
    healthFunds: [] as string[],
    hasPrivateInsuranceAgreement: "no",
    privateInsuranceName: "",
    profileImage: null as string | null,
    yearsExperience: "" as string | number,
    availabilityStatus: "available_partial" as AvailabilityStatus,
    availabilityText: "",
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
    phoneNumber?: string;
    yearsExperience?: string;
  }>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Update address and city when local address state changes
  useEffect(() => {
    if (isAbroad) {
      const fullAddress = abroadCity && abroadCountry ? `${abroadCity}, ${abroadCountry}` : "חו\"ל";
      setFormData(prev => ({ ...prev, city: abroadCity || "חו\"ל", address: fullAddress }));
    } else {
      const fullAddress = streetAddress && citySelection ? `${streetAddress}, ${citySelection}` : citySelection;
      setFormData(prev => ({ ...prev, city: citySelection, address: fullAddress }));
    }
  }, [isAbroad, citySelection, streetAddress, abroadCity, abroadCountry]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate years of experience
    if (!isLogin && formData.userType === 'therapist') {
      const exp = Number(formData.yearsExperience);
      if (formData.yearsExperience === "" || isNaN(exp) || !Number.isInteger(exp) || exp < 0 || exp > 99) {
        // We'll add a new error field dynamically or just handle it in UI
        // But to be consistent with existing error handling:
        (newErrors as any).yearsExperience = "נא להזין מספר שנים תקין (0-99)";
      }
    }

    const emailResult = emailSchema.safeParse(formData.email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(formData.password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin && !formData.fullName.trim()) {
      newErrors.fullName = "שם מלא הוא שדה חובה";
    }

    if (!isLogin && !formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "מספר טלפון הוא שדה חובה";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              variant: "destructive",
              title: "שגיאת התחברות",
              description: "האימייל או הסיסמה אינם נכונים",
            });
          } else {
            toast({
              variant: "destructive",
              title: "שגיאה",
              description: error.message,
            });
          }
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              user_type: formData.userType,
              address: formData.address,
              city: formData.city,
              profession: formData.profession,
              scheduling_mode: formData.schedulingMode,
              target_audience: formData.targetAudience,
              specializations: formData.specializations,
              phone_number: formData.phoneNumber,
              additional_phone_number: formData.additionalPhoneNumber,
              website: formData.website,
              about_me: formData.aboutMe,
              education: formData.education,
              years_experience: Number(formData.yearsExperience),
              license_number: formData.licenseNumber,
              treats_remotely: formData.treatsRemotely,
              // We'll save schedule later in dashboard or via trigger if possible
              // weekly_schedule: formData.weeklySchedule, 
              has_health_fund_agreement: formData.hasHealthFundAgreement,
              health_funds: formData.healthFunds,
              has_private_insurance_agreement: formData.hasPrivateInsuranceAgreement,
              private_insurance_name: formData.privateInsuranceName,
              profile_image: formData.profileImage,
              // availability_status: formData.availabilityStatus,
              // availability_text: formData.availabilityText,
            },
          },
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "שגיאה בהרשמה",
            description: error.message,
          });
        } else {
          toast({
            title: "הרשמה בוצעה בהצלחה",
            description: "אנא בדקו את המייל לאימות החשבון",
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בלתי צפויה",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetSchedulingMode = (mode: SchedulingMode) => {
    setFormData(prev => ({ ...prev, schedulingMode: mode }));
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const [customSpecs, setCustomSpecs] = useState<string[]>([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  // Sync custom specs from formData on load or when profession changes (to reset if needed)
  useEffect(() => {
    if (formData.profession) {
      const predefined = (specializationsByProfession[formData.profession as Profession] || []).map(o => o.label);
      const currentCustom = formData.specializations.filter(s => !predefined.includes(s) && s !== "אחר");
      
      if (currentCustom.length > 0) {
        setCustomSpecs(currentCustom);
        setIsOtherSelected(true);
      } else if (formData.specializations.includes("אחר")) {
        setCustomSpecs([""]);
        setIsOtherSelected(true);
      } else {
        setCustomSpecs([]);
        setIsOtherSelected(false);
      }
    }
  }, [formData.profession]);

  const handleCustomSpecChange = (index: number, value: string) => {
    const newCustomSpecs = [...customSpecs];
    newCustomSpecs[index] = value;
    setCustomSpecs(newCustomSpecs);
    
    // Update formData
    const predefined = (specializationsByProfession[formData.profession as Profession] || []).map(o => o.label);
    const currentPredefined = formData.specializations.filter(s => predefined.includes(s));
    
    // Filter out empty strings when saving to formData, but keep them in local state for UI
    const validCustomSpecs = newCustomSpecs.filter(s => s.trim() !== "");
    
    let newSpecializations = [...currentPredefined];
    if (isOtherSelected) {
      newSpecializations.push("אחר");
      newSpecializations = [...newSpecializations, ...validCustomSpecs];
    }
    
    setFormData(prev => ({ ...prev, specializations: newSpecializations }));
  };

  const addCustomSpecField = () => {
    setCustomSpecs(prev => [...prev, ""]);
  };

  const removeCustomSpecField = (index: number) => {
    const newCustomSpecs = customSpecs.filter((_, i) => i !== index);
    setCustomSpecs(newCustomSpecs);
    
    // Update formData immediately
    const predefined = (specializationsByProfession[formData.profession as Profession] || []).map(o => o.label);
    const currentPredefined = formData.specializations.filter(s => predefined.includes(s));
    const validCustomSpecs = newCustomSpecs.filter(s => s.trim() !== "");
    
    let newSpecializations = [...currentPredefined];
    if (isOtherSelected) {
      newSpecializations.push("אחר");
      newSpecializations = [...newSpecializations, ...validCustomSpecs];
    }
    
    setFormData(prev => ({ ...prev, specializations: newSpecializations }));
  };

  const toggleSelection = (field: 'targetAudience' | 'specializations', value: string) => {
    if (field === 'specializations' && value === 'אחר') {
      const newIsOtherSelected = !isOtherSelected;
      setIsOtherSelected(newIsOtherSelected);
      
      if (newIsOtherSelected) {
        // If turning ON, add "אחר" and initialize custom specs if empty
        if (customSpecs.length === 0) setCustomSpecs([""]);
        setFormData(prev => ({
          ...prev,
          specializations: [...prev.specializations, "אחר"]
        }));
      } else {
        // If turning OFF, remove "אחר" and all custom specs from formData
        const predefined = (specializationsByProfession[formData.profession as Profession] || []).map(o => o.label);
        setFormData(prev => ({
          ...prev,
          specializations: prev.specializations.filter(s => predefined.includes(s))
        }));
        setCustomSpecs([]);
      }
      return;
    }

    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, profileImage: null }));
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? "התחברות" : "הרשמה"} | TherapyConnect</title>
      </Helmet>
      
      <AvailabilitySettings 
        isOpen={isAvailabilityOpen}
        onClose={() => setIsAvailabilityOpen(false)}
        mode={formData.schedulingMode}
        schedule={formData.weeklySchedule}
        onSave={(newSchedule) => setFormData(prev => ({ ...prev, weeklySchedule: newSchedule }))}
      />

      <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-50/50" dir="rtl">
        <div className="w-full max-w-md mx-auto">
           
           {/* Left Column: Form */}
           <div className="space-y-6">
             <Card className="shadow-lg border-emerald-100/50">
               <CardHeader className="space-y-1">
                 <div className="flex items-center gap-2 mb-2">
                   <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center shadow-md">
                     <Heart className="w-5 h-5 text-primary-foreground" />
                   </div>
                   <span className="text-xl font-bold text-foreground">TherapyConnect</span>
                 </div>
                 <CardTitle className="text-2xl">
                   {isLogin ? "ברוכים השבים!" : "הרשמת מטפל"}
                 </CardTitle>
                 <CardDescription>
                   {isLogin
                     ? "התחברו לחשבון שלכם כדי להמשיך"
                     : "מלאו את הפרטים כדי ליצור פרופיל מטפל חדש"}
                 </CardDescription>
               </CardHeader>
               
               <CardContent>
                 <form onSubmit={handleSubmit} className="space-y-6">
                   
                   {/* Login / Register Toggle inside Card */}
                   {!isLogin && (
                     <>
                       {/* Personal Details Section */}
                       <div className="space-y-4">
                         <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                           <User className="w-4 h-4" />
                           פרטים אישיים
                         </h3>
                         <div className="grid gap-4">
                           <div className="space-y-2">
                             <Label htmlFor="fullName">שם מלא</Label>
                             <Input
                               id="fullName"
                               placeholder="הכנס שם מלא"
                               value={formData.fullName}
                               onChange={(e) => handleChange("fullName", e.target.value)}
                               className={errors.fullName ? "border-destructive" : ""}
                             />
                             {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                           </div>
                           
                           <div className="space-y-2">
                             <Label htmlFor="email">מייל</Label>
                             <Input
                               id="email"
                               type="email"
                               placeholder="example@email.com"
                               value={formData.email}
                               onChange={(e) => handleChange("email", e.target.value)}
                               className={errors.email ? "border-destructive" : ""}
                             />
                             {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                           </div>

                           <div className="space-y-2">
                             <Label htmlFor="password">סיסמה</Label>
                             <Input
                               id="password"
                               type="password"
                               placeholder="הכנס סיסמה"
                               value={formData.password}
                               onChange={(e) => handleChange("password", e.target.value)}
                               className={errors.password ? "border-destructive" : ""}
                             />
                             {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                           </div>
                         </div>
                       </div>
                       
                       <Separator />

                       {/* Professional Details Section */}
                       <div className="space-y-4">
                         <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                           <Building2 className="w-4 h-4" />
                           פרטים מקצועיים
                         </h3>
                         
                         <div className="grid gap-4">
                           <div className="space-y-2">
                             <Label htmlFor="education">השכלה והכשרות</Label>
                             <Textarea
                               id="education"
                               placeholder="פרט/י את התארים האקדמיים, לימודי תעודה והשתלמויות רלוונטיות..."
                               value={formData.education}
                               onChange={(e) => handleChange("education", e.target.value)}
                               className="min-h-[80px]"
                             />
                           </div>

                           <div className="space-y-2">
                             <Label htmlFor="yearsExperience">שנות ניסיון</Label>
                             <Input
                               id="yearsExperience"
                               type="number"
                               min="0"
                               max="99"
                               placeholder="0"
                               value={formData.yearsExperience}
                               onChange={(e) => handleChange("yearsExperience", e.target.value)}
                               className={errors.yearsExperience ? "border-destructive" : ""}
                             />
                             {errors.yearsExperience && <p className="text-sm text-destructive">{errors.yearsExperience}</p>}
                           </div>

                           <div className="space-y-2">
                             <Label htmlFor="licenseNumber">מספר רישיון</Label>
                             <Input
                               id="licenseNumber"
                               placeholder="מספר רישיון משרד הבריאות / איגוד מקצועי"
                               value={formData.licenseNumber}
                               onChange={(e) => handleChange("licenseNumber", e.target.value)}
                             />
                           </div>
                         </div>

                         <div className="space-y-2">
                           <Label>מקצוע</Label>
                           <div className="flex flex-wrap gap-2">
                             {professionOptions.map((opt) => (
                               <button
                                 key={opt.value}
                                 type="button"
                                 onClick={() => setFormData(prev => ({ ...prev, profession: opt.value as Profession, specializations: [] }))}
                                 className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                                   formData.profession === opt.value
                                     ? 'bg-primary text-primary-foreground border-primary'
                                     : 'bg-background text-muted-foreground border-border hover:border-primary'
                                 }`}
                               >
                                 {opt.label}
                               </button>
                             ))}
                           </div>
                         </div>

                         {formData.profession && (
                           <div className="space-y-2 animate-fade-in">
                             <Label>תחומי התמחות</Label>
                             <div className="flex flex-wrap gap-2">
                               {(specializationsByProfession[formData.profession as Profession] || []).map((opt) => (
                               <button
                                 key={opt.value}
                                 type="button"
                                 onClick={() => toggleSelection('specializations', opt.label)}
                                 className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                                   formData.specializations.includes(opt.label)
                                     ? 'bg-primary text-primary-foreground border-primary'
                                     : 'bg-background text-muted-foreground border-border hover:border-primary'
                                 }`}
                               >
                                 {opt.label}
                               </button>
                             ))}
                             <button
                               type="button"
                               onClick={() => toggleSelection('specializations', 'אחר')}
                               className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                                 formData.specializations.includes('אחר')
                                   ? 'bg-primary text-primary-foreground border-primary'
                                   : 'bg-background text-muted-foreground border-border hover:border-primary'
                               }`}
                             >
                               אחר
                             </button>
                           </div>
                           
                           {isOtherSelected && (
                             <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-2">
                               <Label className="text-xs text-muted-foreground">פרט תחומי התמחות נוספים:</Label>
                               {customSpecs.map((spec, index) => (
                                 <div key={index} className="flex gap-2 items-center">
                                   <Input
                                     placeholder="הקלד תחום התמחות..."
                                     value={spec}
                                     onChange={(e) => handleCustomSpecChange(index, e.target.value)}
                                     className="h-9"
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
                         )}

                         <div className="space-y-2">
                           <Label>קבוצות גיל</Label>
                           <div className="flex flex-wrap gap-2">
                             {ageGroupOptions.map((opt) => (
                               <button
                                 key={opt.value}
                                 type="button"
                                 onClick={() => toggleSelection('targetAudience', opt.value)}
                                 className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                                   formData.targetAudience.includes(opt.value)
                                     ? 'bg-primary text-primary-foreground border-primary'
                                     : 'bg-background text-muted-foreground border-border hover:border-primary'
                                 }`}
                               >
                                 {opt.label}
                               </button>
                             ))}
                           </div>
                        </div>



                        <div className="space-y-2">
                          <Label htmlFor="aboutMe">קצת עלי / אני מאמין</Label>
                          <Textarea
                            id="aboutMe"
                            placeholder="ספר/י בקצרה על הניסיון המקצועי שלך, הגישה הטיפולית וכל מה שחשוב למטופלים לדעת..."
                            value={formData.aboutMe}
                            onChange={(e) => handleChange("aboutMe", e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <Label>בהסדר עם קופת חולים</Label>
                            <RadioGroup 
                              value={formData.hasHealthFundAgreement} 
                              onValueChange={(val) => {
                                setFormData(prev => ({ 
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

                            {formData.hasHealthFundAgreement === "yes" && (
                              <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-muted/30 rounded-lg animate-in fade-in slide-in-from-top-1">
                                {['מכבי', 'כללית', 'כללית מושלם', 'מאוחדת', 'לאומית'].map((fund) => (
                                  <div key={fund} className="flex items-center space-x-2 space-x-reverse">
                                    <Checkbox 
                                      id={`fund-${fund}`} 
                                      checked={formData.healthFunds.includes(fund)}
                                      onCheckedChange={(checked) => {
                                        setFormData(prev => {
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
                              value={formData.hasPrivateInsuranceAgreement} 
                              onValueChange={(val) => {
                                setFormData(prev => ({ 
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

                            {formData.hasPrivateInsuranceAgreement === "yes" && (
                              <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                <Label htmlFor="insuranceName" className="text-xs text-muted-foreground mb-1.5 block">שם חברת הביטוח</Label>
                                <Input
                                  id="insuranceName"
                                  placeholder="הזן את שם חברת הביטוח..."
                                  value={formData.privateInsuranceName}
                                  onChange={(e) => handleChange("privateInsuranceName", e.target.value)}
                                />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>תמונת פרופיל</Label>
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <div className="relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg border-muted-foreground/25 hover:border-primary/50 transition-colors bg-muted/5">
                                  {formData.profileImage ? (
                                    <div className="relative w-full h-full p-2">
                                      <img
                                        src={formData.profileImage}
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
                        </div>

                        <div className="space-y-2">
                           <Label>אופן ניהול יומן</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => handleSetSchedulingMode('slots')}
                                className={`p-4 rounded-xl border text-right transition-all relative ${
                                  formData.schedulingMode === 'slots'
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-medium">חשיפת יומן מלא</div>
                                  {formData.schedulingMode === 'slots' && <CalendarIcon className="w-4 h-4 text-primary" />}
                                </div>
                                <div className="text-xs text-muted-foreground">תורים זמינים להזמנה</div>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenAvailability('reception_days')}
                                className={`p-4 rounded-xl border text-right transition-all relative ${
                                  formData.schedulingMode === 'reception_days'
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-medium">ימי קבלה בלבד</div>
                                  {formData.schedulingMode === 'reception_days' && <CalendarIcon className="w-4 h-4 text-primary" />}
                                </div>
                                <div className="text-xs text-muted-foreground">הצגת זמני פעילות בלבד</div>
                              </button>
                            </div>
                         </div>
                       </div>

                       <Separator />

                       {/* Contact & Location Section */}
                       <div className="space-y-4">
                         <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                           <MapPin className="w-4 h-4" />
                           יצירת קשר ומיקום
                         </h3>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="phoneNumber">טלפון נייד</Label>
                              <Input
                                id="phoneNumber"
                                placeholder="050-0000000"
                                value={formData.phoneNumber}
                                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                className={errors.phoneNumber ? "border-destructive" : ""}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="additionalPhoneNumber">טלפון נוסף (אופציונלי)</Label>
                              <Input
                                id="additionalPhoneNumber"
                                placeholder="03-0000000"
                                value={formData.additionalPhoneNumber}
                                onChange={(e) => handleChange("additionalPhoneNumber", e.target.value)}
                              />
                            </div>
                         </div>

                         <div className="space-y-2">
                            <Label htmlFor="website">אתר אינטרנט (אופציונלי)</Label>
                            <Input
                              id="website"
                              placeholder="https://www.example.com"
                              value={formData.website}
                              onChange={(e) => handleChange("website", e.target.value)}
                            />
                         </div>

                         <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                           {isAbroad ? (
                             <div className="grid gap-4 animate-in fade-in slide-in-from-top-2">
                               <div className="space-y-2">
                                 <Label>מדינה</Label>
                                 <Input 
                                   placeholder="הכנס מדינה"
                                   value={abroadCountry}
                                   onChange={(e) => setAbroadCountry(e.target.value)}
                                 />
                               </div>
                               <div className="space-y-2">
                                 <Label>עיר / יישוב</Label>
                                 <Input 
                                   placeholder="הכנס עיר"
                                   value={abroadCity}
                                   onChange={(e) => setAbroadCity(e.target.value)}
                                 />
                               </div>
                             </div>
                           ) : (
                             <div className="grid gap-4 animate-in fade-in slide-in-from-top-2">
                               <div className="space-y-2">
                                <Label>עיר / יישוב</Label>
                                <Popover open={openCitySelect} onOpenChange={setOpenCitySelect}>
                                  <PopoverTrigger asChild>
                                     <Button
                                       variant="outline"
                                       role="combobox"
                                       aria-expanded={openCitySelect}
                                       className={cn(
                                         "w-full justify-between",
                                         !citySelection && "text-muted-foreground"
                                       )}
                                     >
                                       {citySelection
                                         ? citySelection
                                         : "בחר יישוב"}
                                      <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                   </PopoverTrigger>
                                  <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                      <CommandInput placeholder="חפש יישוב..." />
                                      <CommandList>
                                        <CommandEmpty>לא נמצא יישוב.</CommandEmpty>
                                        <CommandGroup>
                                          {israelCities.map((city) => (
                                            <CommandItem
                                              key={city}
                                              value={city}
                                              onSelect={(currentValue) => {
                                                setCitySelection(city)
                                                setOpenCitySelect(false)
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
                               <div className="space-y-2">
                                 <Label>רחוב ומספר</Label>
                                 <Input 
                                   placeholder="הכנס רחוב ומספר בית"
                                   value={streetAddress}
                                   onChange={(e) => setStreetAddress(e.target.value)}
                                 />
                               </div>
                             </div>
                           )}

                           <div className="flex items-center justify-between pt-2 border-t border-border/50">
                             <Label htmlFor="remote-mode" className="flex items-center gap-2 cursor-pointer">
                               <Globe className="w-4 h-4" />
                               טיפול מרחוק (אונליין)
                             </Label>
                             <Switch
                               id="remote-mode"
                               checked={formData.treatsRemotely}
                               onCheckedChange={(checked) => handleChange("treatsRemotely", checked)}
                             />
                           </div>

                           <div className="flex items-center justify-between pt-2 border-t border-border/50">
                             <Label htmlFor="abroad-mode" className="flex items-center gap-2 cursor-pointer">
                               <Plane className="w-4 h-4" />
                               קליניקה בחו"ל
                             </Label>
                             <Switch
                               id="abroad-mode"
                               checked={isAbroad}
                               onCheckedChange={setIsAbroad}
                             />
                           </div>
                         </div>
                       </div>

                       <Separator />

                       {/* Availability Status Section */}
                       <div className="space-y-4">
                         <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                           <CalendarIcon className="w-4 h-4" />
                           סטטוס זמינות
                         </h3>
                         
                         <div className="space-y-4">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             <Button
                               type="button"
                               variant={formData.availabilityStatus === 'available_full' ? "default" : "outline"}
                               className="justify-start h-auto py-3"
                               onClick={() => handleChange('availabilityStatus', 'available_full')}
                             >
                               <div className="w-2.5 h-2.5 rounded-full bg-green-500 ml-2 shrink-0" />
                               <div className="text-right">
                                 <div className="font-medium">זמינות מלאה</div>
                                 <div className="text-xs opacity-80 font-normal">מקבל/ת מטופלים חדשים</div>
                               </div>
                             </Button>
                             
                             <Button
                               type="button"
                               variant={formData.availabilityStatus === 'available_partial' ? "default" : "outline"}
                               className="justify-start h-auto py-3"
                               onClick={() => handleChange('availabilityStatus', 'available_partial')}
                             >
                               <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 ml-2 shrink-0" />
                               <div className="text-right">
                                 <div className="font-medium">זמינות חלקית</div>
                                 <div className="text-xs opacity-80 font-normal">מספר מקומות מוגבל</div>
                               </div>
                             </Button>
                             
                             <Button
                               type="button"
                               variant={formData.availabilityStatus === 'specific_hours' ? "default" : "outline"}
                               className="justify-start h-auto py-3"
                               onClick={() => handleChange('availabilityStatus', 'specific_hours')}
                             >
                               <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-2 shrink-0" />
                               <div className="text-right">
                                 <div className="font-medium">שעות ספציפיות</div>
                                 <div className="text-xs opacity-80 font-normal">זמינות בשעות מסוימות</div>
                               </div>
                             </Button>
                             
                             <Button
                               type="button"
                               variant={formData.availabilityStatus === 'waitlist' ? "default" : "outline"}
                               className="justify-start h-auto py-3"
                               onClick={() => handleChange('availabilityStatus', 'waitlist')}
                             >
                               <div className="w-2.5 h-2.5 rounded-full bg-red-500 ml-2 shrink-0" />
                               <div className="text-right">
                                 <div className="font-medium">רשימת המתנה</div>
                                 <div className="text-xs opacity-80 font-normal">אין תורים פנויים כרגע</div>
                               </div>
                             </Button>
                           </div>

                           {formData.availabilityStatus !== 'waitlist' && formData.availabilityStatus !== 'available_full' && (
                             <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                               <Label htmlFor="availabilityText">טקסט זמינות חופשי</Label>
                               <Input
                                 id="availabilityText"
                                 placeholder="לדוגמה: פנויה בימי ראשון בבוקר..."
                                 value={formData.availabilityText}
                                 onChange={(e) => handleChange('availabilityText', e.target.value)}
                               />
                             </div>
                           )}
                         </div>
                       </div>
                     </>
                   )}

                   {isLogin && (
                     <>
                        <div className="space-y-2">
                           <Label htmlFor="login-email">מייל</Label>
                           <Input
                             id="login-email"
                             type="email"
                             placeholder="example@email.com"
                             value={formData.email}
                             onChange={(e) => handleChange("email", e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="login-password">סיסמה</Label>
                           <Input
                             id="login-password"
                             type="password"
                             placeholder="הכנס סיסמה"
                             value={formData.password}
                             onChange={(e) => handleChange("password", e.target.value)}
                           />
                        </div>
                     </>
                   )}

                   <Button
                     type="submit"
                     variant="gradient"
                     size="lg"
                     className="w-full"
                     disabled={loading}
                   >
                     {loading ? "טוען..." : isLogin ? "התחבר" : "הירשם למערכת"}
                   </Button>
                 </form>
               </CardContent>
               <CardFooter>
                 <p className="text-center w-full text-sm text-muted-foreground">
                   {isLogin ? "אין לך חשבון?" : "כבר יש לך חשבון?"}{" "}
                   <button
                     onClick={() => {
                       setIsLogin(!isLogin);
                       setErrors({});
                     }}
                     className="text-primary font-medium hover:underline"
                   >
                     {isLogin ? "הירשם עכשיו" : "התחבר"}
                   </button>
                 </p>
               </CardFooter>
             </Card>
           </div>
           
        </div>
      </div>
    </>
  );
};

export default Auth;

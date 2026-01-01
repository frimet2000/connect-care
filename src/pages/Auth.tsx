import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { z } from "zod";

const emailSchema = z.string().email("כתובת מייל לא תקינה");
const passwordSchema = z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים");

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    userType: "parent" as "parent" | "therapist",
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
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

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

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
              title: "שגיאת התחברות",
              description: "מייל או סיסמה שגויים",
              variant: "destructive",
            });
          } else {
            toast({
              title: "שגיאה",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "התחברת בהצלחה!",
          description: "ברוך הבא חזרה",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.fullName,
              user_type: formData.userType,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "המייל כבר רשום",
              description: "נסה להתחבר במקום להירשם",
              variant: "destructive",
            });
          } else {
            toast({
              title: "שגיאה",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "נרשמת בהצלחה!",
          description: "ברוך הבא ל-TherapyConnect",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "משהו השתבש, נסה שוב",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? "התחברות" : "הרשמה"} | TherapyConnect</title>
        <meta
          name="description"
          content="התחבר או הירשם ל-TherapyConnect כדי למצוא מטפלים או לנהל את הלקוחות שלך"
        />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>חזרה לדף הבית</span>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">TherapyConnect</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? "ברוכים השבים!" : "הצטרפו אלינו"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {isLogin
                ? "התחברו לחשבון שלכם"
                : "צרו חשבון חדש והתחילו להתאים טיפולים"}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">שם מלא</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="הכנס שם מלא"
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        className={`pr-10 ${errors.fullName ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>

                  {/* User Type */}
                  <div className="space-y-2">
                    <Label>אני...</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleChange("userType", "parent")}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          formData.userType === "parent"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-2xl mb-1 block">👨‍👩‍👧</span>
                        <span className="font-medium">הורה</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange("userType", "therapist")}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          formData.userType === "therapist"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-2xl mb-1 block">👩‍⚕️</span>
                        <span className="font-medium">מטפל/ת</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">מייל</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`pr-10 ${errors.email ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="הכנס סיסמה"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "טוען..." : isLogin ? "התחבר" : "הירשם"}
              </Button>
            </form>

            {/* Toggle */}
            <p className="text-center mt-6 text-muted-foreground">
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
          </div>
        </div>

        {/* Right Side - Decorative */}
        <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
          <div className="max-w-md text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-6">מחברים בין מטפלים להורים</h2>
            <p className="text-xl opacity-90 mb-8">
              הפלטפורמה המובילה בישראל לחיפוש וקביעת תורים עם מטפלים פרה-רפואיים
            </p>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold">500+</p>
                <p className="text-sm opacity-80">מטפלים</p>
              </div>
              <div>
                <p className="text-4xl font-bold">10K+</p>
                <p className="text-sm opacity-80">תורים</p>
              </div>
              <div>
                <p className="text-4xl font-bold">4.9</p>
                <p className="text-sm opacity-80">דירוג ממוצע</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;

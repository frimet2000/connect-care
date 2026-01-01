import { useState } from "react";
import { CheckCircle2, Calendar, Clock, User, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingFlowProps {
  therapistName: string;
  selectedDate: string;
  selectedTime: string;
  sessionDuration: number;
  instantBooking: boolean;
  onClose: () => void;
  onBack: () => void;
}

type Step = "details" | "confirmation";

interface PatientDetails {
  firstName: string;
  phoneNumber: string;
  ageRange: string;
}

const BookingFlow = ({
  therapistName,
  selectedDate,
  selectedTime,
  sessionDuration,
  instantBooking,
  onClose,
  onBack,
}: BookingFlowProps) => {
  const [step, setStep] = useState<Step>("details");
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    firstName: "",
    phoneNumber: "",
    ageRange: "",
  });
  const [errors, setErrors] = useState<Partial<PatientDetails>>({});

  const ageRanges = [
    { value: "infant", label: "תינוק (0-2)" },
    { value: "toddler", label: "פעוט (2-4)" },
    { value: "child_young", label: "ילד (4-7)" },
    { value: "child_old", label: "ילד (8-12)" },
    { value: "teen", label: "מתבגר (13-18)" },
    { value: "adult", label: "מבוגר (18-65)" },
    { value: "senior", label: "גיל שלישי (65+)" },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PatientDetails> = {};

    if (!patientDetails.firstName.trim()) {
      newErrors.firstName = "שם הוא שדה חובה";
    } else if (patientDetails.firstName.trim().length < 2) {
      newErrors.firstName = "שם חייב להכיל לפחות 2 תווים";
    }

    if (!patientDetails.phoneNumber.trim()) {
      newErrors.phoneNumber = "מספר טלפון הוא שדה חובה";
    } else if (!/^\d{9,10}$/.test(patientDetails.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = "מספר טלפון לא תקין";
    }

    if (!patientDetails.ageRange) {
      newErrors.ageRange = "יש לבחור טווח גילאים";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Simulate backend notification logic
      // In a real application, this would call an API endpoint that handles:
      // 1. Saving the booking to the database
      // 2. Sending an email to the therapist via an email service (e.g., SendGrid, AWS SES)
      // 3. Sending a WhatsApp message to the therapist via a WhatsApp Business API provider (e.g., Twilio)
      // 4. Sending a confirmation email/WhatsApp to the patient
      
      toast.success("הבקשה נשלחה בהצלחה!");
      
      // Simulate separate notifications for clarity
      setTimeout(() => {
        toast.info("נשלחה הודעה למטפל במייל ובוואטסאפ", {
          duration: 4000,
        });
      }, 500);
      
      setTimeout(() => {
        toast.info("נשלח אליך אישור במייל ובוואטסאפ", {
          duration: 4000,
        });
      }, 1500);

      setStep("confirmation");
    }
  };

  const handleChange = (field: keyof PatientDetails, value: string) => {
    setPatientDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (step === "confirmation") {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-secondary" />
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">
          {instantBooking ? "התור נקבע בהצלחה!" : "הבקשה נשלחה!"}
        </h2>
        <p className="text-muted-foreground mb-8">
          {instantBooking
            ? "התור שלך אושר אוטומטית"
            : "המטפל יקבל הודעה ויאשר את התור בהקדם"}
        </p>

        <div className="bg-muted/50 rounded-xl p-6 mb-8 text-right">
          <h3 className="font-semibold text-foreground mb-4">פרטי התור</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">מטפל:</span>
              <span className="font-medium text-foreground">{therapistName}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">תאריך:</span>
              <span className="font-medium text-foreground">{formatDate(selectedDate)}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">שעה:</span>
              <span className="font-medium text-foreground">{selectedTime}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <User className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">מטופל:</span>
              <span className="font-medium text-foreground">
                {patientDetails.firstName}, {patientDetails.phoneNumber} ({ageRanges.find((a) => a.value === patientDetails.ageRange)?.label})
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="gradient" size="lg" className="w-full" onClick={onClose}>
            חזרה לדף הבית
          </Button>
          <p className="text-xs text-muted-foreground">
            📧 📱 שלחנו לך ולמטפל אישור במייל ובוואטסאפ עם כל הפרטים
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">פרטי המטופל</h2>
          <p className="text-sm text-muted-foreground">מלאו את הפרטים להשלמת ההזמנה</p>
        </div>
      </div>

      {/* Appointment Summary */}
      <div className="bg-muted/50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{formatDate(selectedDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>{selectedTime}</span>
          </div>
          <span className="text-muted-foreground">{sessionDuration} דקות</span>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Patient Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-foreground">
            שם המטופל <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="הכנס שם פרטי"
            value={patientDetails.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className={errors.firstName ? "border-destructive" : ""}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-foreground">
            מספר טלפון <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phoneNumber"
            placeholder="050-0000000"
            value={patientDetails.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            className={errors.phoneNumber ? "border-destructive" : ""}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-destructive">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <Label htmlFor="ageRange" className="text-foreground">
            טווח גילאים <span className="text-destructive">*</span>
          </Label>
          <Select
            value={patientDetails.ageRange}
            onValueChange={(value) => handleChange("ageRange", value)}
          >
            <SelectTrigger className={errors.ageRange ? "border-destructive" : ""}>
              <SelectValue placeholder="בחר טווח גילאים" />
            </SelectTrigger>
            <SelectContent>
              {ageRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.ageRange && (
            <p className="text-sm text-destructive">{errors.ageRange}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          variant="gradient"
          size="lg"
          className="w-full mt-6"
          onClick={handleSubmit}
        >
          {instantBooking ? "אשר והזמן" : "שלח בקשה"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          בלחיצה על הכפתור אתה מסכים ל
          <a href="#" className="text-primary hover:underline">
            תנאי השימוש
          </a>
        </p>
      </div>
    </div>
  );
};

export default BookingFlow;

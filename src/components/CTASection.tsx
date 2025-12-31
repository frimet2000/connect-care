import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-95" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Parents */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-primary-foreground mb-4">להורים</h3>
              <p className="text-primary-foreground/80 mb-6">
                מצאו את המטפל המושלם לילד שלכם. חיפוש חינמי, הזמנת תור קלה.
              </p>
              <Button variant="hero" size="lg" className="w-full">
                התחילו לחפש
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </div>

            {/* For Therapists */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-primary-foreground mb-4">למטפלים</h3>
              <p className="text-primary-foreground/80 mb-6">
                הצטרפו לקהילת המטפלים המובילה בישראל והגדילו את הקליניקה שלכם.
              </p>
              <Button variant="hero" size="lg" className="w-full">
                <UserPlus className="w-5 h-5 ml-2" />
                הרשמה למטפלים
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-foreground">500+</div>
              <div className="text-primary-foreground/70 text-sm mt-1">מטפלים פעילים</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-foreground">10K+</div>
              <div className="text-primary-foreground/70 text-sm mt-1">תורים שנקבעו</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-foreground">4.8</div>
              <div className="text-primary-foreground/70 text-sm mt-1">דירוג ממוצע</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

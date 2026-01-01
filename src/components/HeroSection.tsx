import { Search, MapPin, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { professionOptions } from "@/data/therapists";

interface HeroSectionProps {
  selectedProfession: string;
  setSelectedProfession: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  therapistName: string;
  setTherapistName: (value: string) => void;
  onSearch: () => void;
}

const HeroSection = ({
  selectedProfession,
  setSelectedProfession,
  location,
  setLocation,
  therapistName,
  setTherapistName,
  onSearch,
}: HeroSectionProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-hero opacity-5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
      
      {/* Floating Elements */}
      <div className="absolute top-32 right-[20%] w-16 h-16 bg-primary/20 rounded-2xl rotate-12 animate-float hidden lg:block" />
      <div className="absolute bottom-40 left-[15%] w-12 h-12 bg-secondary/20 rounded-xl -rotate-12 animate-float hidden lg:block" style={{ animationDelay: '2s' }} />
      <div className="absolute top-48 left-[25%] w-8 h-8 bg-accent/30 rounded-lg rotate-45 animate-float hidden lg:block" style={{ animationDelay: '4s' }} />

      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">מעל 500 מטפלים מקצועיים</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            מצאו את המטפל{" "}
            <span className="text-gradient">המושלם</span>
            <br />
            לילד שלכם
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            קלינאי תקשורת, פיזיותרפיסטים ומרפאים בעיסוק מובילים.
            <br className="hidden md:block" />
            חיפוש קל, הזמנת תור מהירה, ותוצאות מוכחות.
          </p>

          {/* Search Box */}
          <div className="bg-card rounded-2xl shadow-card-hover p-4 md:p-6 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Profession Select */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2 text-right">
                  סוג טיפול
                </label>
                <select
                  value={selectedProfession}
                  onChange={(e) => setSelectedProfession(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">כל סוגי הטיפול</option>
                  {professionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <label className="block text-sm font-medium text-muted-foreground mb-2 mt-4 text-right">
                  שם המטפל
                </label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={therapistName}
                    onChange={(e) => setTherapistName(e.target.value)}
                    placeholder="חפשו לפי שם מטפל"
                    className="w-full h-12 pr-12 pl-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Location Input */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2 text-right">
                  מיקום
                </label>
                <div className="relative">
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="הזינו עיר או כתובת"
                    className="w-full h-12 pr-12 pl-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button
                  variant="gradient"
                  size="xl"
                  className="w-full md:w-auto"
                  onClick={onSearch}
                >
                  <Search className="w-5 h-5 ml-2" />
                  חיפוש
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">חיפושים פופולריים:</span>
              <button
                onClick={() => {
                  setSelectedProfession('speech_therapy');
                  setLocation('תל אביב');
                }}
                className="text-sm text-primary hover:underline"
              >
                קלינאית תקשורת בתל אביב
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                onClick={() => {
                  setSelectedProfession('occupational_therapy');
                  setLocation('');
                }}
                className="text-sm text-primary hover:underline"
              >
                מרפאה בעיסוק
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                onClick={() => {
                  setSelectedProfession('physiotherapy');
                  setLocation('');
                }}
                className="text-sm text-primary hover:underline"
              >
                פיזיותרפיה לילדים
              </button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span>זמינות מיידית</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span>דירוגים אמיתיים</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span>ביטול חינם עד 24 שעות</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

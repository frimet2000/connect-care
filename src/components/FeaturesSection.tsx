import { Search, Calendar, Shield, Zap, Heart } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "חיפוש חכם",
    description: "מצאו מטפלים לפי מיקום, התמחות, זמינות ומחיר",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Zap,
    title: "הזמנה מיידית",
    description: "תורים רבים זמינים להזמנה מיידית ללא המתנה לאישור",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Calendar,
    title: "ניהול תורים קל",
    description: "צפו, שנו או בטלו תורים בקלות מכל מקום",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Shield,
    title: "מטפלים מאומתים",
    description: "כל המטפלים עוברים תהליך אימות רישיון",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Heart,
    title: "תמיכה מלאה",
    description: "צוות התמיכה שלנו זמין לכל שאלה או בעיה",
    color: "bg-accent/10 text-accent",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            למה <span className="text-gradient">TherapyConnect</span>?
          </h2>
          <p className="text-lg text-muted-foreground">
            הפלטפורמה המובילה בישראל לחיבור הורים עם מטפלים פרה-רפואיים
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

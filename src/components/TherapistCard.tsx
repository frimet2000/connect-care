import { Star, MapPin, Clock, Zap, Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Therapist } from "@/data/therapists";
import { useNavigate } from "react-router-dom";

interface TherapistCardProps {
  therapist: Therapist;
  index: number;
}

const TherapistCard = ({ therapist, index }: TherapistCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="group bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="p-5">
        {/* Top Section: Avatar + Info */}
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="relative">
            <img
              src={therapist.avatar}
              alt={therapist.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all"
            />
            {therapist.availableToday && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center ring-2 ring-card">
                <Zap className="w-3 h-3 text-secondary-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg text-foreground truncate">
                  {therapist.name}
                </h3>
                <p className="text-sm text-primary font-medium">
                  {therapist.professionLabel}
                </p>
              </div>
              {therapist.instantBooking && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  ⚡ הזמנה מיידית
                </Badge>
              )}
            </div>

            {/* Rating + Experience */}
            <div className="flex items-center gap-3 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="font-semibold text-foreground">{therapist.rating}</span>
                <span className="text-muted-foreground">({therapist.reviewCount})</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {therapist.yearsExperience} שנות ניסיון
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
          {therapist.bio}
        </p>

        {/* Specializations */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {therapist.specializations.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="outline" className="text-xs font-normal">
              {spec}
            </Badge>
          ))}
          {therapist.specializations.length > 3 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{therapist.specializations.length - 3}
            </Badge>
          )}
        </div>

        {/* Details Row */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{therapist.city}</span>
            {therapist.distance && (
              <span className="text-primary font-medium">({therapist.distance} ק"מ)</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{therapist.sessionDuration} דקות</span>
          </div>
          {therapist.homeVisits && (
            <div className="flex items-center gap-1.5 text-secondary">
              <Home className="w-4 h-4" />
              <span>ביקורי בית</span>
            </div>
          )}
        </div>

        {/* Health Funds */}
        {therapist.healthFunds.length > 0 && (
          <div className="flex items-center gap-2 mt-3 text-sm">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {therapist.healthFunds.map((fund) => (
                <span key={fund} className="text-muted-foreground">
                  {fund}
                </span>
              ))}
            </div>
            {therapist.acceptsBtl && (
              <Badge variant="outline" className="text-xs text-secondary border-secondary/30">
                ביטוח לאומי
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end p-4 bg-muted/30 border-t border-border">
        <Button variant="default" size="lg" onClick={() => navigate(`/therapist/${therapist.id}`)}>
          צפייה בפרופיל
        </Button>
      </div>
    </div>
  );
};

export default TherapistCard;

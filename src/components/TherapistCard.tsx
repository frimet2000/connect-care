import { MapPin, Clock, Zap, Home, Phone, Calendar, User, Share2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Therapist } from "@/data/therapists";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TherapistCardProps {
  therapist: Therapist;
  index: number;
}

const TherapistCard = ({ therapist, index }: TherapistCardProps) => {
  const navigate = useNavigate();
  const [showPhone, setShowPhone] = useState(false);

  const handleShare = (platform: 'whatsapp' | 'email') => {
    const url = `${window.location.origin}/therapist/${therapist.id}`;
    const text = `היי, רציתי לשתף איתך את הפרופיל של ${therapist.name} ב-TherapyConnect:\n${url}`;
    
    if (platform === 'whatsapp') {
      // Share with others (select contact)
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`mailto:?subject=שיתוף פרופיל מטפל&body=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const getAvailabilityBadge = () => {
    switch (therapist.availabilityStatus) {
      case 'available_full':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 border-0">זמינות מלאה</Badge>;
      case 'available_partial':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">זמינות חלקית</Badge>;
      case 'specific_hours':
        return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">שעות ספציפיות</Badge>;
      case 'waitlist':
        return <Badge variant="destructive">רשימת המתנה</Badge>;
      default:
        return null;
    }
  };

  return (
    <div
      className="group bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in flex flex-col h-full"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="p-5 flex-grow">
        {/* Top Section: Avatar + Info */}
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            {therapist.avatar ? (
              <img
                src={therapist.avatar}
                alt={therapist.name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center ring-2 ring-border group-hover:ring-primary/30 transition-all">
                <User className="w-10 h-10 text-muted-foreground/50" />
              </div>
            )}
            {therapist.availabilityStatus === 'available_full' && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-card text-white">
                <Zap className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-bold text-lg text-foreground truncate leading-tight">
                    {therapist.name}
                    </h3>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted shrink-0">
                                <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" align="start">
                            <div className="flex flex-col gap-1">
                                <Button variant="ghost" className="justify-start gap-2 h-8 text-sm" onClick={() => handleShare('whatsapp')}>
                                    WhatsApp
                                </Button>
                                <Button variant="ghost" className="justify-start gap-2 h-8 text-sm" onClick={() => handleShare('email')}>
                                    Email
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                {getAvailabilityBadge()}
              </div>
              
              <p className="text-sm text-primary font-medium">
                {therapist.professionLabel}
              </p>

              {/* Availability Text (if specific) */}
              {therapist.availabilityText && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {therapist.availabilityText}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
          {therapist.bio}
        </p>

        {/* Specializations - Show ALL */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {therapist.specializations.map((spec) => (
              <Badge key={spec} variant="outline" className="text-xs font-normal">
                {spec}
              </Badge>
            ))}
          </div>
        </div>

        {/* Details Row */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{therapist.city}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{therapist.yearsExperience} שנות ניסיון</span>
          </div>
          {therapist.homeVisits && (
            <div className="flex items-center gap-1.5 text-green-600 font-medium">
              <Home className="w-4 h-4" />
              <span>ביקורי בית</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-muted/30 border-t border-border flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 bg-background gap-2"
          onClick={() => setShowPhone(!showPhone)}
        >
          <Phone className="w-4 h-4" />
          {showPhone ? therapist.phoneNumber : "הצג מספר"}
        </Button>
        
        <Button 
          variant="default" 
          className="flex-1"
          onClick={() => navigate(`/therapist/${therapist.id}`)}
        >
          לפרטים ותיאום
        </Button>
      </div>
    </div>
  );
};

export default TherapistCard;

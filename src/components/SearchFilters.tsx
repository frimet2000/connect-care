import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface SearchFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedSpecializations: string[];
  setSelectedSpecializations: (specs: string[]) => void;
  homeVisitsOnly: boolean;
  setHomeVisitsOnly: (value: boolean) => void;
  instantBookingOnly: boolean;
  setInstantBookingOnly: (value: boolean) => void;
}

const specializations = [
  'אוטיזם',
  'גמגום',
  'עיכוב שפתי',
  'הגייה',
  'מוטוריקה',
  'ויסות חושי',
  'ADHD',
  'עיכוב התפתחותי',
];

const SearchFilters = ({
  priceRange,
  setPriceRange,
  selectedSpecializations,
  setSelectedSpecializations,
  homeVisitsOnly,
  setHomeVisitsOnly,
  instantBookingOnly,
  setInstantBookingOnly,
}: SearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSpecialization = (spec: string) => {
    if (selectedSpecializations.includes(spec)) {
      setSelectedSpecializations(selectedSpecializations.filter((s) => s !== spec));
    } else {
      setSelectedSpecializations([...selectedSpecializations, spec]);
    }
  };

  const clearFilters = () => {
    setPriceRange([100, 500]);
    setSelectedSpecializations([]);
    setHomeVisitsOnly(false);
    setInstantBookingOnly(false);
  };

  const activeFiltersCount =
    (priceRange[0] !== 100 || priceRange[1] !== 500 ? 1 : 0) +
    selectedSpecializations.length +
    (homeVisitsOnly ? 1 : 0) +
    (instantBookingOnly ? 1 : 0);

  return (
    <div className="bg-card rounded-xl shadow-card p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-foreground font-medium hover:text-primary transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>סינון תוצאות</span>
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="mr-2">
              {activeFiltersCount}
            </Badge>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 ml-1" />
            נקה הכל
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => setInstantBookingOnly(!instantBookingOnly)}
          className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
            instantBookingOnly
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-primary'
          }`}
        >
          ⚡ הזמנה מיידית
        </button>
        <button
          onClick={() => setHomeVisitsOnly(!homeVisitsOnly)}
          className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
            homeVisitsOnly
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-primary'
          }`}
        >
          🏠 ביקורי בית
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-6 pt-4 border-t border-border animate-fade-in">
          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              טווח מחירים: ₪{priceRange[0]} - ₪{priceRange[1]}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="100"
                max="500"
                step="25"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="flex-1 accent-primary"
              />
              <input
                type="range"
                min="100"
                max="500"
                step="25"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="flex-1 accent-primary"
              />
            </div>
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              התמחויות
            </label>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => toggleSpecialization(spec)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    selectedSpecializations.includes(spec)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;

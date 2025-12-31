import { ArrowUpDown, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import TherapistCard from "@/components/TherapistCard";
import SearchFilters from "@/components/SearchFilters";
import { Therapist } from "@/data/therapists";
import { useState } from "react";

interface SearchResultsProps {
  therapists: Therapist[];
  searchQuery: string;
}

type SortOption = 'rating' | 'distance' | 'price_low' | 'price_high';

const SearchResults = ({ therapists, searchQuery }: SearchResultsProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 500]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [homeVisitsOnly, setHomeVisitsOnly] = useState(false);
  const [instantBookingOnly, setInstantBookingOnly] = useState(false);

  // Filter therapists
  const filteredTherapists = therapists.filter((t) => {
    if (t.pricePerSession < priceRange[0] || t.pricePerSession > priceRange[1]) return false;
    if (homeVisitsOnly && !t.homeVisits) return false;
    if (instantBookingOnly && !t.instantBooking) return false;
    if (
      selectedSpecializations.length > 0 &&
      !selectedSpecializations.some((spec) => t.specializations.includes(spec))
    )
      return false;
    return true;
  });

  // Sort therapists
  const sortedTherapists = [...filteredTherapists].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return (a.distance || 999) - (b.distance || 999);
      case 'price_low':
        return a.pricePerSession - b.pricePerSession;
      case 'price_high':
        return b.pricePerSession - a.pricePerSession;
      default:
        return 0;
    }
  });

  return (
    <section className="py-12 bg-muted/30 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {searchQuery ? `תוצאות עבור "${searchQuery}"` : 'כל המטפלים'}
            </h2>
            <p className="text-muted-foreground mt-1">
              נמצאו {sortedTherapists.length} מטפלים
            </p>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-primary"
            >
              <option value="rating">דירוג גבוה</option>
              <option value="distance">הכי קרוב</option>
              <option value="price_low">מחיר נמוך לגבוה</option>
              <option value="price_high">מחיר גבוה לנמוך</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <SearchFilters
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedSpecializations={selectedSpecializations}
          setSelectedSpecializations={setSelectedSpecializations}
          homeVisitsOnly={homeVisitsOnly}
          setHomeVisitsOnly={setHomeVisitsOnly}
          instantBookingOnly={instantBookingOnly}
          setInstantBookingOnly={setInstantBookingOnly}
        />

        {/* Results Grid */}
        {sortedTherapists.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedTherapists.map((therapist, index) => (
              <TherapistCard key={therapist.id} therapist={therapist} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <List className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">לא נמצאו תוצאות</h3>
            <p className="text-muted-foreground">נסו לשנות את הסינון או להרחיב את החיפוש</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchResults;

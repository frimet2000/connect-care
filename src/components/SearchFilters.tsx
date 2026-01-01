import { SlidersHorizontal, RotateCcw, Clock, Sun, Sunset, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  healthFundOptions,
  specializationOptions,
  timeRangeOptions,
  TimeRangeValue
} from "@/data/therapists";
import { useState } from "react";

interface SearchFiltersProps {
  homeVisitsOnly: boolean;
  setHomeVisitsOnly: (value: boolean) => void;
  selectedHealthFund: string;
  setSelectedHealthFund: (value: string) => void;
  selectedSpecializations: string[];
  setSelectedSpecializations: (specs: string[]) => void;
  selectedTimeRanges: TimeRangeValue[];
  setSelectedTimeRanges: (ranges: TimeRangeValue[]) => void;
  onReset: () => void;
}

const SearchFilters = ({
  homeVisitsOnly,
  setHomeVisitsOnly,
  selectedHealthFund,
  setSelectedHealthFund,
  selectedSpecializations,
  setSelectedSpecializations,
  selectedTimeRanges,
  setSelectedTimeRanges,
  onReset,
}: SearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSpecialization = (spec: string) => {
    if (selectedSpecializations.includes(spec)) {
      setSelectedSpecializations(selectedSpecializations.filter((s) => s !== spec));
    } else {
      setSelectedSpecializations([...selectedSpecializations, spec]);
    }
  };

  const toggleTimeRange = (range: TimeRangeValue) => {
    if (selectedTimeRanges.includes(range)) {
      setSelectedTimeRanges(selectedTimeRanges.filter((r) => r !== range));
    } else {
      setSelectedTimeRanges([...selectedTimeRanges, range]);
    }
  };

  const activeFiltersCount =
    selectedSpecializations.length +
    selectedTimeRanges.length +
    (homeVisitsOnly ? 1 : 0) +
    (selectedHealthFund !== "all" ? 1 : 0);

  const getTimeRangeIcon = (value: string) => {
    switch (value) {
      case 'morning': return <Sun className="w-4 h-4" />;
      case 'afternoon': return <Sunset className="w-4 h-4" />;
      case 'evening': return <Moon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-card p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-foreground font-medium hover:text-primary transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>סינון מתקדם</span>
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="mr-2">
              {activeFiltersCount}
            </Badge>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-destructive hover:text-destructive/90">
            <RotateCcw className="w-4 h-4 ml-1" />
            איפוס
          </Button>
        )}
      </div>

      {/* Quick Filters Row (Always Visible) */}
      <div className="flex flex-wrap gap-4 mt-4 items-center">
        <div className="flex items-center space-x-2 space-x-reverse bg-muted/50 px-3 py-1.5 rounded-lg border">
          <Switch
            id="home-visits"
            checked={homeVisitsOnly}
            onCheckedChange={setHomeVisitsOnly}
          />
          <Label htmlFor="home-visits" className="cursor-pointer text-sm">ביקורי בית</Label>
        </div>

        {/* Quick Time Range Toggles */}
        <div className="flex flex-wrap gap-2">
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleTimeRange(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedTimeRanges.includes(opt.value)
                ? 'bg-primary/10 text-primary border-primary'
                : 'bg-muted/30 text-muted-foreground border-transparent hover:border-muted-foreground/30'
                }`}
            >
              {getTimeRangeIcon(opt.value)}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-border animate-fade-in space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Health Fund */}
            <div className="space-y-2">
              <Label>קופת חולים</Label>
              <Select
                value={selectedHealthFund}
                onValueChange={setSelectedHealthFund}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר קופת חולים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הקופות</SelectItem>
                  {healthFundOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.label}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Specializations */}
          <div>
            <Label className="mb-3 block">התמחויות נוספות</Label>
            <div className="flex flex-wrap gap-2">
              {specializationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleSpecialization(opt.label)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedSpecializations.includes(opt.label)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary'
                    }`}
                >
                  {opt.label}
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
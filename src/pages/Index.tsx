import { useState, useRef } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SearchResults from "@/components/SearchResults";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { mockTherapists } from "@/data/therapists";
import { Helmet } from "react-helmet";

const Index = () => {
  const [selectedProfession, setSelectedProfession] = useState("");
  const [location, setLocation] = useState("");
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    setShowResults(true);
    // Scroll to results after a brief delay
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Filter therapists based on search
  const filteredTherapists = mockTherapists.filter((t) => {
    if (selectedProfession && t.profession !== selectedProfession) return false;
    if (location && !t.city.includes(location)) return false;
    return true;
  });

  const searchQuery =
    [
      selectedProfession
        ? mockTherapists.find((t) => t.profession === selectedProfession)?.professionLabel
        : "",
      location,
    ]
      .filter(Boolean)
      .join(" ב") || "";

  return (
    <>
      <Helmet>
        <title>TherapyConnect - מצאו מטפלים פרה-רפואיים מובילים</title>
        <meta
          name="description"
          content="הפלטפורמה המובילה בישראל לחיבור הורים עם קלינאי תקשורת, פיזיותרפיסטים ומרפאים בעיסוק. חיפוש קל, הזמנת תור מהירה."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          <HeroSection
            selectedProfession={selectedProfession}
            setSelectedProfession={setSelectedProfession}
            location={location}
            setLocation={setLocation}
            onSearch={handleSearch}
          />

          {showResults && (
            <div ref={resultsRef}>
              <SearchResults therapists={filteredTherapists} searchQuery={searchQuery} />
            </div>
          )}

          <FeaturesSection />
          <CTASection />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;

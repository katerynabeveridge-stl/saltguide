"use client";

import { useEffect, useMemo, useState } from "react";
import Banner from "../components/Banner";
import Essentials from "../components/Essentials";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Nav from "../components/Nav";
import Neighbourhoods from "../components/Neighbourhoods";
import Newsletter from "../components/Newsletter";
import PlaceGrid from "../components/PlaceGrid";
import PlacePanel from "../components/PlacePanel";
import SearchBar from "../components/SearchBar";
import Tabs from "../components/Tabs";
import VibeFilter from "../components/VibeFilter";
import { places, vibeList } from "../lib/data";
import { Place } from "../lib/types";

export default function Home() {
  const [activeVibe, setActiveVibe] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const filteredPlaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return places.filter((place) => {
      if (activeVibe !== "all" && !place.vibes.includes(activeVibe)) {
        return false;
      }
      if (!query) {
        return true;
      }
      const hay = [
        place.name,
        place.cat,
        place.area,
        place.desc,
        place.tip || "",
        ...(place.cuisine || []),
        ...place.vibes,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [activeVibe, searchQuery]);

  const hasFilters = activeVibe !== "all" || Boolean(searchQuery);

  const scrollToResults = () => {
    requestAnimationFrame(() => {
      const el = document.getElementById("resultsInfo");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("v");
          }
        });
      },
      { threshold: 0.08 }
    );

    const nodes = document.querySelectorAll(".r:not(.v)");
    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [filteredPlaces.length]);

  return (
    <>
      <Nav />
      <Hero />
      <SearchBar
        value={searchQuery}
        onChange={(value) => setSearchQuery(value)}
        onClear={() => setSearchQuery("")}
      />
      <Tabs />
      <VibeFilter
        vibes={vibeList}
        activeVibe={activeVibe}
        onSelect={(vibe) => {
          setActiveVibe(vibe);
          scrollToResults();
        }}
      />
      <PlaceGrid
        places={filteredPlaces}
        hasFilters={hasFilters}
        onClearFilters={() => {
          setActiveVibe("all");
          setSearchQuery("");
        }}
        onSelectPlace={(place) => setSelectedPlace(place)}
      />
      <Neighbourhoods
        places={places}
        onSelectArea={(area) => {
          setSearchQuery(area);
          scrollToResults();
        }}
      />
      <Essentials />
      <Banner />
      <Newsletter />
      <PlacePanel place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      <Footer
        onSearch={(query) => {
          setSearchQuery(query);
          scrollToResults();
        }}
        onSetVibe={(vibe) => {
          setActiveVibe(vibe);
          scrollToResults();
        }}
      />
    </>
  );
}

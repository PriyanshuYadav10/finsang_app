import { RelativePathString, useRouter } from "expo-router";
import React, { createContext, ReactNode, useContext, useState } from "react";

type ExperienceType = "main" | "finsangmart";
interface ExperienceContextType {
  experience: ExperienceType;
  setExperience: (exp: ExperienceType) => void;
  switchExperience: (exp: ExperienceType) => void;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(
  undefined
);

export const ExperienceProvider = ({ children }: { children: ReactNode }) => {
  const [experience, setExperience] = useState<ExperienceType>("main");

  const handleSetExperience = (exp: ExperienceType) => {
    console.log("Experience switching from", experience, "to", exp);
    setExperience(exp);
  };

  const switchExperience = (exp: ExperienceType) => {
    console.log("Experience switching from", experience, "to", exp);
    setExperience(exp);
  };

  return (
    <ExperienceContext.Provider
      value={{
        experience,
        setExperience: handleSetExperience,
        switchExperience,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => {
  const context = useContext(ExperienceContext);
  if (!context)
    throw new Error("useExperience must be used within ExperienceProvider");
  return context;
};

// Custom hook for experience switching with navigation reset
export const useExperienceSwitch = () => {
  const { experience, switchExperience } = useExperience();
  const router = useRouter();

  const switchToExperience = (exp: ExperienceType) => {
    console.log("Switching experience from", experience, "to", exp);

    // Reset navigation state when switching experiences
    if (exp === "main") {
      // Switch to main experience and reset to home
      switchExperience(exp);
      router.replace("/");
    } else if (exp === "finsangmart") {
      // Switch to FinsangMart experience and reset to home
      switchExperience(exp);
      router.replace("/finsangMartTabs" as RelativePathString);
    }
  };

  return { switchToExperience, currentExperience: experience };
};

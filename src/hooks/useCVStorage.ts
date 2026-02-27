import { useState, useEffect } from "react";
import { CVData } from "@/components/CVEditorModal";

const STORAGE_KEY = "user_cvs";

export function useCVStorage() {
  const [cvs, setCVs] = useState<CVData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load CVs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCVs(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des CV:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save CVs to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvs));
    }
  }, [cvs, isLoading]);

  const addCV = (cv: CVData) => {
    setCVs((prev) => [...prev, { ...cv, id: Date.now().toString() }]);
  };

  const updateCV = (id: string, data: Partial<CVData>) => {
    setCVs((prev) =>
      prev.map((cv) => (cv.id === id ? { ...cv, ...data } : cv))
    );
  };

  const deleteCV = (id: string) => {
    setCVs((prev) => prev.filter((cv) => cv.id !== id));
  };

  const getCV = (id: string) => {
    return cvs.find((cv) => cv.id === id);
  };

  const getCVsByTemplate = (templateId: string) => {
    return cvs.filter((cv) => cv.template === templateId);
  };

  return {
    cvs,
    isLoading,
    addCV,
    updateCV,
    deleteCV,
    getCV,
    getCVsByTemplate,
  };
}

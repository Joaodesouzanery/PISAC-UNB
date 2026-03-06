import { create } from "zustand";
import type { Crisis, Incident, Municipality, CrisisResource } from "@/types";

interface CrisisState {
  crises: Crisis[];
  incidents: Incident[];
  municipalities: Municipality[];
  resources: CrisisResource[];
  isLoading: boolean;

  setCrises: (crises: Crisis[]) => void;
  setIncidents: (incidents: Incident[]) => void;
  setMunicipalities: (municipalities: Municipality[]) => void;
  setResources: (resources: CrisisResource[]) => void;
  setLoading: (loading: boolean) => void;

  fetchCrises: () => Promise<void>;
  fetchIncidents: (crisisId?: string) => Promise<void>;
  fetchMunicipalities: () => Promise<void>;
  fetchResources: () => Promise<void>;
}

export const useCrisisStore = create<CrisisState>((set) => ({
  crises: [],
  incidents: [],
  municipalities: [],
  resources: [],
  isLoading: false,

  setCrises: (crises) => set({ crises }),
  setIncidents: (incidents) => set({ incidents }),
  setMunicipalities: (municipalities) => set({ municipalities }),
  setResources: (resources) => set({ resources }),
  setLoading: (loading) => set({ isLoading: loading }),

  fetchCrises: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/crises");
      const json = await res.json();
      set({ crises: json.data });
    } catch (err) {
      console.error("Failed to fetch crises:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchIncidents: async (crisisId?: string) => {
    set({ isLoading: true });
    try {
      const url = crisisId ? `/api/incidents?crisisId=${crisisId}` : "/api/incidents";
      const res = await fetch(url);
      const json = await res.json();
      set({ incidents: json.data });
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMunicipalities: async () => {
    try {
      const res = await fetch("/api/municipalities");
      const json = await res.json();
      set({ municipalities: json.data });
    } catch (err) {
      console.error("Failed to fetch municipalities:", err);
    }
  },

  fetchResources: async () => {
    try {
      const res = await fetch("/api/resources");
      const json = await res.json();
      set({ resources: json.data });
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    }
  },
}));

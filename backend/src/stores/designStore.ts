import { create } from 'zustand';

export interface TextObject {
  id: string;
  type: 'text';
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | 'italic';
  color: string;
  align: 'left' | 'center' | 'right';
  rotation: number;
  opacity: number;
}

export interface ShapeObject {
  id: string;
  type: 'rect' | 'circle' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  opacity: number;
}

export interface ImageObject {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  scaleX: number;
  scaleY: number;
}

export type CanvasObject = TextObject | ShapeObject | ImageObject;

export interface DocumentConfig {
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'cm' | 'inch';
  dpi: 72 | 150 | 300;
  orientation: 'portrait' | 'landscape';
  showBleed: boolean;
  showSafeZone: boolean;
  showGrid: boolean;
}

interface DesignState {
  // Document
  document: DocumentConfig;
  setDocument: (config: Partial<DocumentConfig>) => void;

  // Canvas objects
  objects: CanvasObject[];
  addObject: (object: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  deleteObject: (id: string) => void;

  // Selection
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;

  // History
  history: CanvasObject[][];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // View
  zoom: number;
  setZoom: (zoom: number) => void;
  panX: number;
  panY: number;
  setPan: (x: number, y: number) => void;
}

export const useDesignStore = create<DesignState>((set, get) => ({
  document: {
    width: 1080,
    height: 1080,
    unit: 'px',
    dpi: 300,
    orientation: 'portrait',
    showBleed: true,
    showSafeZone: true,
    showGrid: true,
  },
  setDocument: (config) =>
    set((state) => ({
      document: { ...state.document, ...config },
    })),

  objects: [],
  addObject: (object) =>
    set((state) => ({
      objects: [...state.objects, object],
    })),
  updateObject: (id, updates) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      ),
    })),
  deleteObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
    })),

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
  selectedIds: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),

  history: [[]],
  historyIndex: 0,
  pushHistory: () =>
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.objects]);
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),
  undo: () =>
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          objects: state.history[newIndex],
          historyIndex: newIndex,
        };
      }
      return state;
    }),
  redo: () =>
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          objects: state.history[newIndex],
          historyIndex: newIndex,
        };
      }
      return state;
    }),

  zoom: 100,
  setZoom: (zoom) => set({ zoom: Math.max(50, Math.min(400, zoom)) }),
  panX: 0,
  panY: 0,
  setPan: (x, y) => set({ panX: x, panY: y }),
}));

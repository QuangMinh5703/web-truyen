import { create } from 'zustand';

type ReaderMode = 'single' | 'continuous';
type BackgroundColor = 'white' | 'black' | 'sepia';
export type PageWidth = 'fit-width' | 'fit-height' | 'original';

interface ReaderState {
    readerMode: ReaderMode;
    backgroundColor: BackgroundColor;
    pageWidth: PageWidth;
    isFullscreen: boolean;
    setReaderMode: (mode: ReaderMode) => void;
    setBackgroundColor: (color: BackgroundColor) => void;
    setPageWidth: (width: PageWidth) => void;
    toggleFullscreen: () => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
    readerMode: 'single',
    backgroundColor: 'white',
    pageWidth: 'fit-width',
    isFullscreen: false,
    setReaderMode: (mode) => set({ readerMode: mode }),
    setBackgroundColor: (color) => set({ backgroundColor: color }),
    setPageWidth: (width) => set({ pageWidth: width }),
    toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
}));

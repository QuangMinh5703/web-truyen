import { useEffect } from 'react';
import { useReaderStore, PageWidth, ReaderMode, BackgroundColor } from '@/lib/store';

export type { PageWidth, ReaderMode, BackgroundColor };

/**
 * @typedef {object} UseReaderSettingsReturn
 * @property {ReaderMode} readerMode - The current reading mode ('single' or 'continuous').
 * @property {BackgroundColor} backgroundColor - The current background color ('white', 'black', 'sepia').
 * @property {PageWidth} pageWidth - The current page width setting.
 * @property {boolean} isFullscreen - Whether the reader is in fullscreen mode.
 * @property {(mode: ReaderMode) => void} setReaderMode - Function to set the reading mode.
 * @property {(color: BackgroundColor) => void} setBackgroundColor - Function to set the background color.
 * @property {(width: PageWidth) => void} setPageWidth - Function to set the page width.
 * @property {() => void} toggleFullscreen - Function to toggle fullscreen mode.
 */

/**
 * A custom hook to manage and persist reader settings.
 *
 * This hook acts as a bridge between the `useReaderStore` (Zustand store) and `localStorage`.
 * It loads settings from localStorage on initial mount and saves them whenever they change.
 * It also applies side effects, like changing the body's background color.
 *
 * @returns {UseReaderSettingsReturn} An object containing the reader settings and functions to update them.
 */
export const useReaderSettings = () => {
    const {
        readerMode,
        backgroundColor,
        pageWidth,
        isFullscreen,
        swipeThreshold,
        setReaderMode,
        setBackgroundColor,
        setPageWidth,
        toggleFullscreen,
        setSwipeThreshold
    } = useReaderStore();

    /**
     * @effect Loads user's saved preferences from localStorage on initial client-side render.
     */
    useEffect(() => {
        const savedBgColor = localStorage.getItem('reader-backgroundColor') as BackgroundColor;
        if (savedBgColor && ['white', 'black', 'sepia'].includes(savedBgColor)) {
            setBackgroundColor(savedBgColor);
        }

        const savedPageWidth = localStorage.getItem('reader-pageWidth') as PageWidth;
        if (savedPageWidth && ['fit-width', 'fit-height', 'original'].includes(savedPageWidth)) {
            setPageWidth(savedPageWidth);
        }

        const savedMode = localStorage.getItem('reader-readerMode') as ReaderMode;
        if (savedMode && ['single', 'continuous'].includes(savedMode)) {
            setReaderMode(savedMode);
        }

        const savedSwipeThreshold = localStorage.getItem('reader-swipeThreshold');
        if (savedSwipeThreshold) {
            setSwipeThreshold(Number(savedSwipeThreshold));
        }
    }, [setReaderMode, setBackgroundColor, setPageWidth, setSwipeThreshold]);

    /**
     * @effect Persists the background color to localStorage and updates the root HTML element class.
     */
    useEffect(() => {
        localStorage.setItem('reader-backgroundColor', backgroundColor);
    }, [backgroundColor]);

    /**
     * @effect Persists the page width setting to localStorage.
     */
    useEffect(() => {
        localStorage.setItem('reader-pageWidth', pageWidth);
    }, [pageWidth]);

    /**
     * @effect Persists the reader mode setting to localStorage.
     */
    useEffect(() => {
        localStorage.setItem('reader-readerMode', readerMode);
    }, [readerMode]);

    /**
     * @effect Persists the swipe threshold setting to localStorage.
     */
    useEffect(() => {
        localStorage.setItem('reader-swipeThreshold', String(swipeThreshold));
    }, [swipeThreshold]);

    return {
        readerMode,
        backgroundColor,
        pageWidth,
        isFullscreen,
        swipeThreshold,
        setReaderMode,
        setBackgroundColor,
        setPageWidth,
        toggleFullscreen,
        setSwipeThreshold,
    };
}

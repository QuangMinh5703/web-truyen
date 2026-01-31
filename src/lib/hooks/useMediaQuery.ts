/**
 * useMediaQuery Hook
 * 
 * Custom hook for responsive design in React components.
 * Listens to media query changes and returns the current match state.
 * 
 * @file src/lib/hooks/useMediaQuery.ts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    BREAKPOINTS,
    MEDIA_QUERIES,
    type BreakpointKey,
    isMobile,
    isTablet,
    isDesktop
} from '@/lib/breakpoints';

/**
 * Hook to check if a media query matches
 * 
 * @param query - CSS media query string
 * @returns boolean indicating if the query matches
 * 
 * @example
 * const isLargeScreen = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // Check if window is available (SSR safety)
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);

        // Set initial value
        const initialMatches = mediaQuery.matches;
        if (matches !== initialMatches) {
            setMatches(initialMatches);
        }

        // Handler for changes
        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Add listener
        mediaQuery.addEventListener('change', handler);

        // Cleanup
        return () => {
            mediaQuery.removeEventListener('change', handler);
        };
    }, [query]);

    return matches;
}

/**
 * Hook to check if viewport is at or above a specific breakpoint
 * 
 * @param breakpoint - Breakpoint key (xs, sm, md, lg, xl, 2xl, 3xl)
 * @returns boolean indicating if viewport is at or above the breakpoint
 * 
 * @example
 * const isDesktop = useBreakpoint('xl'); // true if viewport >= 1024px
 */
export function useBreakpoint(breakpoint: BreakpointKey): boolean {
    const query = MEDIA_QUERIES[breakpoint];
    return useMediaQuery(query);
}

/**
 * Hook to get the current window dimensions
 * 
 * @returns Object with width and height of the window
 * 
 * @example
 * const { width, height } = useWindowSize();
 */
export function useWindowSize(): { width: number; height: number } {
    const [size, setSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // Set initial size
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return size;
}

/**
 * Hook to get the current active breakpoint
 * 
 * @returns The current breakpoint key
 * 
 * @example
 * const breakpoint = useCurrentBreakpoint(); // 'lg', 'xl', etc.
 */
export function useCurrentBreakpoint(): BreakpointKey {
    const { width } = useWindowSize();

    // Sort breakpoints in descending order
    const breakpointEntries = Object.entries(BREAKPOINTS) as [BreakpointKey, number][];
    const sortedBreakpoints = breakpointEntries.sort((a, b) => b[1] - a[1]);

    for (const [key, value] of sortedBreakpoints) {
        if (width >= value) {
            return key;
        }
    }

    return 'xs';
}

/**
 * Responsive utilities hook
 * Provides common responsive checks and values
 * 
 * @returns Object with common responsive utilities
 * 
 * @example
 * const { isMobile, isTablet, isDesktop, width, breakpoint } = useResponsive();
 */
export function useResponsive() {
    const { width, height } = useWindowSize();

    const isBelowLg = useMediaQuery(MEDIA_QUERIES.belowLg);
    const isMd = useMediaQuery(MEDIA_QUERIES.md);
    const isXl = useMediaQuery(MEDIA_QUERIES.xl);

    const isMobileDevice = isBelowLg;
    const isTabletDevice = isMd && !isXl;
    const isDesktopDevice = isXl;

    const currentBreakpoint = useCurrentBreakpoint();

    return {
        /** Current viewport width */
        width,
        /** Current viewport height */
        height,
        /** Current breakpoint key */
        breakpoint: currentBreakpoint,
        /** True if below lg breakpoint (< 768px) */
        isMobile: isMobileDevice,
        /** True if between md and xl (640px - 1023px) */
        isTablet: isTabletDevice,
        /** True if xl or above (>= 1024px) */
        isDesktop: isDesktopDevice,
        /** True if sm and above */
        isSmUp: width >= BREAKPOINTS.sm,
        /** True if md and above */
        isMdUp: width >= BREAKPOINTS.md,
        /** True if lg and above */
        isLgUp: width >= BREAKPOINTS.lg,
        /** True if xl and above */
        isXlUp: width >= BREAKPOINTS.xl,
        /** True if 2xl and above */
        is2xlUp: width >= BREAKPOINTS['2xl'],
    };
}

/**
 * Hook to render different content based on breakpoint
 * Returns a function that can be used to select content based on screen size
 * 
 * @example
 * const responsiveValue = useResponsiveValue();
 * const columns = responsiveValue({ xs: 1, md: 2, lg: 3, xl: 4 });
 */
export function useResponsiveValue() {
    const { width } = useWindowSize();

    return useCallback(<T,>(values: Partial<Record<BreakpointKey, T>>): T | undefined => {
        // Get sorted breakpoints in descending order
        const breakpointOrder: BreakpointKey[] = ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs'];

        for (const bp of breakpointOrder) {
            if (width >= BREAKPOINTS[bp] && values[bp] !== undefined) {
                return values[bp];
            }
        }

        // Return the smallest defined value as fallback
        for (const bp of [...breakpointOrder].reverse()) {
            if (values[bp] !== undefined) {
                return values[bp];
            }
        }

        return undefined;
    }, [width]);
}

export default useMediaQuery;

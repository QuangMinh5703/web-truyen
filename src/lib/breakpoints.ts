/**
 * Breakpoints Configuration
 * 
 * Centralized breakpoint definitions for consistent responsive behavior
 * across the application. Use these values in:
 * - Media queries in CSS
 * - Responsive hooks (useMediaQuery)
 * - Conditional rendering logic
 * 
 * @file src/lib/breakpoints.ts
 */

/**
 * Breakpoint values in pixels
 * Mobile-first approach: styles apply from the breakpoint and up
 */
export const BREAKPOINTS = {
    /** Extra small devices - small phones (0-479px) */
    xs: 0,
    /** Small devices - large phones (480-639px) */
    sm: 480,
    /** Medium devices - tablets portrait (640-767px) */
    md: 640,
    /** Large devices - tablets landscape (768-1023px) */
    lg: 768,
    /** Extra large devices - desktops (1024-1279px) */
    xl: 1024,
    /** 2X large devices - large desktops (1280-1535px) */
    '2xl': 1280,
    /** 3X large devices - extra large screens (1536px+) */
    '3xl': 1536,
} as const;

/**
 * Type for breakpoint keys
 */
export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Media query strings for use in CSS-in-JS or matchMedia
 * Usage: window.matchMedia(MEDIA_QUERIES.lg).matches
 */
export const MEDIA_QUERIES = {
    xs: `(min-width: ${BREAKPOINTS.xs}px)`,
    sm: `(min-width: ${BREAKPOINTS.sm}px)`,
    md: `(min-width: ${BREAKPOINTS.md}px)`,
    lg: `(min-width: ${BREAKPOINTS.lg}px)`,
    xl: `(min-width: ${BREAKPOINTS.xl}px)`,
    '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
    '3xl': `(min-width: ${BREAKPOINTS['3xl']}px)`,
    // Max-width queries (mobile-first "below this breakpoint")
    belowSm: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
    belowMd: `(max-width: ${BREAKPOINTS.md - 1}px)`,
    belowLg: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
    belowXl: `(max-width: ${BREAKPOINTS.xl - 1}px)`,
    below2xl: `(max-width: ${BREAKPOINTS['2xl'] - 1}px)`,
    below3xl: `(max-width: ${BREAKPOINTS['3xl'] - 1}px)`,
} as const;

/**
 * Container max-widths for each breakpoint
 * These match the CSS variables in globals.css
 */
export const CONTAINER_WIDTHS = {
    xs: 320,
    sm: 480,
    md: 640,
    lg: 768,
    xl: 1024,
    '2xl': 1280,
    '3xl': 1536,
} as const;

/**
 * Spacing scale values (in rem)
 * Matches CSS variables: --space-{n}
 */
export const SPACING = {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
} as const;

/**
 * Typography sizes (responsive, use CSS variables in actual styles)
 * Reference for component development
 */
export const TYPOGRAPHY = {
    xs: { min: 10, max: 12 },   // --font-size-xs
    sm: { min: 12, max: 14 },   // --font-size-sm
    base: { min: 13, max: 15 }, // --font-size-base
    lg: { min: 14, max: 18 },   // --font-size-lg
    xl: { min: 16, max: 20 },   // --font-size-xl
    '2xl': { min: 20, max: 28 }, // --font-size-2xl
    '3xl': { min: 24, max: 35 }, // --font-size-3xl
    '4xl': { min: 24, max: 39 }, // --font-size-4xl
    '5xl': { min: 24, max: 40 }, // --font-size-5xl
} as const;

/**
 * Touch target minimum size (for accessibility)
 */
export const TOUCH_TARGET_MIN = 44; // pixels

/**
 * Helper function to check if a given width is at or above a breakpoint
 */
export function isAtBreakpoint(width: number, breakpoint: BreakpointKey): boolean {
    return width >= BREAKPOINTS[breakpoint];
}

/**
 * Helper function to get the current breakpoint based on width
 */
export function getCurrentBreakpoint(width: number): BreakpointKey {
    const breakpointEntries = Object.entries(BREAKPOINTS) as [BreakpointKey, number][];
    // Sort in descending order and find the first matching breakpoint
    const sortedBreakpoints = breakpointEntries.sort((a, b) => b[1] - a[1]);

    for (const [key, value] of sortedBreakpoints) {
        if (width >= value) {
            return key;
        }
    }

    return 'xs';
}

/**
 * Check if currently on mobile (below lg breakpoint)
 */
export function isMobile(width: number): boolean {
    return width < BREAKPOINTS.lg;
}

/**
 * Check if currently on tablet (between md and xl)
 */
export function isTablet(width: number): boolean {
    return width >= BREAKPOINTS.md && width < BREAKPOINTS.xl;
}

/**
 * Check if currently on desktop (xl and above)
 */
export function isDesktop(width: number): boolean {
    return width >= BREAKPOINTS.xl;
}

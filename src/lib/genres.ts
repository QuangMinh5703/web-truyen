/**
 * Shared genre list used across Navbar and PopularGenres.
 * Single source of truth — update here when API genres change.
 */
export interface GenreItem {
    name: string;
    slug: string;
}

export const GENRES: GenreItem[] = [
    { name: "BL", slug: "bl" },
    { name: "GL", slug: "gl" },
    { name: "Action", slug: "action" },
    { name: "Mature", slug: "mature" },
    { name: "Adventure", slug: "adventure" },
    { name: "Chuyển sinh", slug: "chuyen-sinh" },
    { name: "Comedy", slug: "comedy" },
    { name: "Drama", slug: "drama" },
    { name: "Harem", slug: "harem" },
    { name: "Historical", slug: "historical" },
    { name: "Ngôn Tình", slug: "ngon-tinh" },
    { name: "Psychological", slug: "psychological" },
    { name: "Romance", slug: "romance" },
    { name: "Sci-fi", slug: "sci-fi" },
    { name: "Trinh Thám", slug: "trinh-tham" },
    { name: "Slice of Life", slug: "slice-of-life" },
];

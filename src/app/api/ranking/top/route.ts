import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { StoryStats } from '@/lib/view-tracking'; // Re-using interface (need to verify it exists/matches)

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || 'all';
        const limit = parseInt(searchParams.get('limit') || '10');

        let sql = '';
        let params: any[] = [];

        if (period === 'all') {
            // Query aggregated stats table
            sql = `
        SELECT 
          story_id as storyId, 
          story_slug as storySlug, 
          story_title as storyTitle, 
          total_views as totalViews, 
          score, 
          last_viewed as lastViewed 
        FROM story_stats 
        ORDER BY total_views DESC 
        LIMIT ?`;
            params = [limit.toString()]; // Params must be strings for some driver versions, but mysql2 handles numbers.
            // Actually mysql2 execute params: limit is safely strictly typed usually.
        } else {
            // Query raw views for specific period
            let timeFilter = '1 DAY';
            if (period === 'week') timeFilter = '7 DAY';
            if (period === 'month') timeFilter = '30 DAY';

            sql = `
        SELECT 
          story_id as storyId, 
          story_slug as storySlug, 
          story_title as storyTitle, 
          COUNT(*) as totalViews, 
          COUNT(*) as score,
          MAX(created_at) as lastViewed
        FROM story_views
        WHERE created_at >= NOW() - INTERVAL ${timeFilter}
        GROUP BY story_id, story_slug, story_title
        ORDER BY totalViews DESC
        LIMIT ?`;
            // Note: Interpolating INTERVAL unit represents fixed syntax, not user input.
        }

        // Since mysql2 execute params for LIMIT sometimes tricky if passed as string vs number depending on prepared statements.
        // We cast limit to number in values.
        const results = await query<any[]>(sql, [limit]);

        // Map results if necessary, or return as is (aliased in SQL)
        const formattedResults = Array.isArray(results) ? results.map(row => ({
            ...row,
            lastViewed: new Date(row.lastViewed).getTime() // Convert to timestamp number for frontend compatibility
        })) : [];

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error('Get Ranking Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

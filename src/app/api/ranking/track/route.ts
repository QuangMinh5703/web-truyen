import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { storyId, storySlug, storyTitle, sessionId } = body;

        if (!storyId || !sessionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Insert into story_views
        await query(
            `INSERT INTO story_views (story_id, story_slug, story_title, session_id) VALUES (?, ?, ?, ?)`,
            [storyId, storySlug, storyTitle, sessionId]
        );

        // 2. Upsert into story_stats (Simple atomic increment)
        // We update total_views. For unique views, we could check existing session_id in story_views first, 
        // but for performance/simplicity we'll just track raw page views or assume uniqueness check is done elsewhere if needed.
        // Here we strictly follow the requirement of replacing Firebase counter.

        await query(
            `INSERT INTO story_stats (story_id, story_slug, story_title, total_views, score) 
       VALUES (?, ?, ?, 1, 1)
       ON DUPLICATE KEY UPDATE 
       total_views = total_views + 1,
       score = score + 1,
       story_title = VALUES(story_title),
       story_slug = VALUES(story_slug)`,
            [storyId, storySlug, storyTitle]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Track View Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

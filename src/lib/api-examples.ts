/**
 * Ví dụ sử dụng API Service
 * File này chỉ để tham khảo, không cần import vào project
 */

import { otruyenApi } from './api';

// ============================================
// VÍ DỤ SỬ DỤNG CÁC API
// ============================================

/**
 * 1. Lấy danh sách truyện
 */
export async function exampleGetStories() {
  try {
    // Lấy tất cả truyện
    const response = await otruyenApi.getStories();
    console.log('Stories:', response.data);

    // Lấy truyện với phân trang
    const paginatedResponse = await otruyenApi.getStories({
      page: 1,
      limit: 20,
      sort: 'updatedAt',
      order: 'desc',
    });
    console.log('Paginated stories:', paginatedResponse.data);
    console.log('Total pages:', paginatedResponse.pagination?.totalPages);
  } catch (error) {
    console.error('Error fetching stories:', error);
  }
}

/**
 * 2. Lấy chi tiết truyện
 */
export async function exampleGetStoryDetail() {
  try {
    // Lấy theo ID
    const storyById = await otruyenApi.getStoryById('story-id-123');
    console.log('Story by ID:', storyById.data);

    // Lấy theo slug
    const storyBySlug = await otruyenApi.getStoryBySlug('one-piece');
    console.log('Story by slug:', storyBySlug.data);
  } catch (error) {
    console.error('Error fetching story detail:', error);
  }
}

/**
 * 3. Tìm kiếm truyện
 */
export async function exampleSearchStories() {
  try {
    const searchResults = await otruyenApi.searchStories('one piece', {
      page: 1,
      limit: 10,
    });
    console.log('Search results:', searchResults.data);
  } catch (error) {
    console.error('Error searching stories:', error);
  }
}

/**
 * 4. Lấy danh sách chương
 */
export async function exampleGetChapters() {
  try {
    const chapters = await otruyenApi.getChapters('story-id-123', {
      page: 1,
      limit: 50,
    });
    console.log('Chapters:', chapters.data);
  } catch (error) {
    console.error('Error fetching chapters:', error);
  }
}

/**
 * 5. Lấy nội dung chương
 */
export async function exampleGetChapterContent() {
  try {
    // Lấy theo chapter ID
    const chapterById = await otruyenApi.getChapterById('chapter-id-456');
    console.log('Chapter by ID:', chapterById.data);

    // Lấy theo story ID và chapter number
    const chapterByNumber = await otruyenApi.getChapterByNumber('story-id-123', 1);
    console.log('Chapter 1:', chapterByNumber.data);
  } catch (error) {
    console.error('Error fetching chapter content:', error);
  }
}

/**
 * 6. Lấy danh sách thể loại
 */
export async function exampleGetGenres() {
  try {
    const genres = await otruyenApi.getGenres();
    console.log('Genres:', genres.data);
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
}

/**
 * 7. Lấy truyện theo thể loại
 */
export async function exampleGetStoriesByGenre() {
  try {
    const stories = await otruyenApi.getStoriesByGenre('action', {
      page: 1,
      limit: 20,
    });
    console.log('Action stories:', stories.data);
  } catch (error) {
    console.error('Error fetching stories by genre:', error);
  }
}

/**
 * 8. Lấy truyện mới cập nhật
 */
export async function exampleGetLatestStories() {
  try {
    const latest = await otruyenApi.getLatestStories({
      page: 1,
      limit: 10,
    });
    console.log('Latest stories:', latest.data);
  } catch (error) {
    console.error('Error fetching latest stories:', error);
  }
}

/**
 * 9. Lấy truyện phổ biến
 */
export async function exampleGetPopularStories() {
  try {
    // Phổ biến trong ngày
    const dailyPopular = await otruyenApi.getPopularStories({
      page: 1,
      limit: 10,
      period: 'day',
    });
    console.log('Daily popular:', dailyPopular.data);

    // Phổ biến trong tuần
    const weeklyPopular = await otruyenApi.getPopularStories({
      page: 1,
      limit: 10,
      period: 'week',
    });
    console.log('Weekly popular:', weeklyPopular.data);
  } catch (error) {
    console.error('Error fetching popular stories:', error);
  }
}

/**
 * 10. Lấy truyện xem nhiều nhất
 */
export async function exampleGetTopViewedStories() {
  try {
    const topViewed = await otruyenApi.getTopViewedStories({
      page: 1,
      limit: 10,
      period: 'month',
    });
    console.log('Top viewed stories:', topViewed.data);
  } catch (error) {
    console.error('Error fetching top viewed stories:', error);
  }
}

/**
 * 11. Lấy truyện đánh giá cao nhất
 */
export async function exampleGetTopRatedStories() {
  try {
    const topRated = await otruyenApi.getTopRatedStories({
      page: 1,
      limit: 10,
    });
    console.log('Top rated stories:', topRated.data);
  } catch (error) {
    console.error('Error fetching top rated stories:', error);
  }
}

/**
 * 12. Lấy truyện liên quan
 */
export async function exampleGetRelatedStories() {
  try {
    const related = await otruyenApi.getRelatedStories('story-id-123', {
      limit: 5,
    });
    console.log('Related stories:', related.data);
  } catch (error) {
    console.error('Error fetching related stories:', error);
  }
}


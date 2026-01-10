import { renderHook, waitFor } from '@testing-library/react';
import { expect, vi, it, describe, beforeAll, afterEach } from 'vitest';
import { otruyenApi, Story, Chapter } from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', () => ({
  otruyenApi: {
    getStoryBySlug: vi.fn(),
    getChapterByUrl: vi.fn(),
  },
  // We need to keep the original enums and type interfaces
  ...vi.importActual('@/lib/api'),
}));

const mockCacheStore = new Map<string, { value: any; expiry: number }>();
const mockCache = {
  get: vi.fn((key) => {
    const entry = mockCacheStore.get(key);
    if (entry && Date.now() < entry.expiry) {
      return entry.value;
    }
    if(entry) mockCacheStore.delete(key);
    return undefined;
  }),
  set: vi.fn((key, value) => {
    mockCacheStore.set(key, { value, expiry: Date.now() + 30 * 60 * 1000 });
  }),
  remove: vi.fn((key) => mockCacheStore.delete(key)),
  clear: vi.fn(() => mockCacheStore.clear()),
};

vi.doMock('@/lib/cache', () => ({
    createCache: vi.fn(() => mockCache),
}));

const { useChapterData } = await import('./useChapterData');


const MOCK_STORY: Story = {
  name: 'Test Story',
  slug: 'test-story',
  chapters: [
    {
      server_name: 'Server 1',
      server_data: [
        { chapter_name: 'Chapter 1', chapter_api_data: 'https://api.com/chapters/chap-1' },
        { chapter_name: 'Chapter 2', chapter_api_data: 'https://api.com/chapters/chap-2' },
      ],
    },
  ],
  _id: "1",
  author: "Test",
  category: [],
  chaptersLatest: [],
  content: "Test",
  origin: "Test",
  poster_url: "Test",
  status: "Ongoing",
  thumb_url: "Test",
};

const MOCK_CHAPTER_1: Chapter = {
  chapter_name: 'Chapter 1',
  chapter_title: 'The Beginning',
  chapter_path: 'chap-1',
  chapter_image: [{ image_page: 1, image_url: 'https://img.com/1.jpg' }],
  chapter_api_data: 'https://api.com/chapters/chap-1'
};

const MOCK_CHAPTER_2: Chapter = {
    chapter_name: 'Chapter 2',
    chapter_title: 'The Next Step',
    chapter_path: 'chap-2',
    chapter_image: [{ image_page: 1, image_url: 'https://img.com/2.jpg' }],
    chapter_api_data: 'https://api.com/chapters/chap-2'
};


// Explicitly cast the mocked functions to the correct type
const mockedGetStoryBySlug = otruyenApi.getStoryBySlug as vi.MockedFunction<typeof otruyenApi.getStoryBySlug>;
const mockedGetChapterByUrl = otruyenApi.getChapterByUrl as vi.MockedFunction<typeof otruyenApi.getChapterByUrl>;

describe('useChapterData', () => {
  beforeAll(() => {
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
    // Mock scroll event logic
    window.addEventListener = vi.fn((event, cb) => {
        if (event === 'scroll') {
            // Immediately invoke the scroll callback to simulate a scroll event
            (cb as EventListener)(new Event('scroll'));
        }
    });
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockCache.clear();
  });

  it('should fetch story and chapter data on initial load', async () => {
    mockedGetStoryBySlug.mockResolvedValue(MOCK_STORY);
    mockedGetChapterByUrl.mockResolvedValue(MOCK_CHAPTER_1);

    const { result } = renderHook(() => useChapterData('test-story', 'chap-1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedGetStoryBySlug).toHaveBeenCalledWith('test-story', expect.any(Object));
    expect(mockedGetChapterByUrl).toHaveBeenCalledWith('https://api.com/chapters/chap-1', expect.any(Object));
    expect(result.current.story).toEqual(MOCK_STORY);
    expect(result.current.chapter).toEqual(MOCK_CHAPTER_1);
  });

  it('should use cached story data on subsequent calls', async () => {
    // First render with chap-1, story is not cached
    mockedGetStoryBySlug.mockResolvedValue(MOCK_STORY);
    mockedGetChapterByUrl.mockResolvedValue(MOCK_CHAPTER_1);

    const { rerender, result } = renderHook(
      ({ slug, chapterId }) => useChapterData(slug, chapterId),
      { initialProps: { slug: 'test-story', chapterId: 'chap-1' } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // The story should have been fetched and cached.
    expect(mockedGetStoryBySlug).toHaveBeenCalledTimes(1);
    expect(mockCache.set).toHaveBeenCalledWith('test-story', MOCK_STORY);
    expect(mockedGetChapterByUrl).toHaveBeenCalledTimes(1);

    // Rerender with chap-2, should use cached story
    mockedGetChapterByUrl.mockResolvedValue(MOCK_CHAPTER_2);
    rerender({ slug: 'test-story', chapterId: 'chap-2' });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // getStoryBySlug should NOT be called again.
    expect(mockedGetStoryBySlug).toHaveBeenCalledTimes(1);
    // getChapterByUrl should be called for the new chapter.
    expect(mockedGetChapterByUrl).toHaveBeenCalledTimes(2);
    // The cache should have been checked for the story
    expect(mockCache.get).toHaveBeenCalledWith('test-story');
  });

  it('should prefetch the next chapter when scrolling to 80%', async () => {
    mockedGetStoryBySlug.mockResolvedValue(MOCK_STORY);
    mockedGetChapterByUrl.mockImplementation(async (url) => {
        if (url.includes('chap-1')) return MOCK_CHAPTER_1;
        if (url.includes('chap-2')) return MOCK_CHAPTER_2;
        return undefined;
    });

    // Define scroll properties
    Object.defineProperty(document.body, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 200, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 801, configurable: true });


    renderHook(() => useChapterData('test-story', 'chap-1'));

    await waitFor(() => {
        // The main call for chap-1
        expect(mockedGetChapterByUrl).toHaveBeenCalledWith('https://api.com/chapters/chap-1', expect.any(Object));
        // The prefetch call for chap-2
        expect(mockedGetChapterByUrl).toHaveBeenCalledWith('https://api.com/chapters/chap-2');
    });

    // Restore original properties
    Object.defineProperty(document.body, 'scrollHeight', { value: 0 });
    Object.defineProperty(window, 'innerHeight', { value: 0 });
    Object.defineProperty(window, 'scrollY', { value: 0 });
  });

});

/**
 * Test script để kiểm tra API response
 * Chạy trong browser console hoặc component để debug
 */

import { otruyenApi } from './api';

export async function testApiEndpoints() {
  console.log('=== Testing API Endpoints ===\n');

  try {
    // Test 1: /home endpoint
    console.log('1. Testing /home endpoint...');
    const homeResponse = await otruyenApi.getHomeStories({ page: 1, limit: 5 });
    console.log('Home Response:', homeResponse);
    console.log('Home Response Type:', typeof homeResponse);
    console.log('Is Array:', Array.isArray(homeResponse));
    console.log('Has data:', 'data' in homeResponse);
    console.log('Has items:', 'items' in homeResponse);
    console.log('Has results:', 'results' in homeResponse);
    console.log('');

    // Test 2: /the-loai endpoint
    console.log('2. Testing /the-loai endpoint...');
    const genresResponse = await otruyenApi.getGenres();
    console.log('Genres Response:', genresResponse);
    console.log('Genres Response Type:', typeof genresResponse);
    console.log('Is Array:', Array.isArray(genresResponse));
    console.log('Has data:', 'data' in genresResponse);
    console.log('Has items:', 'items' in genresResponse);
    console.log('Has results:', 'results' in genresResponse);
    console.log('');

    // Test 3: /danh-sach/truyen-moi endpoint
    console.log('3. Testing /danh-sach/truyen-moi endpoint...');
    const latestResponse = await otruyenApi.getLatestStories({ page: 1, limit: 5 });
    console.log('Latest Response:', latestResponse);
    console.log('Latest Response Type:', typeof latestResponse);
    console.log('Is Array:', Array.isArray(latestResponse));
    console.log('Has data:', 'data' in latestResponse);
    console.log('Has items:', 'items' in latestResponse);
    console.log('Has results:', 'results' in latestResponse);
    console.log('');

    // Test 4: Raw fetch để xem response thực tế
    console.log('4. Testing raw fetch to /home...');
    const rawResponse = await fetch('https://otruyenapi.com/v1/api/home');
    const rawData = await rawResponse.json();
    console.log('Raw Response:', rawData);
    console.log('Raw Response Type:', typeof rawData);
    console.log('Is Array:', Array.isArray(rawData));
    console.log('');

    return {
      home: homeResponse,
      genres: genresResponse,
      latest: latestResponse,
      raw: rawData,
    };
  } catch (error) {
    console.error('Error testing API:', error);
    throw error;
  }
}


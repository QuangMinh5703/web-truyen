# Accessibility Guide - Comic Reader

## Overview

D? án Comic Reader tuân th? các nguyên t?c WCAG 2.1 Level AA ?? ??m b?o tr?i nghi?m t?t cho t?t c? ng??i dùng, bao g?m nh?ng ng??i khuy?t t?t.

## Core Principles

### 1. Perceivable (Có th? nh?n th?c ???c)
- **Text Alternatives**: T?t c? hình ?nh ph?i có alt text
- **Captions**: Video và audio ph?i có ph? ??
- **Adaptable**: Content có th? hi?n th? theo nhi?u cách khác nhau
- **Distinguishable**: Text và background ph?i có ?? t??ng ph?n ??

### 2. Operable (Có th? ?i?u khi?n ???c)
- **Keyboard Accessible**: T?t c? ch?c n?ng có th? s? d?ng b?ng bàn phím
- **Enough Time**: Ng??i dùng có ?? th?i gian ?? ??c và s? d?ng content
- **Seizures**: Không s? d?ng animation gây co gi?t
- **Navigable**: D? dàng tìm và ?i?u h??ng

### 3. Understandable (Có th? hi?u ???c)
- **Readable**: Text có th? ??c ???c và d? hi?u
- **Predictable**: Giao di?n ho?t ??ng theo cách có th? d? ?oán
- **Input Assistance**: Giúp ng??i dùng tránh và s?a l?i

### 4. Robust (M?nh m?)
- **Compatible**: T??ng thích v?i assistive technologies

## Implementation Guidelines

### Keyboard Navigation

#### Tab Order
```tsx
// Proper tab order for story cards
<Link 
  href={`/truyen/${slug}`}
  tabIndex={0}
  role="article"
  aria-label={`??c truy?n ${storyTitle}`}
>
  {/* Content */}
</Link>
```

#### Keyboard Shortcuts
```tsx
// Navigation shortcuts in reader
const handleKeyPress = useCallback((event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
    case 'a':
    case 'A':
      event.preventDefault();
      goToPreviousPage();
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
    case ' ': // Spacebar
      event.preventDefault();
      goToNextPage();
      break;
    case 'Escape':
      event.preventDefault();
      exitFullscreen();
      break;
  }
}, [goToPreviousPage, goToNextPage, exitFullscreen]);
```

#### Focus Management
```tsx
// Focus trap in modals
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements?.length) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  };
  
  document.addEventListener('keydown', handleTabKey);
  return () => document.removeEventListener('keydown', handleTabKey);
}, []);
```

### Screen Reader Support

#### ARIA Labels
```tsx
// Proper ARIA labels for story grid
<div 
  role="grid" 
  aria-label="Danh sách truy?n tranh"
  aria-describedby="story-grid-description"
>
  <div id="story-grid-description" className="sr-only">
    S? d?ng phím Tab ?? di chuy?n gi?a các truy?n. 
    Nh?n Enter ?? m? truy?n.
  </div>
  
  {stories.map(story => (
    <article 
      key={story.id}
      role="gridcell"
      aria-label={`${story.title}, ${story.status}, ${story.views} l??t xem`}
    >
      {/* Story content */}
    </article>
  ))}
</div>
```

#### Live Regions
```tsx
// Status announcements for screen readers
<div 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {loading && '?ang t?i danh sách truy?n...'}
  {error && `L?i: ${error}`}
  {success && `?ã t?i thành công ${stories.length} truy?n`}
</div>
```

### Visual Design

#### Color Contrast
```css
/* Ensure sufficient contrast ratios */
.text-primary {
  color: #1a202c; /* Dark text on light background */
  background-color: #ffffff;
}

.text-secondary {
  color: #4a5568; /* Medium gray for secondary text */
  background-color: #ffffff;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .text-primary {
    color: #f7fafc;
    background-color: #1a202c;
  }
  
  .text-secondary {
    color: #cbd5e0;
    background-color: #1a202c;
  }
}
```

#### Focus Indicators
```css
/* Visible focus indicators */
.focus-visible:focus {
  outline: 2px solid #3182ce;
  outline-offset: 2px;
}

.focus-visible:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .focus-visible:focus {
    outline: 3px solid #000000;
    background-color: #ffff00;
  }
}
```

### Reader-Specific Accessibility

#### Reading Progress
```tsx
// Accessible progress indicator
<div 
  role="progressbar"
  aria-valuenow={currentPage}
  aria-valuemin={0}
  aria-valuemax={totalPages}
  aria-label={`Trang ${currentPage + 1} c?a ${totalPages}`}
>
  <div 
    style={{ width: `${progress}%` }}
    aria-hidden="true"
  />
</div>
```

#### Chapter Navigation
```tsx
// Accessible chapter list
<nav aria-label="Danh sách ch??ng">
  <ul role="list">
    {chapters.map(chapter => (
      <li key={chapter.id}>
        <button
          aria-current={chapter.id === currentChapterId ? 'true' : 'false'}
          aria-describedby={`chapter-${chapter.id}-description`}
        >
          {chapter.name}
        </button>
        <span 
          id={`chapter-${chapter.id}-description`}
          className="sr-only"
        >
          {chapter.isRead ? '?ã ??c' : 'Ch?a ??c'}
        </span>
      </li>
    ))}
  </ul>
</nav>
```

#### Image Descriptions
```tsx
// Accessible images in reader
<Image
  src={imageUrl}
  alt={`Trang ${pageNumber} - ${storyTitle} Ch??ng ${chapterName}`}
  width={800}
  height={1200}
  role="img"
  aria-describedby={`image-description-${pageNumber}`}
/>

<div 
  id={`image-description-${pageNumber}`}
  className="sr-only"
>
  {pageDescription || 'Hình ?nh trang truy?n'}
</div>
```

### Motion and Animation

#### Reduced Motion
```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// Conditional animations
const shouldAnimate = !prefersReducedMotion;

<div 
  className={shouldAnimate ? 'animate-fade-in' : ''}
  aria-hidden={shouldAnimate ? 'true' : 'false'}
>
  {/* Content */}
</div>
```

### Font and Typography

#### Scalable Text
```css
/* Use relative units for scalable text */
.story-title {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  line-height: 1.4;
}

.chapter-text {
  font-size: 1rem;
  line-height: 1.6;
  letter-spacing: 0.025em;
}
```

#### Font Loading
```tsx
// Web font loading with fallback
<link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossOrigin />

<style jsx>{`
  @font-face {
    font-family: 'Main Font';
    src: url('/fonts/main-font.woff2') format('woff2');
    font-display: swap; /* Prevent invisible text during font load */
  }
`}</style>
```

### Forms and Input

#### Label Associations
```tsx
// Proper form labels
<label htmlFor="search-input" className="sr-only">
  Tìm ki?m truy?n
</label>
<input
  id="search-input"
  type="search"
  placeholder="Nh?p tên truy?n..."
  aria-describedby="search-help"
  aria-required="true"
/>
<div id="search-help" className="sr-only">
  Nh?p ít nh?t 2 ký t? ?? tìm ki?m
</div>
```

#### Error Handling
```tsx
// Accessible error messages
<div 
  role="alert"
  aria-live="polite"
  className="error-message"
>
  {error && (
    <p>
      <span aria-hidden="true">??</span>
      <span className="sr-only">L?i: </span>
      {error}
    </p>
  )}
</div>
```

### Testing and Validation

#### Automated Testing
```bash
# Install accessibility testing tools
npm install --save-dev @axe-core/react jest-axe

# Add to test setup
import { configureAxe } from '@axe-core/react';

configureAxe({
  rules: [
    {
      id: 'color-contrast',
      enabled: true
    }
  ]
});
```

#### Manual Testing Checklist

**Keyboard Navigation**
- [ ] All interactive elements accessible via Tab
- [ ] Tab order is logical
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Escape key closes modals/dropdowns

**Screen Reader**
- [ ] All images have meaningful alt text
- [ ] Form fields have labels
- [ ] Headings follow proper hierarchy
- [ ] Live regions announce dynamic changes
- [ ] ARIA labels provide context

**Visual Design**
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are clearly visible
- [ ] Text is readable at 200% zoom
- [ ] Animations can be disabled
- [ ] High contrast mode supported

**Reader Specific**
- [ ] Chapter navigation accessible
- [ ] Reading progress announced
- [ ] Image descriptions provided
- [ ] Keyboard shortcuts documented
- [ ] Zoom functionality works

### Performance Considerations

#### Lazy Loading
```tsx
// Lazy load images with proper alt text
<Image
  src={imageUrl}
  alt={imageDescription}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

#### Critical CSS
```css
/* Inline critical styles for above-the-fold content */
.critical-styles {
  font-family: system-ui, sans-serif;
  color: #1a202c;
  background-color: #ffffff;
}
```

### Browser Support

#### Progressive Enhancement
```html
<!-- Provide basic functionality without JavaScript -->
<noscript>
  <div role="alert">
    JavaScript is required for the full experience. 
    Basic reading functionality is still available.
  </div>
</noscript>
```

#### Feature Detection
```tsx
// Detect and handle missing features
const supportsFullscreen = !!document.fullscreenEnabled;

if (!supportsFullscreen) {
  // Provide alternative UI
  return <ReaderWithoutFullscreen />;
}
```

## Common Accessibility Issues and Solutions

### Issue: Images without alt text
**Solution**: Always provide descriptive alt text
```tsx
// ? Bad
<Image src="/cover.jpg" />

// ? Good
<Image 
  src="/cover.jpg" 
  alt="Bìa truy?n One Piece - Monkey D. Luffy v?i chi?c m? r?m" 
/>
```

### Issue: Poor color contrast
**Solution**: Use tools to check contrast ratios
```css
/* ? Good contrast ratio (4.5:1 minimum) */
.text-primary { color: #1a202c; background: #ffffff; }
.text-secondary { color: #4a5568; background: #ffffff; }
```

### Issue: Missing focus indicators
**Solution**: Provide visible focus styles
```css
/* ? Good focus indicators */
button:focus-visible {
  outline: 2px solid #3182ce;
  outline-offset: 2px;
}
```

### Issue: No keyboard navigation
**Solution**: Ensure all interactions work with keyboard
```tsx
// ? Good keyboard support
<button onClick={handleClick} onKeyDown={handleKeyDown}>
  Next Page
</button>
```

## Tools and Resources

### Testing Tools
- **axe-core**: Automated accessibility testing
- **Lighthouse**: Accessibility audits in Chrome DevTools
- **WAVE**: Web accessibility evaluation tool
- **Color Contrast Analyzers**: Check contrast ratios

### Development Tools
- **React Accessibility ESLint Rules**: lint-plugin-jsx-a11y
- **Headless UI**: Accessible component primitives
- **Radix UI**: Unstyled accessible components

### Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Continuous Improvement

### Regular Audits
- Conduct accessibility audits monthly
- Test with real users who have disabilities
- Update guidelines based on new WCAG versions
- Monitor accessibility feedback and issues

### Team Training
- Provide accessibility training for all developers
- Include accessibility in code reviews
- Share accessibility best practices
- Encourage inclusive design thinking

Remember: **Accessibility is not a feature, it's a requirement.**
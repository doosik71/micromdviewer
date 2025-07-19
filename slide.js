let currentTheme = localStorage.getItem('currentTheme') || 'light';
let currentFile = 'index.md';
let markdownContent = '';
let slides = [];
let currentSlide = 0;
let searchResults = [];
let isFullscreen = false;

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    currentFile = urlParams.get('file') || 'index.md';
    
    applyTheme(currentTheme);
    loadMarkdownFile();
    setupKeyboardNavigation();

    // Set initial active theme button
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    const activeThemeBtn = document.querySelector(`[data-theme="${currentTheme}"]`);
    if (activeThemeBtn) {
        activeThemeBtn.classList.add('active');
    }
}

function changeTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('currentTheme', currentTheme); // Save to localStorage
    applyTheme(currentTheme);
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
}

function switchToPageView() {
    window.location.href = `page.html?file=${encodeURIComponent(currentFile)}`;
}

async function loadMarkdownFile() {
    try {
        const response = await fetch(currentFile);
        if (!response.ok) {
            throw new Error(`File not found: ${currentFile}`);
        }

        markdownContent = await response.text();
        parseSlides();
        renderCurrentSlide();
        updateNavigation();
        generateOverview();
    } catch (error) {
        console.error('Failed to load markdown file:', error);
        const errorContent = `
            <div class="error">
                <h2>File Loading Error</h2>
                <p><strong>Error:</strong> ${error.message}</p>
            </div>
        `;
        document.getElementById('slide-content').innerHTML = errorContent;
    }
}

function parseSlides() {
    const sections = markdownContent.split(/^#{1,2}\s+/m);
    slides = [];

    if (sections.length > 1) {
        for (let i = 1; i < sections.length; i++) {
            const content = sections[i].trim();
            const lines = content.split('\n');
            const title = lines[0].replace(/#+\s*/, '');
            const body = lines.slice(1).join('\n').trim();

            slides.push({
                title: title,
                content: `# ${title}\n\n${body}`,
                rawContent: content
            });
        }
    } else {
        slides.push({
            title: 'Complete Document',
            content: markdownContent,
            rawContent: markdownContent
        });
    }

    if (slides.length === 0) {
        slides.push({
            title: 'Empty Document',
            content: '# Empty Document\n\nNo content available.',
            rawContent: 'No content available.'
        });
    }
}

function renderCurrentSlide() {
    const slide = slides[currentSlide];
    if (!slide) return;

    if (typeof marked === 'undefined') {
        document.getElementById('slide-content').innerHTML = `
            <div class="error">
                <h2>Library Error</h2>
                <p>Marked.js library failed to load. Please check your internet connection and refresh the page.</p>
            </div>
        `;
        return;
    }

    const renderer = createMarkedRenderer();
    marked.setOptions({
        renderer: renderer,
        gfm: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
    });

    const html = marked.parse(slide.content);
    document.getElementById('slide-content').innerHTML = html;

    waitForMathJax(() => {
        processMathJax();
    });

    waitForMermaid(() => {
        runMermaid();
    });

    updateProgress();

    // Intercept clicks on links to handle internal vs external links
    document.getElementById('slide-content').addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.href) {
            const clickedUrl = new URL(e.target.href);
            const currentOrigin = window.location.origin;

            // Handle same-origin links
            if (clickedUrl.origin === currentOrigin) {
                let filename = '';
                if (clickedUrl.searchParams.has('file')) {
                    filename = clickedUrl.searchParams.get('file');
                } else {
                    const pathname = clickedUrl.pathname;
                    const lastSlashIndex = pathname.lastIndexOf('/');
                    filename = pathname.substring(lastSlashIndex + 1);
                }

                // If it's a markdown file, handle specially
                if (filename.endsWith('.md')) {
                    e.preventDefault();
                    window.location.href = `${currentOrigin}/?file=${encodeURIComponent(filename)}`;
                    return;
                }
                // For other same-origin links, allow default behavior (same window)
                return;
            }
            
            // For external links, open in new window
            e.preventDefault();
            window.open(e.target.href, '_blank');
        }
    });
}

function updateNavigation() {
    document.getElementById('current-slide').textContent = currentSlide + 1;
    document.getElementById('total-slides').textContent = slides.length;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === slides.length - 1;
}

function updateProgress() {
    const progress = ((currentSlide + 1) / slides.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function nextSlide() {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        renderCurrentSlide();
        updateNavigation();
        updateOverviewHighlight();
    }
}

function previousSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        renderCurrentSlide();
        updateNavigation();
        updateOverviewHighlight();
    }
}

function goToSlide(index) {
    if (index >= 0 && index < slides.length) {
        currentSlide = index;
        renderCurrentSlide();
        updateNavigation();
        updateOverviewHighlight();
    }
}

function resetSlides() {
    currentSlide = 0;
    renderCurrentSlide();
    updateNavigation();
    updateOverviewHighlight();
}

function generateOverview() {
    const overviewContent = document.getElementById('overview-content');
    let overviewHTML = '';

    slides.forEach((slide, index) => {
        const isActive = index === currentSlide ? 'active' : '';
        const preview = slide.rawContent.substring(0, 100) + '...';

        overviewHTML += `
            <div class="overview-slide ${isActive}" onclick="goToSlide(${index})">
                <h3>${slide.title}</h3>
                <p>${preview}</p>
            </div>
        `;
    });

    overviewContent.innerHTML = overviewHTML;
}

function updateOverviewHighlight() {
    const overviewSlides = document.querySelectorAll('.overview-slide');
    overviewSlides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
}

function toggleOverview() {
    const overview = document.getElementById('slide-overview');
    overview.classList.toggle('active');

    if (overview.classList.contains('active')) {
        generateOverview();
    }
}

function toggleSearch() {
    const search = document.getElementById('slide-search');
    search.classList.toggle('active');

    if (search.classList.contains('active')) {
        document.getElementById('search-input').focus();
    }
}

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.trim();
    const caseSensitive = document.getElementById('case-sensitive').checked;
    const useRegex = document.getElementById('regex-search').checked;

    updateClearButtonVisibility();

    if (!searchTerm) {
        clearSearchResults();
        return;
    }

    try {
        searchResults = [];

        let searchPattern;
        if (useRegex) {
            searchPattern = new RegExp(searchTerm, caseSensitive ? 'g' : 'gi');
        } else {
            const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\\]/g, '\\$&');
            searchPattern = new RegExp(escapedTerm, caseSensitive ? 'g' : 'gi');
        }

        slides.forEach((slide, slideIndex) => {
            const matches = [...slide.rawContent.matchAll(searchPattern)];

            matches.forEach(match => {
                const startIndex = match.index;
                const contextStart = Math.max(0, startIndex - 50);
                const contextEnd = Math.min(slide.rawContent.length, startIndex + match[0].length + 50);
                const context = slide.rawContent.substring(contextStart, contextEnd);

                searchResults.push({
                    slideIndex: slideIndex,
                    slideTitle: slide.title,
                    match: match[0],
                    context: context,
                    position: startIndex
                });
            });
        });

        displaySearchResults();
    } catch (error) {
        document.getElementById('search-results').innerHTML = `
            <div class="search-error">Search error: ${error.message}</div>
        `;
    }
}

function displaySearchResults() {
    const resultsContainer = document.getElementById('search-results');

    if (searchResults.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No search results found.</div>';
        return;
    }

    let resultsHTML = `<div class="search-summary">Found ${searchResults.length} result(s).</div>`;

    searchResults.forEach((result, index) => {
        const highlightedContext = result.context.replace(
            new RegExp(result.match.replace(/[.*+?^${}()|[\\]/g, '\\$&'), 'gi'),
            `<span class="search-highlight">${result.match}</span>`
        );

        resultsHTML += `
            <div class="search-result" onclick="jumpToSearchResult(${index})">
                <div class="search-result-slide">Slide ${result.slideIndex + 1}: ${result.slideTitle}</div>
                <div class="search-result-preview">
                    ...${highlightedContext}...
                </div>
            </div>
        `;
    });

    resultsContainer.innerHTML = resultsHTML;
}

function jumpToSearchResult(index) {
    const result = searchResults[index];
    goToSlide(result.slideIndex);
    toggleSearch();
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
    searchResults = [];
    updateClearButtonVisibility();
}

function clearSearchResults() {
    document.getElementById('search-results').innerHTML = '';
    searchResults = [];
}

function updateClearButtonVisibility() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.querySelector('.search-clear-btn');
    if (clearBtn) {
        clearBtn.style.display = searchInput.value.trim() ? 'block' : 'none';
    }
}

function toggleFullscreen() {
    if (!isFullscreen) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
        isFullscreen = true;
        document.body.classList.add('fullscreen');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        isFullscreen = false;
        document.body.classList.remove('fullscreen');
    }
}

function setupKeyboardNavigation() {
    document.addEventListener('keydown', function (e) {
        switch (e.key) {
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                previousSlide();
                break;
            case 'Home':
                e.preventDefault();
                resetSlides();
                break;
            case 'End':
                e.preventDefault();
                goToSlide(slides.length - 1);
                break;
            case 'f':
            case 'F11':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'o':
                if (e.ctrlKey) {
                    e.preventDefault();
                    toggleOverview();
                }
                break;
            case 'f':
                if (e.ctrlKey) {
                    e.preventDefault();
                    toggleSearch();
                }
                break;
            case 'Escape':
                document.getElementById('slide-overview').classList.remove('active');
                document.getElementById('slide-search').classList.remove('active');
                break;
        }
    });
}

document.addEventListener('fullscreenchange', function () {
    isFullscreen = !!document.fullscreenElement;
    document.body.classList.toggle('fullscreen', isFullscreen);
});

document.addEventListener('webkitfullscreenchange', function () {
    isFullscreen = !!document.webkitFullscreenElement;
    document.body.classList.toggle('fullscreen', isFullscreen);
});

window.addEventListener('load', () => waitForLibraries(init));

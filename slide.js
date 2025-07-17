let currentTheme = 'light';
let currentFile = 'index.md';
let markdownContent = '';
let slides = [];
let currentSlide = 0;
let searchResults = [];
let isFullscreen = false;

// Mermaid helper functions
function initializeMermaid() {
    if (typeof mermaid !== 'undefined') {
        try {
            console.log('Initializing Mermaid...');
            mermaid.initialize({
                startOnLoad: false,
                theme: currentTheme === 'dark' ? 'dark' : 'default',
                securityLevel: 'loose'
            });
            console.log('Mermaid initialized successfully');
        } catch (error) {
            console.warn('Mermaid initialization failed:', error);
        }
    } else {
        console.warn('Mermaid is not available for initialization');
    }
}

function runMermaid() {
    if (typeof mermaid !== 'undefined') {
        try {
            console.log('Running Mermaid rendering...');
            // Use a timeout to ensure DOM is ready
            setTimeout(() => {
                if (typeof mermaid !== 'undefined') {
                    mermaid.run();
                    console.log('Mermaid rendering completed');
                } else {
                    console.warn('Mermaid became undefined during timeout');
                }
            }, 200);
        } catch (error) {
            console.warn('Mermaid rendering failed:', error);
        }
    } else {
        console.warn('Mermaid is not available for rendering');
    }
}

// Wait for mermaid specifically
function waitForMermaid(callback, maxWait = 5000) {
    const startTime = Date.now();
    
    const checkMermaid = () => {
        if (typeof mermaid !== 'undefined') {
            console.log('Mermaid is now available');
            callback();
        } else if (Date.now() - startTime < maxWait) {
            setTimeout(checkMermaid, 100);
        } else {
            console.warn('Mermaid failed to load within', maxWait, 'ms');
            callback(); // Continue anyway
        }
    };
    
    checkMermaid();
}

// Enhanced MathJax processing with better version detection
function processMathJax() {
    if (typeof MathJax === 'undefined') {
        console.warn('MathJax is not available');
        return;
    }
    
    try {
        console.log('Processing MathJax...');
        console.log('MathJax version info:', {
            version: MathJax.version || 'unknown',
            hasTypesetPromise: typeof MathJax.typesetPromise === 'function',
            hasTypeset: typeof MathJax.typeset === 'function',
            hasHub: typeof MathJax.Hub !== 'undefined',
            hasStartup: typeof MathJax.startup !== 'undefined'
        });
        
        // MathJax 3.x with async typeset
        if (typeof MathJax.typesetPromise === 'function') {
            console.log('Using MathJax 3.x typesetPromise');
            MathJax.typesetPromise().then(() => {
                console.log('MathJax typesetPromise completed');
            }).catch(err => {
                console.warn('MathJax typesetPromise failed:', err);
            });
        }
        // MathJax 3.x with sync typeset
        else if (typeof MathJax.typeset === 'function') {
            console.log('Using MathJax 3.x typeset');
            MathJax.typeset();
            console.log('MathJax typeset completed');
        }
        // MathJax 3.x with startup
        else if (MathJax.startup && typeof MathJax.startup.document === 'object') {
            console.log('Using MathJax 3.x startup');
            MathJax.startup.document.render();
            console.log('MathJax startup render completed');
        }
        // MathJax 2.x
        else if (MathJax.Hub && typeof MathJax.Hub.Queue === 'function') {
            console.log('Using MathJax 2.x Hub.Queue');
            MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
            console.log('MathJax Hub.Queue completed');
        }
        // Last resort - try to trigger any available render method
        else if (typeof MathJax.renderMath === 'function') {
            console.log('Using MathJax renderMath fallback');
            MathJax.renderMath();
        }
        else {
            console.warn('No compatible MathJax rendering method found');
            console.warn('Available MathJax methods:', Object.keys(MathJax));
        }
    } catch (error) {
        console.warn('MathJax processing failed:', error);
        console.warn('MathJax object:', MathJax);
    }
}

// Wait for MathJax specifically
function waitForMathJax(callback, maxWait = 5000) {
    const startTime = Date.now();
    
    const checkMathJax = () => {
        if (typeof MathJax !== 'undefined') {
            console.log('MathJax is now available');
            callback();
        } else if (Date.now() - startTime < maxWait) {
            setTimeout(checkMathJax, 100);
        } else {
            console.warn('MathJax failed to load within', maxWait, 'ms');
            callback(); // Continue anyway
        }
    };
    
    checkMathJax();
}

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    currentFile = urlParams.get('file') || 'index.md';
    currentTheme = urlParams.get('theme') || 'light';
    
    applyTheme(currentTheme);
    loadMarkdownFile();
    setupKeyboardNavigation();
    
    // Initialize Mermaid if available
    initializeMermaid();
}

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
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
        
        // Provide helpful error messages and fallback content
        const errorContent = `
            <div class="error">
                <h2>File Loading Error</h2>
                <p><strong>Error:</strong> ${error.message}</p>
                
                <h3>Possible Solutions:</h3>
                <ul>
                    <li><strong>Use a local server:</strong> Run <code>python -m http.server 8000</code> and visit <code>http://localhost:8000</code></li>
                    <li><strong>Check file path:</strong> Ensure the markdown file exists in the correct location</li>
                    <li><strong>Try a different browser:</strong> Some browsers have stricter security policies</li>
                </ul>
                
                <h3>Sample Slide Content:</h3>
            </div>
        `;
        
        // Add some sample content
        const sampleMarkdown = `# Welcome to Slide Mode

This is **sample slide content**!

## Slide Features
- Slide-by-slide navigation
- Keyboard shortcuts
- Fullscreen support

### Navigation
- Use arrow keys to navigate
- Press F for fullscreen
- Press Ctrl+O for overview`;
        
        document.getElementById('slide-content').innerHTML = errorContent;
        
        // Try to render sample content
        if (typeof marked !== 'undefined') {
            markdownContent = sampleMarkdown;
            slides = [{
                title: 'Sample Slide',
                content: sampleMarkdown,
                rawContent: sampleMarkdown
            }];
            renderCurrentSlide();
        }
        
        updateNavigation();
        generateOverview();
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
    
    // Check if marked is available
    if (typeof marked === 'undefined') {
        document.getElementById('slide-content').innerHTML = `
            <div class="error">
                <h2>Library Error</h2>
                <p>Marked.js library failed to load. Please check your internet connection and refresh the page.</p>
            </div>
        `;
        return;
    }
    
    const renderer = new marked.Renderer();
    
    renderer.code = function(code, language) {
        if (language === 'mermaid') {
            return `<div class="mermaid">${code}</div>`;
        }
        
        let highlighted;
        if (typeof hljs !== 'undefined') {
            highlighted = language ? 
                hljs.highlight(code, { language }).value : 
                hljs.highlightAuto(code).value;
        } else {
            highlighted = code; // Fallback to plain text
        }
        
        return `<pre><code class="hljs ${language || ''}">${highlighted}</code></pre>`;
    };
    
    renderer.heading = function(text, level) {
        const id = text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        return `<h${level} id="${id}">${text}</h${level}>`;
    };
    
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
    
    // Process MathJax if available
    processMathJax();
    
    // Run Mermaid if available
    waitForMermaid(() => {
        runMermaid();
    });
    updateProgress();
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
            const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
            new RegExp(result.match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
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

function clearSearchResults() {
    document.getElementById('search-results').innerHTML = '';
    searchResults = [];
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
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
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

document.addEventListener('fullscreenchange', function() {
    isFullscreen = !!document.fullscreenElement;
    document.body.classList.toggle('fullscreen', isFullscreen);
});

document.addEventListener('webkitfullscreenchange', function() {
    isFullscreen = !!document.webkitFullscreenElement;
    document.body.classList.toggle('fullscreen', isFullscreen);
});

// Wait for all libraries to load before initializing
function waitForLibraries() {
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max
    
    const checkLibraries = () => {
        attempts++;
        
        // Check if essential libraries are loaded
        const markedReady = typeof marked !== 'undefined';
        const hlReady = typeof hljs !== 'undefined';
        const mermaidReady = typeof mermaid !== 'undefined';
        const mathJaxReady = typeof MathJax !== 'undefined';
        
        console.log(`Library check attempt ${attempts}:`, {
            marked: markedReady,
            hljs: hlReady,
            mermaid: mermaidReady,
            mathJax: mathJaxReady
        });
        
        if (markedReady && hlReady) {
            console.log('Essential libraries loaded, initializing...');
            init();
        } else if (attempts < maxAttempts) {
            setTimeout(checkLibraries, 100);
        } else {
            console.warn('Some libraries failed to load after', maxAttempts * 100, 'ms');
            console.warn('Initializing with available libraries');
            init();
        }
    };
    
    checkLibraries();
}

window.addEventListener('load', waitForLibraries);
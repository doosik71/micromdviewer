let currentTheme = 'light';
let currentFile = 'index.md';
let markdownContent = '';
let searchResults = [];
let currentSearchIndex = 0;
let mermaidInitialized = false;

// Mermaid helper functions
function initializeMermaid() {
    if (mermaidInitialized) return;
    if (typeof mermaid !== 'undefined') {
        try {
            console.log('Initializing Mermaid...');
            mermaid.initialize({
                startOnLoad: false,
                theme: currentTheme === 'dark' ? 'dark' : 'default',
                securityLevel: 'loose'
            });
            mermaidInitialized = true;
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
            initializeMermaid();
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
        renderMarkdown();
    } catch (error) {
        console.error('Failed to load markdown file:', error);
        
        // Provide helpful error messages and fallback content
        const errorContent = `
            <div class="error">
                <h2>File Loading Error</h2>
                <p><strong>Error:</strong> ${error.message}</p>
                
                <h3>Possible Solutions:</h3>
                <ul>
                    <li><strong>Use a local server:</strong> Open a terminal in this directory and run:
                        <pre>python -m http.server 8000</pre>
                        Then visit <code>http://localhost:8000</code>
                    </li>
                    <li><strong>Check file path:</strong> Ensure the markdown file is in the same directory as index.html</li>
                    <li><strong>Try a different browser:</strong> Some browsers have stricter security policies</li>
                    <li><strong>Use online hosting:</strong> Upload files to GitHub Pages or similar service</li>
                </ul>
                
                <h3>Sample Content:</h3>
                <p>Here's some sample markdown content to test the viewer:</p>
            </div>
        `;
        
        // Add some sample content to demonstrate functionality
        const sampleMarkdown = `# Welcome to Micro Markdown Viewer

This is **sample content** showing that the viewer works!

## Features
- Markdown rendering
- Code highlighting
- Math equations: $E = mc^2$
- And more!

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

> This is a blockquote to test styling.

### How to fix the file loading issue
1. Use a local web server
2. Check file permissions
3. Verify file paths`;
        
        // Render the error message first
        document.getElementById('content').innerHTML = errorContent;
        
        // Then try to render some sample content
        if (typeof marked !== 'undefined') {
            markdownContent = sampleMarkdown;
            const sampleHtml = marked.parse(sampleMarkdown);
            document.getElementById('content').innerHTML = errorContent + sampleHtml;
        }
        
        generateTOC();
    }
}

function renderMarkdown() {
    // Check if marked is available
    if (typeof marked === 'undefined') {
        document.getElementById('content').innerHTML = `
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
    
    const html = marked.parse(markdownContent);
    document.getElementById('content').innerHTML = html;
    
    // Process MathJax if available
    processMathJax();
    
    // Run Mermaid if available
    waitForMermaid(() => {
        runMermaid();
    });
    generateTOC();
}

function generateTOC() {
    const headings = document.querySelectorAll('.content h1, .content h2, .content h3, .content h4, .content h5, .content h6');
    const tocContent = document.getElementById('toc-content');
    
    if (headings.length === 0) {
        tocContent.innerHTML = '<p>No table of contents available.</p>';
        return;
    }
    
    let tocHTML = '<ul>';
    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const text = heading.textContent;
        const id = heading.id || `heading-${index}`;
        
        if (!heading.id) {
            heading.id = id;
        }
        
        tocHTML += `<li><a href="#${id}" class="toc-h${level}" onclick="scrollToHeading('${id}')">${text}</a></li>`;
    });
    tocHTML += '</ul>';
    
    tocContent.innerHTML = tocHTML;
}

function scrollToHeading(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function toggleToc() {
    const tocContainer = document.getElementById('toc-container');
    tocContainer.classList.toggle('active');
}

function toggleSearch() {
    const searchContainer = document.getElementById('search-container');
    searchContainer.classList.toggle('active');
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
        const content = document.getElementById('content');
        const textContent = content.textContent;
        
        let searchPattern;
        if (useRegex) {
            searchPattern = new RegExp(searchTerm, caseSensitive ? 'g' : 'gi');
        } else {
            const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            searchPattern = new RegExp(escapedTerm, caseSensitive ? 'g' : 'gi');
        }
        
        const matches = [...textContent.matchAll(searchPattern)];
        
        matches.forEach((match, index) => {
            const startIndex = match.index;
            const contextStart = Math.max(0, startIndex - 50);
            const contextEnd = Math.min(textContent.length, startIndex + match[0].length + 50);
            const context = textContent.substring(contextStart, contextEnd);
            
            searchResults.push({
                index: index,
                match: match[0],
                context: context,
                position: startIndex
            });
        });
        
        displaySearchResults();
        highlightSearchResults(searchPattern);
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
                <div class="search-result-preview">
                    ...${highlightedContext}...
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = resultsHTML;
}

function jumpToSearchResult(index) {
    currentSearchIndex = index;
    const result = searchResults[index];
    
    clearHighlights();
    
    const content = document.getElementById('content');
    const walker = document.createTreeWalker(
        content,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let currentPos = 0;
    let node;
    
    while (node = walker.nextNode()) {
        const nodeLength = node.textContent.length;
        if (currentPos + nodeLength > result.position) {
            const relativePos = result.position - currentPos;
            const range = document.createRange();
            range.setStart(node, relativePos);
            range.setEnd(node, relativePos + result.match.length);
            
            const span = document.createElement('span');
            span.className = 'highlight';
            span.textContent = result.match;
            
            range.deleteContents();
            range.insertNode(span);
            
            span.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
        }
        currentPos += nodeLength;
    }
}

function highlightSearchResults(pattern) {
    clearHighlights();
    
    const content = document.getElementById('content');
    const walker = document.createTreeWalker(
        content,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        const matches = [...text.matchAll(pattern)];
        
        if (matches.length > 0) {
            const parent = textNode.parentNode;
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            
            matches.forEach(match => {
                if (match.index > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
                }
                
                const span = document.createElement('span');
                span.className = 'search-highlight';
                span.textContent = match[0];
                fragment.appendChild(span);
                
                lastIndex = match.index + match[0].length;
            });
            
            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            }
            
            parent.replaceChild(fragment, textNode);
        }
    });
}

function clearHighlights() {
    const highlights = document.querySelectorAll('.search-highlight, .highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
}

function clearSearchResults() {
    document.getElementById('search-results').innerHTML = '';
    clearHighlights();
    searchResults = [];
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function printPage() {
    window.print();
}

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        toggleSearch();
        document.getElementById('search-input').focus();
    }
    
    if (e.key === 'Escape') {
        const tocContainer = document.getElementById('toc-container');
        const searchContainer = document.getElementById('search-container');
        tocContainer.classList.remove('active');
        searchContainer.classList.remove('active');
    }
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
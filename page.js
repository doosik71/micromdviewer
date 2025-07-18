let currentTheme = localStorage.getItem('currentTheme') || 'light';
let currentFile = 'index.md';
let markdownContent = '';
let searchResults = [];
let currentSearchIndex = 0;

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    currentFile = urlParams.get('file') || 'index.md';

    applyTheme(currentTheme);
    loadMarkdownFile();

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

function switchToSlideView() {
    window.location.href = `slide.html?file=${encodeURIComponent(currentFile)}`;
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
        const errorContent = `
            <div class="error">
                <h2>File Loading Error</h2>
                <p><strong>Error:</strong> ${error.message}</p>
            </div>
        `;
        document.getElementById('content').innerHTML = errorContent;
    }
}

function renderMarkdown() {
    if (typeof marked === 'undefined') {
        document.getElementById('content').innerHTML = `
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

    const html = marked.parse(markdownContent);
    document.getElementById('content').innerHTML = html;

    waitForMathJax(() => {
        processMathJax();
    });

    waitForMermaid(() => {
        runMermaid();
    });

    generateTOC();

    // Intercept clicks on links within the iframe to navigate the parent window
    document.getElementById('content').addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.href) {
            e.preventDefault();
            const clickedUrl = new URL(e.target.href);
            const currentOrigin = window.location.origin;

            if (clickedUrl.origin === currentOrigin) {
                let filename = '';
                if (clickedUrl.searchParams.has('file')) {
                    filename = clickedUrl.searchParams.get('file');
                } else {
                    const pathname = clickedUrl.pathname;
                    const lastSlashIndex = pathname.lastIndexOf('/');
                    filename = pathname.substring(lastSlashIndex + 1);
                }

                if (filename.endsWith('.md')) {
                    window.parent.location.href = `${currentOrigin}/?file=${encodeURIComponent(filename)}`;
                    return;
                }
            }
            window.open(e.target.href, '_blank');
        }
    });
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
            const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\\]/g, '\\$&');
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
            new RegExp(result.match.replace(/[.*+?^${}()|[\\]/g, '\\$&'), 'gi'),
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
    const content = document.getElementById('content');
    const highlights = content.querySelectorAll('.search-highlight, .highlight');
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

document.addEventListener('keydown', function (e) {
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

window.addEventListener('load', () => waitForLibraries(init));

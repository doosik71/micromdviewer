let mermaidInitialized = false;

// Mermaid helper functions
function initializeMermaid() {
    if (typeof mermaid !== 'undefined') {
        try {
            console.log('Initializing Mermaid...');
            mermaid.initialize({
                startOnLoad: false,
                theme: document.body.classList.contains('theme-dark') ? 'dark' : 'default',
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
            callback();
        }
    };
    checkMermaid();
}

// Enhanced MathJax processing
function processMathJax() {
    if (typeof MathJax === 'undefined') {
        console.warn('MathJax is not available.');
        return;
    }
    try {
        console.log('Processing MathJax...');
        if (typeof MathJax.typesetPromise === 'function') {
            console.log('Using MathJax 3.x typesetPromise');
            MathJax.typesetPromise().catch(err => {
                console.warn('MathJax typesetPromise failed:', err);
            });
        } else if (typeof MathJax.typeset === 'function') {
            console.log('Using MathJax 3.x typeset');
            MathJax.typeset();
        } else {
            console.warn('No compatible MathJax rendering method found after waiting.');
        }
    } catch (error) {
        console.warn('MathJax processing failed:', error);
    }
}

// Wait for MathJax specifically
function waitForMathJax(callback, maxWait = 5000) {
    const startTime = Date.now();
    const checkMathJax = () => {
        if (typeof MathJax !== 'undefined' && typeof MathJax.startup !== 'undefined' && MathJax.startup.promise) {
            console.log('MathJax startup promise found, waiting for it to resolve...');
            MathJax.startup.promise.then(() => {
                console.log('MathJax is ready for rendering.');
                callback();
            }).catch(err => {
                console.warn('MathJax startup promise failed:', err);
                callback();
            });
        } else if (Date.now() - startTime < maxWait) {
            setTimeout(checkMathJax, 100);
        } else {
            console.warn('MathJax failed to initialize within', maxWait, 'ms');
            callback();
        }
    };
    checkMathJax();
}

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
}

function createMarkedRenderer() {
    const renderer = new marked.Renderer();
    renderer.code = function (code, language) {
        if (language === 'mermaid') {
            return `<div class="mermaid">${code}</div>`;
        }
        let highlighted;
        if (typeof hljs !== 'undefined') {
            highlighted = language ?
                hljs.highlight(code, { language }).value :
                hljs.highlightAuto(code).value;
        } else {
            highlighted = code;
        }
        return `<pre><code class="hljs ${language || ''}">${highlighted}</code></pre>`;
    };
    renderer.heading = function (text, level) {
        const id = text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        return `<h${level} id="${id}">${text}</h${level}>`;
    };
    return renderer;
}

// Menu toggle functionality
let menuVisible = false; // Track menu state, start with hidden

function toggleMenu() {
    const toolbar = document.querySelector('.toolbar');
    const slideControls = document.querySelector('.slide-controls');
    
    menuVisible = !menuVisible; // Toggle state
    
    if (toolbar) {
        const buttons = toolbar.querySelectorAll('.tool-btn');
        const themes = toolbar.querySelector('.themes');
        const menuBtn = toolbar.querySelector('.menu-toggle-btn');
        
        buttons.forEach(btn => {
            btn.style.display = menuVisible ? 'block' : 'none';
        });
        
        if (themes) {
            themes.style.display = menuVisible ? 'flex' : 'none';
        }
        
        if (menuBtn) {
            menuBtn.style.display = 'block'; // Always visible
        }
    }
    
    if (slideControls) {
        const buttons = slideControls.querySelectorAll('.control-btn');
        const themes = slideControls.querySelector('.themes');
        const menuBtn = slideControls.querySelector('.menu-toggle-btn');
        
        buttons.forEach(btn => {
            btn.style.display = menuVisible ? 'block' : 'none';
        });
        
        if (themes) {
            themes.style.display = menuVisible ? 'flex' : 'none';
        }
        
        if (menuBtn) {
            menuBtn.style.display = 'block'; // Always visible
        }
    }
}

// Wait for all libraries to load before initializing
function waitForLibraries(initCallback) {
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max
    const checkLibraries = () => {
        attempts++;
        const markedReady = typeof marked !== 'undefined';
        const hlReady = typeof hljs !== 'undefined';

        if (markedReady && hlReady) {
            console.log('Essential libraries loaded, initializing...');
            initCallback();
        } else if (attempts < maxAttempts) {
            setTimeout(checkLibraries, 100);
        } else {
            console.warn('Some libraries failed to load after', maxAttempts * 100, 'ms');
            initCallback();
        }
    };
    checkLibraries();
}

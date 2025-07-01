// Bookmark Manager - Main Application Coordinator
(function() {
    'use strict';

    // Initialize namespace
    window.BookmarkManager = window.BookmarkManager || {};
    window.BookmarkManager.app = {
        bookmarks: [],
        bookmarksPath: '/etc/cockpit/bookmarks.json'
    };

    console.log('Bookmark Manager namespace initialized');

    // CSS Loading Detection - Ensure CSS is fully loaded before initializing
    function waitForCSS() {
        return new Promise(function(resolve) {
            // Check if our flag is set (from HTML onload)
            if (window.cssLoaded) {
                // Force a reflow to ensure styles are applied
                document.body.offsetHeight;
                resolve();
                return;
            }
            
            // Fallback: Check if stylesheets are loaded
            const styleSheets = document.styleSheets;
            let cssLoaded = true;
            
            for (let i = 0; i < styleSheets.length; i++) {
                try {
                    // Try to access rules - will throw if not loaded
                    if (styleSheets[i].href && styleSheets[i].href.includes('style.css')) {
                        const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                        if (!rules || rules.length === 0) {
                            cssLoaded = false;
                        }
                    }
                } catch (e) {
                    // StyleSheet not yet loaded
                    cssLoaded = false;
                    break;
                }
            }
            
            if (cssLoaded) {
                // Force a reflow to ensure styles are applied
                document.body.offsetHeight;
                window.cssLoaded = true;
                resolve();
            } else {
                // Retry after a short delay
                setTimeout(function() {
                    waitForCSS().then(resolve);
                }, 10);
            }
        });
    }

    // Force CSS reflow to ensure proper rendering
    function forceReflow() {
        // Multiple techniques to force browser to recalculate styles
        
        // 1. Toggle display
        const body = document.body;
        const display = body.style.display;
        body.style.display = 'none';
        body.offsetHeight; // Trigger reflow
        body.style.display = display;
        
        // 2. Force style recalculation on main containers
        const containers = [
            document.getElementById('main-content'),
            document.querySelector('.pf-v6-c-page__main'),
            document.querySelector('.content-box')
        ];
        
        containers.forEach(function(container) {
            if (container) {
                // Use zoom trick to force repaint
                container.style.zoom = 1.0000001;
                container.offsetHeight; // Force reflow
                
                // Reset after a microtask
                Promise.resolve().then(function() {
                    container.style.zoom = '';
                });
            }
        });
        
        // 3. Request animation frame to ensure paint
        requestAnimationFrame(function() {
            document.documentElement.style.opacity = '0.9999';
            requestAnimationFrame(function() {
                document.documentElement.style.opacity = '';
            });
        });
    }

    // Enhanced loading overlay hiding with fade effect
    function hideLoadingOverlay() {
        const loadingOverlay = window.BookmarkManager.utils.getElement('loading-overlay');
        if (!loadingOverlay) return;
        
        // Add transition for smooth hiding
        loadingOverlay.style.transition = 'opacity 0.3s ease-out';
        loadingOverlay.style.opacity = '0';
        
        setTimeout(function() {
            loadingOverlay.style.display = 'none';
            loadingOverlay.style.transition = '';
            loadingOverlay.style.opacity = '';
            
            // Force final reflow after hiding
            forceReflow();
            
            // Ensure all content is visible with fade-in
            const content = document.querySelector('.pf-v6-c-page__main');
            if (content && !content.dataset.revealed) {
                content.dataset.revealed = 'true';
                content.style.opacity = '0';
                content.style.transition = 'opacity 0.2s ease-in';
                
                requestAnimationFrame(function() {
                    content.style.opacity = '1';
                    
                    // Clean up after transition
                    setTimeout(function() {
                        content.style.transition = '';
                        content.style.opacity = '';
                    }, 200);
                });
            }
        }, 300);
    }

    // Ensure rendering is complete before proceeding
    function ensureRendered(callback) {
        // Chain multiple techniques to ensure complete rendering
        
        // 1. Wait for next paint
        requestAnimationFrame(function() {
            // 2. Wait for following frame to ensure previous frame painted
            requestAnimationFrame(function() {
                // 3. Force style recalculation
                window.getComputedStyle(document.body).height;
                
                // 4. Use setTimeout to break out of current execution context
                setTimeout(function() {
                    // 5. Check if document is fully loaded
                    if (document.readyState === 'complete') {
                        callback();
                    } else {
                        // Wait for window load event
                        window.addEventListener('load', function() {
                            // One more frame for good measure
                            requestAnimationFrame(callback);
                        });
                    }
                }, 0);
            });
        });
    }

    // Initialize the application
    function init() {
        // Import references to modules
        const utils = window.BookmarkManager.utils;
        const ui = window.BookmarkManager.ui;

        // Use enhanced loading overlay hiding
        ensureRendered(function() {
            hideLoadingOverlay();
            
            // Force reflow after showing content
            forceReflow();

            // Setup UI
            ui.setupEventListeners();

            // Load bookmarks
            if (window.BookmarkManager.bookmarks && window.BookmarkManager.bookmarks.loadBookmarks) {
                window.BookmarkManager.bookmarks.loadBookmarks();
            }
        });
    }

    // Enhanced initialization with CSS loading detection
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM Content Loaded - Waiting for CSS...');
        
        // Wait for CSS to be fully loaded
        waitForCSS().then(function() {
            console.log('CSS Loaded - Initializing application...');
            
            // Give modules and cockpit a moment to initialize
            setTimeout(function() {
                if (typeof cockpit !== 'undefined') {
                    init();
                } else {
                    const checkInterval = setInterval(function() {
                        if (typeof cockpit !== 'undefined') {
                            clearInterval(checkInterval);
                            init();
                        }
                    }, 100);
                }
            }, 100);
        });
    });

})();

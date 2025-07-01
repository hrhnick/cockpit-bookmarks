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

    // Initialize the application
    function init() {
        // Import references to modules
        const utils = window.BookmarkManager.utils;
        const ui = window.BookmarkManager.ui;

        const loadingOverlay = utils.getElement('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }

        // Setup UI
        ui.setupEventListeners();

        // Load bookmarks
        if (window.BookmarkManager.bookmarks && window.BookmarkManager.bookmarks.loadBookmarks) {
            window.BookmarkManager.bookmarks.loadBookmarks();
        }
    }

    // Start when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Give modules a moment to initialize
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

})();

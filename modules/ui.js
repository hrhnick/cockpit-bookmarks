// Bookmark Manager - UI Setup Module
(function() {
    'use strict';

    // Dependencies
    function utils() { return window.BookmarkManager.utils; }
    function actions() { return window.BookmarkManager.actions; }

    // Setup event listeners
    function setupEventListeners() {
        // Add bookmark button
        const addBtn = utils().getElement('add-bookmark-btn');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                actions().addBookmark();
            });
        }
        
        // Centralized event delegation for table actions
        document.addEventListener('click', function(e) {
            // Check for data-action attribute
            const actionElement = e.target.closest('[data-action]');
            if (actionElement) {
                e.preventDefault();
                const action = actionElement.dataset.action;
                const handler = actions()[action];
                
                if (handler) {
                    // Pass all data attributes as parameters
                    handler(actionElement.dataset);
                } else {
                    console.warn('No handler registered for action:', action);
                }
            }
        });
        
        // Clear search on ESC
        const searchInput = utils().getElement('bookmarks-search');
        if (searchInput) {
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && this.value) {
                    this.value = '';
                    const event = new Event('input', { bubbles: true });
                    this.dispatchEvent(event);
                }
            });
        }
    }

    // Export public interface
    window.BookmarkManager.ui = {
        setupEventListeners: setupEventListeners
    };

})();
// Bookmark Manager - Bookmarks Management Module
(function() {
    'use strict';

    // Dependencies
    function app() { return window.BookmarkManager.app; }
    function utils() { return window.BookmarkManager.utils; }
    function table() { return window.BookmarkManager.table; }
    function modals() { return window.BookmarkManager.modals; }

    // Load bookmarks from file
    function loadBookmarks() {
        table().showLoading();
        
        cockpit.file(app().bookmarksPath)
            .read()
            .then(function(content) {
                try {
                    app().bookmarks = content ? JSON.parse(content) : [];
                } catch (e) {
                    app().bookmarks = [];
                }
                renderBookmarks();
            })
            .catch(function(error) {
                // File doesn't exist yet, that's ok
                if (error.problem !== "not-found") {
                    utils().showNotification('Failed to load bookmarks', 'error');
                }
                app().bookmarks = [];
                renderBookmarks();
            });
    }

    // Save bookmarks to file
    function saveBookmarks() {
        // Ensure directory exists
        utils().executeCommand(['mkdir', '-p', '/etc/cockpit'], { superuser: 'try' })
            .then(function() {
                return cockpit.file(app().bookmarksPath, { superuser: 'try' })
                    .replace(JSON.stringify(app().bookmarks, null, 2));
            })
            .then(function() {
                utils().showNotification('Bookmarks saved successfully', 'success');
                renderBookmarks();
            })
            .catch(function(error) {
                utils().showNotification('Failed to save bookmarks', 'error');
            });
    }

    // Render bookmarks
    function renderBookmarks() {
        table().renderTable(app().bookmarks);
    }

    // Add or update bookmark
    function saveBookmark(formData, modalData) {
        if (modalData && modalData.mode === 'edit') {
            // Update existing bookmark
            const index = app().bookmarks.findIndex(b => b.id === modalData.bookmark.id);
            if (index !== -1) {
                app().bookmarks[index] = {
                    id: modalData.bookmark.id,
                    name: formData.name,
                    url: formData.url,
                    description: formData.description,
                    created: modalData.bookmark.created,
                    updated: new Date().toISOString()
                };
            }
        } else {
            // Add new bookmark
            app().bookmarks.push({
                id: utils().generateId(),
                name: formData.name,
                url: formData.url,
                description: formData.description,
                created: new Date().toISOString()
            });
        }
        
        saveBookmarks();
    }

    // Action handlers
    const actions = {
        addBookmark: function() {
            modals().showModal(null, saveBookmark);
        },
        
        editBookmark: function(data) {
            const bookmark = app().bookmarks.find(b => b.id === data.id);
            if (bookmark) {
                modals().showModal({
                    mode: 'edit',
                    bookmark: bookmark
                }, saveBookmark);
            }
        },
        
        deleteBookmark: function(data) {
            const bookmark = app().bookmarks.find(b => b.id === data.id);
            if (bookmark) {
                modals().confirm(
                    'Are you sure you want to delete the bookmark "' + bookmark.name + '"?',
                    function() {
                        app().bookmarks = app().bookmarks.filter(b => b.id !== data.id);
                        saveBookmarks();
                    }
                );
            }
        }
    };

    // Export action handlers to global actions
    window.BookmarkManager.actions = actions;

    // Export public interface
    window.BookmarkManager.bookmarks = {
        loadBookmarks: loadBookmarks,
        renderBookmarks: renderBookmarks,
        saveBookmark: saveBookmark
    };

})();
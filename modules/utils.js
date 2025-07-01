// Bookmark Manager - Utility Functions Module
(function() {
    'use strict';

    // Initialize namespace if needed
    window.BookmarkManager = window.BookmarkManager || {};

    // Core utility functions
    function executeCommand(command, options) {
        options = options || {};
        return cockpit.spawn(command, options)
            .then(function(result) {
                return { success: true, data: result };
            })
            .catch(function(error) {
                return { success: false, error: error.message || error.toString() };
            });
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function showNotification(message, type) {
        type = type || 'info';
        const banner = getElement('action-banner');
        if (banner) {
            banner.textContent = message;
            banner.className = type;
            banner.style.display = 'block';
            setTimeout(function() {
                banner.style.display = 'none';
            }, 4000);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // DOM utilities
    const dom = {
        create: function(tag, attrs, children) {
            const el = document.createElement(tag);
            
            if (attrs) {
                Object.entries(attrs).forEach(([key, value]) => {
                    if (key === 'className') {
                        el.className = value;
                    } else if (key === 'textContent') {
                        el.textContent = value;
                    } else if (key === 'innerHTML') {
                        el.innerHTML = value;
                    } else if (key === 'dataset') {
                        Object.assign(el.dataset, value);
                    } else {
                        el.setAttribute(key, value);
                    }
                });
            }
            
            if (children) {
                this.append(el, children);
            }
            
            return el;
        },

        append: function(parent, children) {
            if (!Array.isArray(children)) {
                children = [children];
            }
            
            children.forEach(child => {
                if (typeof child === 'string') {
                    parent.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    parent.appendChild(child);
                }
            });
        },

        toggle: function(el, show) {
            if (typeof el === 'string') el = getElement(el);
            if (el) {
                el.style.display = show ? '' : 'none';
            }
        },

        addClass: function(el, className) {
            if (typeof el === 'string') el = getElement(el);
            if (el) el.classList.add(className);
        },

        removeClass: function(el, className) {
            if (typeof el === 'string') el = getElement(el);
            if (el) el.classList.remove(className);
        }
    };

    // Generate unique ID
    function generateId() {
        return 'bookmark-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Normalize URL
    function normalizeUrl(url) {
        if (url && !url.match(/^https?:\/\//i)) {
            return 'https://' + url;
        }
        return url;
    }

    // Export public interface
    window.BookmarkManager.utils = {
        executeCommand: executeCommand,
        getElement: getElement,
        showNotification: showNotification,
        escapeHtml: escapeHtml,
        dom: dom,
        generateId: generateId,
        normalizeUrl: normalizeUrl
    };

})();
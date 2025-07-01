// Bookmark Manager - Modal Management Module (Simplified)
(function() {
    'use strict';

    // Dependencies
    function utils() { return window.BookmarkManager.utils; }

    // Modal state
    let modalData = null;
    let modalCallback = null;

    // Create bookmark modal
    function createBookmarkModal() {
        const dom = utils().dom;
        
        const modal = dom.create('div', {
            id: 'bookmark-modal',
            className: 'pf-v6-c-modal',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'bookmark-modal-title',
            style: 'display: none;'
        });
        
        const modalBox = dom.create('div', {
            className: 'pf-v6-c-modal__box'
        });
        
        // Header
        const header = dom.create('header', { className: 'pf-v6-c-modal__header' });
        header.appendChild(dom.create('h3', {
            id: 'bookmark-modal-title',
            textContent: 'Add Bookmark'
        }));
        
        const closeBtn = dom.create('button', {
            type: 'button',
            className: 'pf-v6-c-modal__close',
            'aria-label': 'Close dialog',
            textContent: '×'
        });
        closeBtn.addEventListener('click', hideModal);
        header.appendChild(closeBtn);
        
        modalBox.appendChild(header);
        
        // Body
        const body = dom.create('div', { className: 'pf-v6-c-modal__body' });
        const form = dom.create('form', { id: 'bookmark-form', noValidate: true });
        
        // Name field
        form.appendChild(createFormField({
            name: 'bookmark-name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Documentation'
        }));
        
        // URL field
        form.appendChild(createFormField({
            name: 'bookmark-url',
            label: 'URL',
            type: 'text',
            required: true,
            placeholder: 'e.g., example.com or https://example.com'
        }));
        
        // Description field
        form.appendChild(createFormField({
            name: 'bookmark-description',
            label: 'Description',
            type: 'textarea',
            rows: 3,
            placeholder: 'Optional description'
        }));
        
        body.appendChild(form);
        modalBox.appendChild(body);
        
        // Footer
        const footer = dom.create('footer', { className: 'pf-v6-c-modal__footer' });
        
        const submitBtn = dom.create('button', {
            type: 'submit',
            className: 'pf-v6-c-button pf-v6-c-button--primary',
            textContent: 'Add Bookmark',
            form: 'bookmark-form'
        });
        
        const cancelBtn = dom.create('button', {
            type: 'button',
            className: 'pf-v6-c-button pf-v6-c-button--secondary',
            textContent: 'Cancel'
        });
        cancelBtn.addEventListener('click', hideModal);
        
        footer.appendChild(submitBtn);
        footer.appendChild(cancelBtn);
        modalBox.appendChild(footer);
        
        modal.appendChild(modalBox);
        document.body.appendChild(modal);
        
        // Setup form submission
        form.addEventListener('submit', handleSubmit);
        
        // Setup ESC key handler
        document.addEventListener('keydown', handleEscKey);
        
        // Setup backdrop click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal();
            }
        });
    }

    // Create form field
    function createFormField(config) {
        const dom = utils().dom;
        const group = dom.create('div', { className: 'pf-v6-c-form__group' });
        
        const label = dom.create('label', {
            className: 'pf-v6-c-form__label',
            for: config.name,
            textContent: config.label + (config.required ? ' *' : '')
        });
        group.appendChild(label);
        
        let input;
        if (config.type === 'textarea') {
            input = dom.create('textarea', {
                className: 'pf-v6-c-form__input',
                id: config.name,
                name: config.name,
                placeholder: config.placeholder || '',
                rows: config.rows || 3,
                required: config.required || false
            });
        } else {
            input = dom.create('input', {
                className: 'pf-v6-c-form__input',
                type: config.type || 'text',
                id: config.name,
                name: config.name,
                placeholder: config.placeholder || '',
                required: config.required || false
            });
        }
        
        group.appendChild(input);
        
        if (config.helperText) {
            group.appendChild(dom.create('div', {
                className: 'pf-v6-c-form__helper-text',
                textContent: config.helperText
            }));
        }
        
        return group;
    }

    // Show modal
    function showModal(data, callback) {
        let modal = utils().getElement('bookmark-modal');
        if (!modal) {
            createBookmarkModal();
            // Get the modal element after creation
            modal = utils().getElement('bookmark-modal');
        }
        
        modalData = data || null;
        modalCallback = callback;
        
        // Update title and button text
        const title = utils().getElement('bookmark-modal-title');
        const submitBtn = document.querySelector('#bookmark-form button[type="submit"]');
        
        if (title && submitBtn) {
            if (data && data.mode === 'edit') {
                title.textContent = 'Edit Bookmark';
                submitBtn.textContent = 'Update Bookmark';
                
                // Populate form
                const nameInput = utils().getElement('bookmark-name');
                const urlInput = utils().getElement('bookmark-url');
                const descInput = utils().getElement('bookmark-description');
                
                if (nameInput) nameInput.value = data.bookmark.name;
                if (urlInput) urlInput.value = data.bookmark.url;
                if (descInput) descInput.value = data.bookmark.description || '';
            } else {
                title.textContent = 'Add Bookmark';
                submitBtn.textContent = 'Add Bookmark';
                const form = document.getElementById('bookmark-form');
                if (form) form.reset();
            }
        }
        
        // Clear any previous errors
        clearErrors();
        
        // Show modal
        if (modal) {
            modal.style.display = 'flex';
            
            // Focus first input
            setTimeout(() => {
                const firstInput = utils().getElement('bookmark-name');
                if (firstInput) firstInput.focus();
            }, 50);
        }
    }

    // Hide modal
    function hideModal() {
        const modal = utils().getElement('bookmark-modal');
        if (modal) {
            modal.style.display = 'none';
            const form = document.getElementById('bookmark-form');
            if (form) form.reset();
            clearErrors();
            modalData = null;
            modalCallback = null;
        }
    }

    // Handle form submission
    function handleSubmit(e) {
        e.preventDefault();
        
        const nameInput = utils().getElement('bookmark-name');
        const urlInput = utils().getElement('bookmark-url');
        const descInput = utils().getElement('bookmark-description');
        
        if (!nameInput || !urlInput) return;
        
        const formData = {
            name: nameInput.value.trim(),
            url: urlInput.value.trim(),
            description: descInput ? descInput.value.trim() : ''
        };
        
        // Validate
        clearErrors();
        let hasErrors = false;
        
        if (!formData.name) {
            showFieldError('bookmark-name', 'Name is required');
            hasErrors = true;
        }
        
        if (!formData.url) {
            showFieldError('bookmark-url', 'URL is required');
            hasErrors = true;
        }
        
        if (hasErrors) return;
        
        // Normalize URL
        formData.url = utils().normalizeUrl(formData.url);
        
        // Call callback
        if (modalCallback) {
            modalCallback(formData, modalData);
        }
        
        hideModal();
    }

    // Show field error
    function showFieldError(fieldName, message) {
        const input = utils().getElement(fieldName);
        if (input) {
            utils().dom.addClass(input, 'error');
            
            let errorElement = input.parentNode.querySelector('.field-error');
            if (!errorElement) {
                errorElement = utils().dom.create('div', {
                    className: 'field-error',
                    textContent: message
                });
                input.parentNode.appendChild(errorElement);
            } else {
                errorElement.textContent = message;
            }
        }
    }

    // Clear all errors
    function clearErrors() {
        document.querySelectorAll('.error').forEach(el => {
            utils().dom.removeClass(el, 'error');
        });
        document.querySelectorAll('.field-error').forEach(el => el.remove());
    }

    // Handle ESC key
    function handleEscKey(e) {
        if (e.key === 'Escape') {
            const modal = utils().getElement('bookmark-modal');
            if (modal && modal.style.display !== 'none') {
                hideModal();
            }
        }
    }

    // Confirm dialog
    function confirm(message, callback) {
        if (window.confirm(message)) {
            callback();
        }
    }

    // Export public interface
    window.BookmarkManager.modals = {
        showModal: showModal,
        hideModal: hideModal,
        confirm: confirm
    };

})();

// Bookmark Manager - Table Management Module (Simplified for single table)
(function() {
    'use strict';

    // Dependencies
    function utils() { return window.BookmarkManager.utils; }

    // Table state
    let tableConfig = null;
    let tableState = {
        sortColumn: 0,
        sortOrder: 'asc',
        searchTerm: '',
        data: []
    };

    // Initialize table
    function initializeTable() {
        tableConfig = {
            columns: [
                { 
                    key: 'name', 
                    label: 'Name',
                    renderer: function(value, item) {
                        return '<a href="' + utils().escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer">' + 
                               utils().escapeHtml(value) + '</a>';
                    }
                },
                { 
                    key: 'url', 
                    label: 'URL',
                    renderer: function(value) {
                        return '<a href="' + utils().escapeHtml(value) + '" target="_blank" rel="noopener noreferrer" class="url-link">' + 
                               utils().escapeHtml(value) + '</a>';
                    }
                },
                { 
                    key: 'description', 
                    label: 'Description',
                    renderer: function(value) {
                        return utils().escapeHtml(value || '');
                    }
                },
                {
                    key: 'actions',
                    label: 'Actions',
                    className: 'actions-column',
                    renderer: function(value, item) {
                        return renderActions(item);
                    }
                }
            ],
            searchColumns: [0, 1, 2], // Search in name, url, and description
            emptyMessage: 'No bookmarks found. Click "Add bookmark" to create your first bookmark.'
        };

        setupTableEvents();
    }

    // Render table
    function renderTable(data) {
        tableState.data = data;
        
        const tbody = document.querySelector('#bookmarks-table tbody');
        if (!tbody) return;
        
        tbody.classList.remove('loading');
        
        // Filter data
        let filteredData = data;
        if (tableState.searchTerm) {
            const term = tableState.searchTerm.toLowerCase();
            filteredData = data.filter(item => {
                return tableConfig.searchColumns.some(columnIndex => {
                    const column = tableConfig.columns[columnIndex];
                    const value = item[column.key];
                    return value && value.toString().toLowerCase().includes(term);
                });
            });
        }
        
        // Sort data
        filteredData.sort((a, b) => {
            const column = tableConfig.columns[tableState.sortColumn];
            let aVal = a[column.key] || '';
            let bVal = b[column.key] || '';
            
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            
            if (aVal < bVal) return tableState.sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return tableState.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        // Render rows
        if (filteredData.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="' + tableConfig.columns.length + '">' + 
                            utils().escapeHtml(tableConfig.emptyMessage) + '</td></tr>';
            return;
        }
        
        const rowsHtml = filteredData.map(item => {
            const cells = tableConfig.columns.map(column => {
                const value = item[column.key];
                const content = column.renderer ? column.renderer(value, item) : utils().escapeHtml(value || '');
                return '<td' + (column.className ? ' class="' + column.className + '"' : '') + '>' + content + '</td>';
            }).join('');
            
            return '<tr>' + cells + '</tr>';
        }).join('');
        
        tbody.innerHTML = rowsHtml;
    }

    // Render action buttons
    function renderActions(bookmark) {
        const dom = utils().dom;
        
        const editBtn = dom.create('button', {
            className: 'table-action-btn primary',
            textContent: 'Edit',
            dataset: {
                action: 'editBookmark',
                id: bookmark.id
            }
        });
        
        const deleteBtn = dom.create('button', {
            className: 'table-action-btn danger',
            textContent: 'Delete',
            dataset: {
                action: 'deleteBookmark',
                id: bookmark.id,
                name: bookmark.name
            }
        });
        
        return '<div class="table-action-buttons">' + editBtn.outerHTML + deleteBtn.outerHTML + '</div>';
    }

    // Setup table events
    function setupTableEvents() {
        const table = document.getElementById('bookmarks-table');
        if (!table) return;
        
        // Sort handler
        table.addEventListener('click', e => {
            const sortButton = e.target.closest('.sort-button');
            if (sortButton) {
                const th = sortButton.closest('th');
                const columnIndex = Array.from(th.parentNode.children).indexOf(th);
                handleSort(columnIndex);
            }
        });
        
        // Search handler
        const searchInput = document.getElementById('bookmarks-search');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', e => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    tableState.searchTerm = e.target.value;
                    renderTable(tableState.data);
                }, 300);
            });
        }
    }

    // Handle sort
    function handleSort(columnIndex) {
        if (tableState.sortColumn === columnIndex) {
            tableState.sortOrder = tableState.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            tableState.sortColumn = columnIndex;
            tableState.sortOrder = 'asc';
        }
        
        updateSortIndicators(columnIndex, tableState.sortOrder);
        renderTable(tableState.data);
    }

    // Update sort indicators
    function updateSortIndicators(columnIndex, sortOrder) {
        const indicators = document.querySelectorAll('.sort-indicator');
        indicators.forEach((indicator, idx) => {
            indicator.className = idx === columnIndex ? 
                'sort-indicator ' + sortOrder : 'sort-indicator';
        });
    }

    // Show loading state
    function showLoading() {
        const tbody = document.querySelector('#bookmarks-table tbody');
        if (tbody) {
            tbody.classList.add('loading');
            tbody.innerHTML = '<tr class="loading-row"><td colspan="' + tableConfig.columns.length + 
                            '" class="loading-cell">Loading bookmarks...</td></tr>';
        }
    }

    // Initialize on load
    initializeTable();

    // Export public interface
    window.BookmarkManager.table = {
        renderTable: renderTable,
        showLoading: showLoading
    };

})();
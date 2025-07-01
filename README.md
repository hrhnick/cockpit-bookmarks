# Cockpit Bookmark Manager

A hacked, simple bookmark management plugin for [Cockpit](https://cockpit-project.org/) that provides a web interface for managing server bookmarks and quick links.

![2025_06_30___21_49_19](https://github.com/user-attachments/assets/e6da53c7-cfbe-4314-b923-86b88e5f5120)

## Installation

```bash
sudo mkdir -p /usr/share/cockpit/bookmarks
sudo cp -r * /usr/share/cockpit/bookmarks/
sudo systemctl reload cockpit
```

Access through Cockpit at `https://your-server:9090`

## Requirements

- Cockpit web console

## Features

**Bookmark Management**
- Add bookmarks with name, URL, and optional description
- Edit existing bookmarks
- Delete bookmarks with confirmation

**User Interface**
- Filter bookmarks by name, URL, or description
- Sort by any column
- Clean, responsive design
- Keyboard shortcuts (ESC to clear search)

## Configuration

Bookmarks are stored in JSON format at:
- `/etc/cockpit/bookmarks.json`

The file is automatically created on first use.

## Usage

1. Click "Add bookmark" to create a new bookmark
2. Enter a name and URL (description is optional)
3. Click on bookmark names to open links in new tabs
4. Use the search box to filter bookmarks
5. Click column headers to sort

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Micro Markdown Viewer - a static web application built with HTML, CSS, and JavaScript that displays markdown files in two viewing modes:
- **Page mode**: Traditional webpage-style markdown rendering
- **Slide mode**: Presentation-style markdown rendering with slide navigation

## Architecture

The application consists of paired files for each viewing mode:

### Core Files
- `index.html` - Main entry point with top menu for switching styles and themes
- `index.md` - Default markdown document displayed on startup

### Page Mode (Webpage Style)
- `page.html` - Webpage-style markdown viewer (currently empty)
- `page.css` - Webpage styling definitions (currently empty)
- `page.js` - Webpage viewer logic and functionality (currently empty)

### Slide Mode (Presentation Style)
- `slide.html` - Presentation-style markdown viewer (currently empty)
- `slide.css` - Presentation styling definitions (currently empty)
- `slide.js` - Presentation viewer logic and functionality (currently empty)

## Key Features

- **No server required**: Pure client-side application
- **Math support**: MathJax integration for mathematical expressions
- **Diagram support**: Mermaid integration for diagrams
- **Floating TOC**: Left-side table of contents navigation
- **Advanced search**: Search functionality with thumbnail previews
- **Theme switching**: Multiple color themes available
- **File access**: Supports markdown files in subfolders via URL parameters (e.g., `index.html?help.md`)

## Development

Since this is a static web application with no build process:

### Testing
- Open `index.html` in a web browser to test the application
- Test with different markdown files using URL parameters: `index.html?filename.md`

### File Organization
- All source files are in the root directory
- Markdown files can be placed in the root or subdirectories
- The application automatically parses and renders markdown to HTML

## Usage Pattern

The application loads markdown files by:
1. Reading the URL parameter or defaulting to `index.md`
2. Parsing the markdown content to HTML
3. Rendering in the selected view mode (page or slide)
4. Providing navigation, search, and theme switching via the top menu

## Language

Documentation and comments are in Korean (한국어).
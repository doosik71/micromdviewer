# Micro Markdown Viewer Project Overview

This project is a simple Markdown viewer that supports two viewing modes:

1. **Web Page Mode**: Displays Markdown content as a standard web page with a Table of Contents and search functionality.
2. **Presentation Mode (Slide Mode)**: Displays Markdown content as a slide presentation with navigation controls.

It supports Markdown rendering, code highlighting, MathJax for mathematical equations, and Mermaid for diagrams.

## Key Features

- Markdown rendering
- Code highlighting (highlight.js)
- MathJax integration for LaTeX equations
- Mermaid integration for diagrams
- Table of Contents generation (Web Page Mode)
- Search functionality
- Theme switching
- Responsive design

## Recent Changes by Gemini CLI

- **MathJax Rendering Fixes**: Addressed issues with MathJax not rendering correctly in both page and slide modes by ensuring proper loading and initialization.
- **Code Refactoring**: Extracted common JavaScript functions into `common.js` to reduce code duplication in `page.js` and `slide.js`.
- **CSS Refactoring**: Extracted common CSS rules into `common.css` to reduce code duplication in `page.css` and `slide.css`.
- **Mermaid Diagram Centering**: Centered Mermaid diagrams horizontally in both page and slide modes.
- **View Mode Button Redesign**: Replaced the "View Mode" combo box with a single toggle icon button in `index.html` for a cleaner UI.
- **View Mode Button Styling**: Improved visual distinction for active/inactive view mode button states and adjusted button size.
- **Slide Mode Scroll Fixes**: Implemented fixes to enable vertical scrolling in slide mode when content overflows.
- **Page Navigator Redesign (Slide Mode)**: Made the slide page navigator more compact and semi-transparent.
- **Page Navigator Visibility (Slide Mode)**: Configured the slide page navigator to appear only on mouse hover.
- **Toolbar Button Orientation (Page & Slide Mode)**: Arranged the right-side toolbar buttons vertically in both page and slide modes.
- **Toolbar Button Translucency**: Made the background of the right-side toolbar buttons semi-transparent in both page and slide modes.
- **Header Translucency (index.html)**: Made the background of the main header in `index.html` semi-transparent.
- **Iframe Refresh on Reload**: Ensured that the iframe content in `index.html` refreshes when the main page is reloaded by adding a timestamp to the iframe source URL.

## How to Run

To run this application, you need a local web server. You can use Python's built-in HTTP server:

1. Open a terminal in the project root directory (`/home/doosik/work/micromdviewer`).
2. Run the command: `python -m http.server 8000`
3. Open your web browser and navigate to `http://localhost:8000`

## Notes for Gemini

- Continue to prioritize code readability, maintainability, and adherence to existing conventions.
- When making UI/UX changes, always aim for a clean, modern, and intuitive design.
- For any new features or significant refactoring, propose a plan before implementation.
- Remember to check both `page.html` and `slide.html` related files for consistency when making global changes.

# Code Notes App

A minimalist, keyboard-friendly note-taking application with code editor features and infinite scrolling. Built with React, TypeScript, and IndexedDB.

## Features

- 🎨 Code editor-like interface
- 📝 Markdown-style formatting
- 🔄 Auto-saving
- 🔍 Full-text search with fuzzy matching
- 📅 Date-based filtering
- ♾️ Infinite scrolling
- ⌨️ Keyboard shortcuts
- 🌙 Dark theme
- ↩️ Undo delete functionality
- 📱 Responsive design
- 💾 Offline-first with IndexedDB
- ⚡ Fast and lightweight

## Installation

1. Clone the repository:
```bash
git clone https://github.com/bewithdhanu/code-notes-app.git
```

2. Install dependencies:
```bash
cd code-notes-app
npm install
```

3. Start the development server:
```bash
npm start
```

## Usage

### Creating Notes
- Type your note in the editor at the top
- Press `Ctrl/Cmd + Enter` to save
- Supports markdown-style formatting

### Filtering Notes
- Use the date picker on the right to filter by date
- Click "Clear" to show all notes
- Use the search bar to find specific notes

### Managing Notes
- Click on any note to edit
- Notes auto-save as you type
- Click the delete button while editing to remove a note
- Use the undo notification to restore deleted notes

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter`: Save new note
- `Esc`: Clear undo notification
- `Ctrl/Cmd + F`: Focus search bar

## Development

### Tech Stack
- React
- TypeScript
- Dexie.js (IndexedDB wrapper)
- Tailwind CSS
- date-fns

### Project Structure
```
src/
├── components/
│   ├── editor/
│   ├── notes/
│   └── datepicker/
├── database/
├── hooks/
├── store/
└── utils/
```

### Testing Data
Use the built-in test data generator:
```javascript
// In browser console
generateTestNotes(100) // Generates 100 test notes
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Acknowledgments

- Inspired by code editors and markdown note-taking apps
- Uses Tailwind CSS for styling
- Built with React and TypeScript
- Stores data using IndexedDB via Dexie.js
```

This README includes:
1. Feature overview
2. Installation instructions
3. Usage guide
4. Development information
5. Contributing guidelines
6. MIT License
7. Project structure
8. Tech stack details
9. Testing instructions
10. Acknowledgments

You can customize it further by:
- Adding screenshots
- Including more specific setup instructions
- Adding badges (build status, version, etc.)
- Including more detailed contributing guidelines
- Adding contact information

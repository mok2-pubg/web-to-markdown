# Contributing to Web to Markdown

Thank you for your interest in contributing to Web to Markdown! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue on GitHub with:
- A clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Chrome version and OS
- Any error messages from the console

### Suggesting Features

We love new ideas! Please open an issue with:
- A clear description of the feature
- Use cases and benefits
- Any implementation ideas (optional)

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/mok2-pubg/web-to-markdown.git
   cd web-to-markdown
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Keep changes focused and atomic
   - Test your changes thoroughly

4. **Test the extension**
   - Load the extension in Chrome (`chrome://extensions/`)
   - Test all three modes (Single URL, Batch, Bookmark)
   - Verify no console errors
   - Test with various websites

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Include screenshots if UI changes

## Development Setup

1. Clone the repository
2. Open `chrome://extensions/` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked" and select the project folder
5. Make changes and reload the extension to test

## Code Style

- Use 2 spaces for indentation
- Use descriptive variable names
- Add comments for complex logic
- Keep functions focused and small

## Testing

Before submitting a PR, please test:
- ✅ Single URL conversion
- ✅ Batch URL conversion
- ✅ Bookmark folder conversion
- ✅ Manual save location selection
- ✅ Auto-save to Downloads
- ✅ Error handling for failed URLs
- ✅ Title extraction from various sites

## Questions?

Feel free to open an issue for questions or clarifications!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

# Personal Portfolio Website

A minimal yet creative personal portfolio website featuring three.js 3D effects and JSON-driven content.

## Features

- **3D Background**: Floating geometric shapes and particles using three.js
- **Glassmorphism Design**: Modern UI with smooth animations and transitions
- **Data-Driven**: All content sourced from a single `data.json` file
- **Responsive**: Works seamlessly on desktop and mobile devices
- **Smooth Scrolling**: Elegant navigation with scroll-based animations

## Getting Started

### Running Locally

1. Open a terminal in this directory
2. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser and navigate to: `http://localhost:8000`

Alternatively, you can use any other local server like:
- Node.js: `npx http-server`
- PHP: `php -S localhost:8000`

### Customizing Content

Edit the `data.json` file to update your portfolio content:

```json
{
  "personal": {
    "name": "Your Name",
    "tagline": "Your Professional Title",
    "bio": "Your bio...",
    "email": "your@email.com",
    "github": "https://github.com/yourusername",
    "linkedin": "https://linkedin.com/in/yourusername"
  },
  "degrees": [...],
  "experience": [...],
  "projects": [...]
}
```

After editing `data.json`, simply refresh your browser to see the changes.

## Project Structure

```
personal_website/
├── index.html          # Main HTML structure
├── data.json           # Portfolio content (EDIT THIS!)
├── css/
│   └── style.css       # Styles and animations
├── js/
│   ├── scene.js        # Three.js 3D background
│   └── app.js          # Data loading and DOM manipulation
└── README.md           # This file
```

## Technologies

- **HTML5**: Semantic structure with SEO best practices
- **CSS3**: Custom properties, gradients, glassmorphism
- **JavaScript**: Vanilla JS with async/await
- **Three.js**: 3D graphics via CDN (r128)
- **Google Fonts**: Inter font family

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Deployment

### Firebase Hosting

The project is configured for automatic deployment to Firebase Hosting via GitHub Actions.

**Setup:**
1. Update `.firebaserc` with your Firebase project ID
2. Add `FIREBASE_SERVICE_ACCOUNT` and `FIREBASE_PROJECT_ID` to GitHub secrets
3. Push to the `main` branch

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions.

## License

Feel free to use this template for your own personal website!

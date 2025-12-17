# Shopify Theme - AR Implementation

## Overview
This is a Shopify theme with a professional AR "View in Your Space" feature implementation using Google's model-viewer library. The theme is designed for the Shopify platform and cannot run as a standalone application.

## Project Structure
```
├── assets/           # CSS, JS, and static assets
│   └── ar-styles.css # AR viewer professional styling
├── config/           # Theme settings
├── layout/           # Main theme layouts (theme.liquid, password.liquid)
├── locales/          # Translation files
├── sections/         # Theme sections including main-product.liquid
├── snippets/         # Reusable components
│   └── ar-model-viewer.liquid  # AR viewer component
├── templates/        # Page templates
└── server.js         # File browser for development preview
```

## AR Implementation

### Files Modified/Created
1. **layout/theme.liquid** - Added model-viewer script in `<head>`
2. **snippets/ar-model-viewer.liquid** - AR viewer component
3. **assets/ar-styles.css** - Professional styling for AR button and viewer

### Features
- iOS: Native AR Quick Look experience
- Android: Scene Viewer AR experience
- Desktop: Interactive 3D model with camera controls
- Professional "View in your space" button (Article.com style)
- Loading state with spinner
- Responsive design (350px mobile / 500px desktop)

### Integration
AR viewer is now **automatically integrated** into `sections/main-product.liquid`. 
It will display below the product gallery whenever a product has a 3D model uploaded.

For manual integration elsewhere:
```liquid
{% render 'ar-model-viewer', product: product %}
```

## Development
The theme browser (server.js) allows browsing theme files in Replit. The actual theme requires uploading to Shopify to function.

## Deployment
Upload theme files to Shopify Admin > Online Store > Themes to deploy.

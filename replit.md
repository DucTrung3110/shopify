# Shopify Theme - AR Implementation

## Overview
This is a Shopify theme with a professional AR "View in Your Space" feature (Article.com/Levar style). The AR button is integrated directly into the product media gallery, overlaid on 3D model thumbnails.

## Project Structure
```
├── assets/           # CSS, JS, and static assets
│   └── ar-styles.css # AR overlay button styling
├── config/           # Theme settings
├── layout/           # Main theme layouts (theme.liquid, password.liquid)
├── locales/          # Translation files
├── sections/         # Theme sections including main-product.liquid
├── snippets/         # Reusable components
│   └── product-thumbnail.liquid  # Modified for AR overlay button
├── templates/        # Page templates
└── server.js         # File browser for development preview
```

## AR Implementation

### Files Modified
1. **layout/theme.liquid** - Added model-viewer script in `<head>`
2. **snippets/product-thumbnail.liquid** - AR overlay button integrated into 3D model media tile
3. **sections/main-product.liquid** - Loads ar-styles.css for products with 3D models
4. **assets/ar-styles.css** - Professional overlay button styling (Article.com style)

### Features
- AR button appears INSIDE the product gallery (overlaid on 3D model)
- iOS: Native AR Quick Look experience
- Android: Scene Viewer AR experience
- Professional pill-shaped button with shadow
- Hover effects and responsive design

### How It Works
When a product has a 3D model (.glb/.usdz), the AR button automatically appears overlaid on the 3D model thumbnail in the product gallery. No duplicate viewers - clean integration.

## Development
The theme browser (server.js) allows browsing theme files in Replit. The actual theme requires uploading to Shopify to function.

## Deployment
Upload theme files to Shopify Admin > Online Store > Themes to deploy.

# Formula Nebula Brand Logos

## Logo Files

### 1. Main Logo (Square)
- **File:** `formula-nebula-logo.svg`
- **Dimensions:** 200x200px (scalable)
- **Usage:** Primary brand mark, digital backgrounds, print materials
- **Format:** SVG (vector)
- **Colors:** Purple (#7c3aed) → Blue (#2563eb) → Cyan (#0891b2) gradient with amber accents (#fbbf24)

### 2. Icon Version
- **File:** `formula-nebula-logo-icon.svg`
- **Dimensions:** 64x64px (scalable)
- **Usage:** App icons, favicons, UI elements
- **Format:** SVG (vector)
- **Features:** Rounded square background, simplified design for small sizes

### 3. Horizontal Lockup (With Text)
- **File:** `formula-nebula-logo-horizontal.svg`
- **Dimensions:** 300x100px (scalable)
- **Usage:** Website headers, marketing materials, social media
- **Format:** SVG (vector)
- **Includes:** Logo mark + text branding + tagline

### 4. Favicon
- **File:** `formula-nebula-favicon.svg`
- **Dimensions:** 32x32px (scalable)
- **Usage:** Browser tabs, bookmarks, web addresses
- **Format:** SVG (vector)
- **Features:** High contrast, minimal design for tiny displays

## Design Concept

The logo combines:
- **Nebula**: Cosmic cloud with gradient representing infinite possibilities
- **Mathematics**: Lambda (λ), plus (+), sigma (Σ) symbols for formula elements
- **Stars**: Accent points representing discovery and data
- **Colors**: Cool cosmic palette with warm highlights

## PNG Export Instructions

To convert SVG to PNG, use one of these methods:

### Method 1: Using Node.js/NPM tools
```bash
npm install sharp svg2png
npx svg2png formula-nebula-logo.svg --output=formula-nebula-logo.png --width=200 --height=200
```

### Method 2: Using ImageMagick
```bash
convert -background none formula-nebula-logo.svg -resize 200x200 formula-nebula-logo.png
```

### Method 3: Using Inkscape
```bash
inkscape formula-nebula-logo.svg --export-type=png --export-filename=formula-nebula-logo.png
```

### Recommended PNG Variants to Export

| Variant | Dimensions | DPI | Usage |
|---------|-----------|-----|-------|
| Logo Standard | 200x200px | 96 | Digital use |
| Logo High-DPI | 400x400px | 192 | Retina displays |
| Logo Print | 1200x1200px | 300 | Print materials |
| Icon Small | 64x64px | 96 | UI elements |
| Icon Medium | 128x128px | 96 | Larger UI |
| Icon Large | 256x256px | 192 | App store |
| Horizontal | 300x100px | 96 | Web headers |

## Color Palette

- **Primary Gradient:** #7c3aed (purple) → #2563eb (blue) → #0891b2 (cyan)
- **Accent:** #fbbf24 (amber)
- **Dark Neutral:** #1e293b
- **Light Neutral:** #f8fafc
- **Background:** White (#ffffff)

## Accessibility

- All logos maintain sufficient contrast ratios
- Icon version has rounded background for visual clarity
- Simplified design for small sizes ensures recognition at any scale

## Usage Guidelines

- ✓ Do: Use on any background color (logos include transparency awareness)
- ✓ Do: Scale proportionally
- ✓ Do: Maintain clear space around logo
- ✗ Don't: Distort or skew the mark
- ✗ Don't: Change the color palette significantly
- ✗ Don't: Remove the mathematical elements

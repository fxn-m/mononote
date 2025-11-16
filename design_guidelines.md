# Monochrome ASCII/Dithered Note-Taking App - Design Guidelines

## Design Aesthetic
Vintage terminal interface meets brutalist web design, inspired by Berkeley Graphics' early software. Stark, functional clarity with ASCII art elements and dithered textures.

## Color Palette
- **Primary**: #000000 (pure black) - main text, borders, UI elements
- **Secondary**: #FFFFFF (pure white) - backgrounds, inverse text
- **Accent**: #808080 (medium grey) - secondary elements, disabled states
- **Background**: #F8F8F8 (off-white) - main canvas
- **Border**: #333333 (dark grey) - component separators and outlines

## Typography
- **Primary Fonts**: JetBrains Mono, Courier New, Monaco (monospace stack)
- **Hierarchy**: All text uses monospace for terminal authenticity
  - Headings: Bold weight, larger point sizes
  - Body: Regular weight, consistent line-height
  - Code/Tags: Inline monospace with background differentiation

## Layout System
- **Spacing**: Minimal padding with geometric precision (use Tailwind units: 2, 4, 8, 16)
- **Grid**: Sharp rectangular containers with precise alignment
- **Borders**: All components use sharp edges (no border-radius), 1-2px solid borders
- **Containers**: Terminal-window inspired panels with hard edges

## Component Design

### Navigation/Header
- Terminal-style command bar aesthetic
- ASCII art logo/branding element
- Monochrome button controls with sharp edges

### Note Editor
- Blocky text area with visible borders
- Terminal-inspired formatting toolbar with ASCII icons
- High contrast text on background

### Sidebar/Note List
- Sharp rectangular note cards
- Border separators between items
- Tag pills with hard edges and border outlines

### Buttons
- Blocky design with hard rectangular edges
- Thick borders (2px solid)
- No rounded corners
- High contrast hover states (color inversion)

### Search
- Terminal-style search input with monospace text
- ASCII search icon (optional: use ">" or ">>" prefix)

## Visual Elements
- **Dithered Textures**: Subtle ASCII/bitmap-style background patterns for sections
- **ASCII Art**: Use sparingly for decorative elements, icons, or section dividers
- **Borders**: Heavy use of geometric borders and dividers
- **Contrast**: Maximize black/white contrast throughout

## Interactions
- Minimal animations (instant state changes preferred)
- Clear visual feedback through color inversion
- Terminal-inspired cursor states

## Images
No hero images or photography - purely typographic and geometric design. Use ASCII art or dithered patterns for visual interest instead.
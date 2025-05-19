# Asset Requirements

This document outlines the visual and audio assets needed for the Zen Garden Simulator project. Assets should maintain a consistent aesthetic that promotes a calm, meditative experience.

## Visual Style Guidelines

- **Overall Aesthetic**: Minimalist, serene, and naturalistic
- **Color Palette**: Muted, earthy tones with occasional accent colors
- **Textures**: Subtle, natural-looking textures for elements
- **Lighting**: Soft lighting with gentle shadows
- **UI**: Clean, unobtrusive interface that integrates with the garden aesthetic

## Visual Assets

### Garden Elements

#### Stones

- 5-8 different stone variations (different sizes and shapes)
- Stone textures with subtle detail
- Optional glowing/special stones for achievements

#### Sand Areas

- Base sand texture (tileable)
- Sand pattern overlays for different rake types
- Sand area border/container visuals

#### Plants

- 8-10 plant varieties including:
  - Bonsai trees (2-3 variations)
  - Bamboo (various heights)
  - Small shrubs and grasses
  - Moss patches
  - Flowering plants (subtle, seasonal)
- Each plant may need multiple frames for gentle animation

#### Water Features

- Water surface textures (tileable)
- Water ripple effect sprites/shaders
- Water container visuals (stone basins, streams, ponds)
- Optional water plants (lotus, lily pads)

#### Decorative Elements

- Lanterns (stone and paper variations)
- Bridges (small wooden or stone)
- Pathways (stone, gravel)
- Ornaments (statues, wind chimes)

### UI Elements

- Element selection panel background and frames
- Tool icons (selection, placement, rake types, etc.)
- Menu backgrounds and buttons
- Settings icons and sliders
- Achievement notification visuals
- Help/tutorial indicators

### Environmental

- Sky backgrounds for different times of day
- Weather effect sprites (rain, mist, etc.)
- Particle effects (leaves, petals, dust)
- Lighting overlays for day/night transitions

## Audio Assets

### Ambient Background

- Day ambient sound loop (birds, distant nature)
- Night ambient sound loop (crickets, soft wind)
- Rain ambient variations
- Optional meditation music tracks (very subtle)

### Water Sounds

- Small water fountain/dripping loops
- Stream/flowing water sounds
- Water splash/interaction effects

### Interaction Sounds

- Stone placement (different sounds based on size)
- Plant placement
- Sand raking sounds (continuous while drawing)
- UI interaction sounds (clicks, selections)

### Environmental Sounds

- Wind through leaves/bamboo
- Occasional distant nature sounds (birds, frogs)
- Wind chimes (if included as element)
- Rainfall (light to moderate)

## Asset Format Specifications

### Images

- PNG format for elements with transparency
- Resolution: Create at 2x intended display size for HiDPI support
- Atlas sheets for related elements to reduce draw calls
- Dimensions: Power of two textures preferred (256x256, 512x512, etc.)

### Audio

- MP3 format for broad compatibility
- OGG as alternative for better compression
- Sample rate: 44.1kHz
- Bit depth: 16-bit
- Ambient loops: 15-30 seconds minimum, seamless looping
- Effect sounds: Short, responsive, 0.5-2 seconds

## Asset Acquisition Options

1. **Free Resources**:

   - OpenGameArt.org
   - Kenney.nl
   - Freesound.org
   - Public domain resources

2. **Paid Assets**:

   - Game asset marketplaces (itch.io, GameDevMarket)
   - Stock photo/audio sites with appropriate licenses

3. **Custom Creation**:
   - Simple assets could be created in-house
   - Consider commissioning critical assets for unique look

## Asset Management

- All assets should be properly attributed according to their licenses
- Maintain an asset inventory spreadsheet with sources and license information
- Optimize assets for web delivery (compression, sizing)
- Use descriptive, consistent naming conventions:

  ```
  category_subcategory_descriptor_variant.extension

  Examples:
  stone_large_granite_01.png
  plant_bonsai_pine_small.png
  sound_ambient_night_loop.mp3
  ```

## Phaser Asset Loading

Assets will be loaded via Phaser's asset management system:

```javascript
function preload() {
  // Image loading
  this.load.image("stone_large_01", "assets/images/stones/stone_large_01.png");

  // Spritesheet loading
  this.load.spritesheet(
    "plant_bamboo",
    "assets/images/plants/plant_bamboo.png",
    { frameWidth: 64, frameHeight: 128 }
  );

  // Audio loading
  this.load.audio("ambient_day", [
    "assets/audio/ambient_day.mp3",
    "assets/audio/ambient_day.ogg",
  ]);
}
```

## Asset Development Timeline

1. **Prototyping Phase**: Simple placeholder assets for core functionality
2. **Alpha Phase**: Basic final assets for essential elements
3. **Beta Phase**: Complete asset set with refinements
4. **Release**: Final polished assets with optimizations

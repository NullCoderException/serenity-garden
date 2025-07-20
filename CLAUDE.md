# Zen Garden Simulator - Project Overview

## Project Vision

A peaceful, web-based zen garden simulator where users can place, arrange, and interact with garden elements to create their own meditative space. The experience focuses on calm, deliberate interactions and aesthetic beauty rather than challenge or competition.

## Technical Stack

- **Framework**: Phaser.js 3
- **Languages**: TypeScript, HTML5, CSS3
- **Build Tools**: Webpack with TypeScript compiler
- **Version Control**: Git
- **Optional Backend**: Node.js with Express (for saving gardens)

## Core Features

1. **Garden Element Placement System**

   - Stones, plants, sand areas, water features
   - Intuitive drag-and-drop interface
   - Grid-based or free-form placement options

2. **Sand Manipulation**

   - Drawing patterns in sand areas
   - Different rake tools with unique pattern effects
   - Realistic sand displacement physics

3. **Environmental Effects**

   - Day/night cycle with lighting changes
   - Gentle weather effects (occasional rain, mist)
   - Ambient animations (leaves rustling, water rippling)

4. **Garden Interaction**

   - Zoom and pan controls
   - Object rotation and scaling
   - Meditation mode (purely observational)

5. **Progression System**
   - Unlockable garden elements
   - Achievement system for garden milestones
   - Garden templates and inspiration gallery

## Project Resources

- [Project Checklist](PROJECT_CHECKLIST.md)
- [Code Standards](CODE_STANDARDS.md)
- [Asset Requirements](ASSET_REQUIREMENTS.md)
- [Development Journal](DEV_JOURNAL.md)

## Current Status (January 2025)

### ✅ **Completed Features**
- **Core Engine**: Phaser.js setup with TypeScript, webpack build system
- **Camera Controls**: Pan (right-click + drag) and zoom (mouse wheel)
- **Element System**: Stone and Plant placement with drag-and-drop
- **Dual Mode System**: Placement mode and Rake mode for sand manipulation
- **Grid System**: Toggleable grid overlay for precise placement
- **Clean UI**: Minimal HUD with collapsible help panel (Press H)
- **Sand Garden**: Interactive sand layer with 4 rake pattern types
- **Element Variety**: 4 stone types, 5 plant types with animations

### 🚧 **Next Priority Features**
- **Visual Assets**: Replace placeholder rectangles with actual sprites
- **Save/Load System**: Garden persistence using localStorage
- **Water Features**: Add water elements and ripple effects
- **Day/Night Cycle**: Ambient lighting changes
- **Audio System**: Ambient sounds and interaction feedback

## Development Workflow

### Branch Strategy
All new features should be developed in feature branches:
```bash
git checkout -b feature/feature-name
# Make changes
git commit -m "feat: description"
# When ready, create PR to main
```

### Development Approach

This project uses an iterative development approach with the following phases:

### Phase 1: Core Engine ✅ **COMPLETED**
- ✅ Project setup with Phaser.js
- ✅ Basic rendering and camera controls
- ✅ Simple element placement system
- ✅ Clean UI framework

### Phase 2: Garden Elements ✅ **MOSTLY COMPLETED**
- ✅ Implementation of different garden objects (stones, plants)
- ✅ Basic interaction mechanics (drag, rotate, select)
- ✅ Sand area implementation with rake patterns
- 🚧 Visual assets (still using placeholders)

### Phase 3: Polish and Depth 🚧 **IN PROGRESS**
- 🚧 Enhanced visual effects (need real sprites)
- ❌ Sound design and implementation
- ✅ Advanced interaction mechanics
- ❌ Save/load functionality

### Phase 4: Refinement ❌ **PENDING**
- ❌ User testing and feedback incorporation
- ❌ Performance optimization
- ❌ Additional content (water features, day/night)
- ❌ Deployment and sharing capabilities

## Development Commands

### Quick Start
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run type-check   # TypeScript compilation check
```

### Git Workflow
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
# Make changes, test, commit
git push -u origin feature/your-feature-name
# Create PR when ready
```

## Integration with Claude Code

Claude Code assists with:
- ✅ Component architecture and templates
- ✅ TypeScript implementation and debugging
- ✅ UI/UX improvements and responsive design
- 🚧 Asset integration and visual enhancements
- 🚧 Complex algorithms (physics, procedural generation)
- ❌ Performance optimization (planned)

### Current Branch: `feature/ui-cleanup`
Clean, minimal HUD implementation with collapsible help panel

## Timeline

- **Foundation (Weeks 1-2)**: Project setup, basic rendering
- **Core Mechanics (Weeks 3-5)**: Element placement, basic interactions
- **Visual Enhancement (Weeks 6-8)**: Polish, effects, sound
- **Feature Completion (Weeks 9-10)**: Save/load, achievements
- **Testing & Deployment (Weeks 11-12)**: Refinement, publish

## Success Criteria

- Smooth, intuitive garden creation interface
- Visually appealing garden elements and effects
- Genuinely relaxing and meditative experience
- Stable performance across modern browsers
- Personal satisfaction with completed project

## Learning Goals

- Game development principles and patterns
- Phaser.js framework expertise
- Interactive design for meditative experiences
- Audio-visual programming for ambient experiences
- Game state management and persistence

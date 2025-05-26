# Code Standards

## General Principles

- Write clean, readable, and maintainable code
- Use meaningful names for variables, functions, and classes
- Keep functions small and focused on a single responsibility
- Document complex logic and important design decisions
- Optimize for readability first, performance second (except in critical sections)

## TypeScript/JavaScript Coding Standards

### Naming Conventions

- **Classes**: PascalCase (e.g., `SandArea`, `StoneElement`)
- **Functions/Methods**: camelCase (e.g., `createElement`, `updatePosition`)
- **Variables**: camelCase (e.g., `currentTool`, `gardenElements`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ELEMENTS`, `DEFAULT_ZOOM_LEVEL`)
- **Private properties/methods**: Prefix with underscore (e.g., `_updateInternalState`)

### Code Structure

- Use ES6+ features where appropriate (arrow functions, destructuring, etc.)
- Prefer `const` over `let` when variables won't be reassigned
- Avoid global variables; use modules and encapsulation
- Group related functionality into classes or modules
- Keep file length reasonable (under 500 lines as a guideline)

### TypeScript Specific

- Enable strict mode in tsconfig.json
- Always specify return types for functions
- Use interfaces for object shapes
- Prefer type aliases for unions and complex types
- Use access modifiers (private, public, protected) on class members
- Prefix unused parameters with underscore (e.g., `_unusedParam`)
- Avoid `any` type; use `unknown` if type is truly unknown

### Comments and Documentation

- Use JSDoc comments for functions and classes (TypeScript will infer types from code)
- Document complex logic and non-obvious design decisions
- Keep comments concise and meaningful

```typescript
/**
 * Creates a new garden element at the specified position
 * @param type - The type of element to create
 * @param position - The x,y coordinates for placement
 * @param options - Optional configuration settings
 * @returns The created element
 */
function createElement(
    type: ElementType,
    position: Position,
    options?: ElementOptions
): GardenElement {
    // Implementation
}
```

- Include brief comments for non-obvious code sections
- Document public APIs thoroughly
- Keep comments up-to-date with code changes

### Phaser.js Specific

- Follow the Scene structure for game organization
- Use Phaser's built-in systems (physics, tweens, etc.) consistently
- Organize game objects in logical containers/groups
- Leverage Phaser's event system for decoupled communication
- Follow Phaser's lifecycle methods (preload, create, update)

## File Organization

```
src/
├── assets/           # Images, sounds, etc.
├── scenes/           # Phaser scenes
├── components/       # Reusable game components
├── systems/          # Core game systems
├── ui/               # User interface elements
├── utils/            # Helper functions
├── config.js         # Game configuration
└── main.js           # Entry point
```

## Error Handling

- Use try/catch blocks for operations that may fail
- Provide meaningful error messages
- Gracefully handle unexpected conditions
- Consider using a simple error logging system

## Testing

- Write unit tests for critical utility functions
- Implement simple integration tests for key user flows
- Test on multiple browsers periodically
- Manual testing checklist for releases

## Performance Considerations

- Limit object creation in update loops
- Use object pooling for frequently created/destroyed objects
- Monitor FPS and optimize bottlenecks
- Be conscious of memory usage, especially with images and audio
- Use appropriate data structures for different operations

## Version Control

- Make frequent, small commits with clear messages
- Use branches for features and bug fixes
- Write descriptive commit messages:

  ```
  Add sand raking functionality

  - Implement mouse-based sand pattern drawing
  - Add multiple rake types with different patterns
  - Create sand displacement shader for realistic effect
  ```

- Review code before committing

## Development Process

- Start with skeleton implementations to test concepts
- Implement core functionality before adding polish
- Refactor regularly to maintain code quality
- Document design decisions and architecture in comments or separate files

## Integration with Claude Code

- Document functions with clear descriptions for easier Claude Code assistance
- Break complex requests into smaller, more focused tasks
- Provide context when requesting assistance
- Document Claude Code-generated solutions for future reference

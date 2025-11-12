# Common UI Components

Shared, reusable UI components used throughout the operator dashboard.

## Component Inventory (21 components)

### Form Components
- **Button.tsx** - Primary interactive button
- **Input.tsx** - Text input field
- **Select.tsx** - Dropdown selection
- **Checkbox.tsx** - Checkbox input
- **Slider.tsx** - Range slider
- **Label.tsx** - Form label

### Feedback Components
- **Alert.tsx** - Alert messages
- **Badge.tsx** - Status badges
- **Toast.tsx** - Toast notifications
- **Modal.tsx** - Modal dialogs
- **Spinner.tsx** - Loading spinner
- **Skeleton.tsx** - Loading skeleton

### Layout Components
- **Card.tsx** - Content card container
- **Container.tsx** - Page container
- **Footer.tsx** - Page footer

### Display Components
- **Progress.tsx** - Progress bar
- **EmptyState.tsx** - Empty state placeholder
- **Logo.tsx** - Application logo

### Theme Components
- **ThemeProvider.tsx** - Theme context provider
- **ThemeToggle.tsx** - Light/dark mode toggle

### Barrel Export
- **index.ts** - Central export for all components

## Usage

```typescript
// Import individual components
import { Button, Input, Card } from '@/components/Common';

// Or import directly
import { Button } from '@/components/Common/Button';
```

## Future Reorganization (Recommended)

For better organization as the library grows, consider this structure:

```
components/UI/
├── Forms/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── Slider.tsx
│   └── Label.tsx
│
├── Feedback/
│   ├── Alert.tsx
│   ├── Badge.tsx
│   ├── Toast.tsx
│   ├── Modal.tsx
│   ├── Spinner.tsx
│   └── Skeleton.tsx
│
├── Layout/
│   ├── Card.tsx
│   ├── Container.tsx
│   ├── Footer.tsx
│   ├── Progress.tsx
│   └── EmptyState.tsx
│
├── Theme/
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
│
├── Logo.tsx
└── index.ts (barrel export)
```

### Migration Strategy

1. **Phase 1**: Create new `UI/` directory structure
2. **Phase 2**: Copy files to new locations
3. **Phase 3**: Update imports across codebase
4. **Phase 4**: Remove old `Common/` directory
5. **Estimated effort**: 4-6 hours

**Recommendation**: Defer until component library exceeds 30 components or categorization becomes necessary for discoverability.

## Component Guidelines

### Creating New Common Components

1. **Reusability**: Component should be used in 3+ places
2. **No Business Logic**: Pure UI components only
3. **Prop Types**: Use TypeScript interfaces
4. **Documentation**: Add JSDoc comments
5. **Accessibility**: Follow WCAG 2.1 guidelines
6. **Testing**: Add component tests

### Example Structure

```typescript
import { FC } from 'react';

interface MyComponentProps {
  /** Description of prop */
  myProp: string;
  /** Optional prop with default */
  optionalProp?: boolean;
}

/**
 * MyComponent - Brief description
 * @example
 * <MyComponent myProp="value" />
 */
export const MyComponent: FC<MyComponentProps> = ({
  myProp,
  optionalProp = false
}) => {
  return <div>{myProp}</div>;
};
```

## Styling Standards

- Use **Tailwind CSS** for styling
- Follow existing color/spacing tokens
- Support light and dark themes
- Mobile-first responsive design

## Dependencies

- **React** 19.2.0
- **Tailwind CSS** 4
- **Radix UI** (for complex components like Modal, Select)
- **Lucide React** (for icons)

---

**Last Updated**: 2025-11-11

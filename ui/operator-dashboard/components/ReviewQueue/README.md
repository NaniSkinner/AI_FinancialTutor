# Review Queue Component

The Review Queue is the primary interface for operators to review and manage AI-generated recommendations in the SpendSense Operator Dashboard.

## Components

### ReviewQueue

Main container component that manages the entire review workflow.

**Features:**

- Real-time data fetching with auto-refresh (30 seconds)
- Filtering by persona, priority, and status
- Bulk selection and bulk approval
- Keyboard shortcuts for efficiency
- Loading and error states

**State:**

- `selectedIds`: Array of selected recommendation IDs
- `focusedIndex`: Current focused recommendation (for keyboard navigation)
- `filters`: Active filter criteria

### RecommendationCard

Individual recommendation card with full operator actions.

**Props:**

```typescript
{
  recommendation: Recommendation;
  isSelected: boolean;
  onToggleSelect: () => void;
  onAction: () => void;
}
```

**Actions:**

- ✓ **Approve**: Mark recommendation as approved
- ✗ **Reject**: Reject with reason (prompt)
- 📝 **Modify**: Edit rationale inline
- 🚩 **Flag**: Flag for senior review (prompt)

**Features:**

- Expandable decision traces
- Guardrail check status display
- Visual selection state
- Loading states for all actions

### FilterPanel

Filter controls for recommendations.

**Props:**

```typescript
{
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}
```

**Filters:**

- **Persona**: All, High Utilization, Variable Income, Student, Subscription-Heavy, Savings Builder
- **Priority**: All, High, Medium, Low
- **Status**: Pending, Approved, Rejected, Flagged

### BulkActions

Bulk action controls with confirmation modal.

**Props:**

```typescript
{
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onBulkApprove: () => Promise<void>;
}
```

**Features:**

- Selection count display
- Bulk approve with confirmation modal
- Warning message before bulk actions
- Processing state

## Keyboard Shortcuts

### Global Shortcuts (ReviewQueue Level)

| Key            | Action                                     |
| -------------- | ------------------------------------------ |
| `Cmd/Ctrl + A` | Select all recommendations                 |
| `Escape`       | Clear all selections                       |
| `↓` Arrow Down | Move focus to next recommendation          |
| `↑` Arrow Up   | Move focus to previous recommendation      |
| `Space`        | Toggle selection of focused recommendation |

### Card-Level Shortcuts (When reviewing)

| Key | Action                               |
| --- | ------------------------------------ |
| `A` | Approve recommendation               |
| `R` | Reject recommendation (opens prompt) |
| `F` | Flag recommendation (opens prompt)   |
| `M` | Enter modify mode                    |

**Note**: Keyboard shortcuts do not fire when typing in input fields or textareas.

## Usage Example

```tsx
import { ReviewQueue } from "@/components/ReviewQueue";

export default function OperatorDashboard() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <ReviewQueue />
    </main>
  );
}
```

## API Integration

The ReviewQueue uses the following API endpoints:

- `GET /api/operator/recommendations` - Fetch recommendations with filters
- `POST /api/operator/recommendations/:id/approve` - Approve recommendation
- `POST /api/operator/recommendations/:id/reject` - Reject recommendation
- `PATCH /api/operator/recommendations/:id` - Modify recommendation
- `POST /api/operator/recommendations/:id/flag` - Flag recommendation
- `POST /api/operator/recommendations/bulk-approve` - Bulk approve

## Mock Data Mode

To run with mock data (no backend required):

1. Ensure `.env.local` has:

   ```
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```

2. Mock data is defined in `/lib/mockData.ts`

## Custom Hooks

### useRecommendations

Fetches recommendations with SWR for caching and auto-refresh.

```typescript
const { data, error, isLoading, mutate } = useRecommendations(filters);
```

### useKeyboardShortcuts

Sets up keyboard event listeners for operator efficiency.

```typescript
useKeyboardShortcuts({
  onApprove: handleApprove,
  onReject: handleReject,
  onFlag: handleFlag,
  onModify: () => setIsModifying(true),
});
```

## Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation fully supported
- Focus states visible
- Color contrast meets WCAG AA standards
- Loading states announced to screen readers

## Performance

- SWR caching prevents unnecessary API calls
- Auto-refresh every 30 seconds
- Optimistic UI updates (planned)
- Component memoization for large lists (planned)

## Future Enhancements

- [ ] Toast notifications instead of alert()
- [ ] Optimistic UI updates
- [ ] Infinite scroll for large queues
- [ ] Recommendation preview modal
- [ ] Comment/note system
- [ ] Undo functionality
- [ ] Advanced search
- [ ] Sorting options
- [ ] Export to CSV

## Testing

Run the dashboard with:

```bash
bun run dev
```

Open `http://localhost:3000` in your browser.

## Dependencies

- React 19
- Next.js 16
- SWR for data fetching
- Radix UI for Modal
- Tailwind CSS for styling

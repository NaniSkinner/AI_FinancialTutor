# SpendSense Operator Dashboard - Setup Guide

## Quick Start

### 1. Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Operator Configuration
NEXT_PUBLIC_OPERATOR_ID=op_001

# Feature Flags
NEXT_PUBLIC_ENABLE_BULK_APPROVE=true

# IMPORTANT: Set to "true" to use mock data (no backend required)
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Run Development Server

```bash
bun run dev
```

Visit: **http://localhost:3000**

---

## Mock Data Mode

When `NEXT_PUBLIC_USE_MOCK_DATA=true`:

- ✅ No backend server required
- ✅ Mock data returned instantly
- ✅ No API connection errors
- ✅ Perfect for frontend development

You'll see a "Mock Data" badge in the header when this mode is active.

### Mock Data Includes:

- 7 sample recommendations (various statuses and priorities)
- 3 user signal profiles
- 2 decision traces
- Operator statistics
- System alerts

---

## Production Mode

When `NEXT_PUBLIC_USE_MOCK_DATA=false`:

- Connects to backend API at `NEXT_PUBLIC_API_URL`
- Requires SpendSense backend to be running
- Real-time data from database

---

## Troubleshooting

### Issue: Still seeing "Failed to load resource" errors

**Solution:**

1. Stop the dev server (Ctrl+C)
2. Clear Next.js cache: `rm -rf .next`
3. Verify `.env.local` has `NEXT_PUBLIC_USE_MOCK_DATA=true`
4. Restart: `bun run dev`

### Issue: Environment variables not loading

**Solution:**

- Environment variables MUST start with `NEXT_PUBLIC_` to be available in the browser
- Restart dev server after changing `.env.local`
- Check browser console for the "Mock Data" badge in the header

### Issue: Components not updating

**Solution:**

```bash
# Clear cache and restart
rm -rf .next
bun run dev
```

---

## Build for Production

```bash
# Type check
bun x tsc --noEmit

# Lint
bun run lint

# Build
bun run build

# Start production server
bun start
```

---

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check formatting

---

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Runtime**: Bun (faster than Node.js)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Data Fetching**: SWR
- **State Management**: Zustand

---

## Next Steps

Once the Core UI Framework (Shard 2) is complete, proceed to:

- **Shard 3**: Review Queue Implementation
- **Shard 4**: User Explorer
- **Shard 5**: Decision Traces
- **Shard 6**: Alert Panel
- **Shard 7**: Testing & Polish

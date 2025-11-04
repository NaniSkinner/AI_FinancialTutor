# SpendSense - Operator Dashboard User Explorer & Signals Tasks

**Shard**: 4 - User Explorer & Signals  
**Status**: ✅ COMPLETE - Core Implementation Done  
**Start Date**: November 3, 2025  
**Completion Date**: November 4, 2025  
**Phase**: Core Feature Implementation  
**Estimated Size**: ~15% of total dashboard implementation  
**Dependencies**: Shard 1 (Foundation), Shard 2 (UI Framework) must be complete

---

## Project Overview

Building the User Explorer - a deep-dive interface for exploring user behavioral signals and persona history. This feature allows operators to search for specific users and view their complete behavioral signal profile (credit, subscriptions, savings, income patterns) to understand the context behind AI-generated recommendations.

**Key Deliverables**:

- UserExplorer main component with user details display
- UserSearch component for finding users by ID
- SignalCard component showing 4 signal types (credit, subscriptions, savings, income)
- PersonaTimeline component showing persona assignment history
- useUserSignals and usePersonaHistory custom hooks
- Signal health indicators with color coding
- Full API integration for user data

**Success Criteria**: Operators can search users, view all signals with proper formatting, see persona history, all states handled gracefully

---

## Phase 1: Custom Hooks Setup

### Task 1.1: Create useUserSignals Hook

- [ ] Create `/hooks/useUserSignals.ts`
- [ ] Import useSWR from 'swr'
- [ ] Import fetchUserSignals from '@/lib/api'
- [ ] Import UserSignals type from '@/lib/types'

### Task 1.2: Implement useUserSignals Hook Logic

- [ ] Define useUserSignals function
  - [ ] Accept userId parameter (string | null)
- [ ] Call useSWR with conditional key
  - [ ] Key: userId ? `/api/operator/users/${userId}/signals` : null
  - [ ] Fetcher: conditional call to fetchUserSignals
  - [ ] Options:
    - [ ] revalidateOnFocus: false (don't refetch on focus)
- [ ] Destructure: data, error, isLoading, mutate
- [ ] Return object with all values

### Task 1.3: Create usePersonaHistory Hook

- [ ] Create `/hooks/usePersonaHistory.ts`
- [ ] Import useSWR from 'swr'
- [ ] Define PersonaHistoryEntry interface
  - [ ] date: string
  - [ ] persona: string
  - [ ] match_strength: number

### Task 1.4: Implement usePersonaHistory Hook Logic

- [ ] Define fetchPersonaHistory async function
  - [ ] Accept userId parameter
  - [ ] Get API_URL from env or default
  - [ ] Fetch from endpoint
  - [ ] Check response.ok
  - [ ] Return parsed JSON
- [ ] Define usePersonaHistory function
  - [ ] Accept userId parameter (string)
- [ ] Call useSWR with conditional key
  - [ ] Key: userId ? `/api/operator/users/${userId}/persona-history` : null
  - [ ] Fetcher: conditional call to fetchPersonaHistory
  - [ ] Options:
    - [ ] revalidateOnFocus: false
- [ ] Destructure and return data, error, isLoading, mutate

### Task 1.5: Test Custom Hooks

- [ ] Test useUserSignals:
  - [ ] Verify null userId doesn't trigger fetch
  - [ ] Verify valid userId triggers fetch
  - [ ] Test loading state
  - [ ] Test error handling
- [ ] Test usePersonaHistory:
  - [ ] Same tests as above
  - [ ] Verify PersonaHistoryEntry type matches response

---

## Phase 2: Utility Functions Enhancement

### Task 2.1: Add Signal Health Function

- [ ] Open `/lib/utils.ts`
- [ ] Define getSignalHealth function
  - [ ] Accept type: string
  - [ ] Accept value: number
  - [ ] Return: 'good' | 'warning' | 'critical'

### Task 2.2: Implement Signal Health Logic

- [ ] Add switch statement on type
- [ ] Implement 'credit_utilization' case:
  - [ ] < 30: return 'good'
  - [ ] < 50: return 'warning'
  - [ ] > = 50: return 'critical'
- [ ] Implement 'emergency_fund' case:
  - [ ] > = 3: return 'good'
  - [ ] > = 1: return 'warning'
  - [ ] < 1: return 'critical'
- [ ] Implement 'income_variability' case:
  - [ ] < 20: return 'good'
  - [ ] < 40: return 'warning'
  - [ ] > = 40: return 'critical'
- [ ] Default case: return 'good'

### Task 2.3: Add Additional Utility Functions

- [ ] Add formatCurrency function (if not exists)
  - [ ] Accept amount: number
  - [ ] Return formatted string with $ and commas
- [ ] Add formatPercentage function (if not exists)
  - [ ] Accept value: number
  - [ ] Return formatted string with % symbol
- [ ] Export all new functions

### Task 2.4: Test Utility Functions

- [ ] Test getSignalHealth with various inputs
- [ ] Test formatCurrency with different amounts
- [ ] Test formatPercentage with different values
- [ ] Verify edge cases (negative numbers, zero, etc.)

---

## Phase 3: UserSearch Component

### Task 3.1: Create UserSearch Component File

- [ ] Create `/components/UserExplorer/UserSearch.tsx`
- [ ] Import React, useState
- [ ] Import Button from Common
- [ ] Define Props interface
  - [ ] onUserSelect: (userId: string) => void

### Task 3.2: Implement Component State

- [ ] Define UserSearch component
- [ ] Add state for searchInput (string, default empty)

### Task 3.3: Implement Search Handler

- [ ] Define handleSearch function
  - [ ] Accept e: React.FormEvent
  - [ ] Call e.preventDefault()
  - [ ] Check if searchInput.trim() is not empty
  - [ ] Call onUserSelect with trimmed input
  - [ ] Optionally clear input after search

### Task 3.4: Implement Component UI

- [ ] Create form element
  - [ ] onSubmit={handleSearch}
  - [ ] className="flex gap-2"
- [ ] Add input element
  - [ ] type="text"
  - [ ] value={searchInput}
  - [ ] onChange updates state
  - [ ] placeholder="Enter user ID..."
  - [ ] Styling: flex-1 px-3 py-2 border rounded-lg
  - [ ] Focus styles: ring-2 ring-indigo-500
- [ ] Add Submit button
  - [ ] type="submit"
  - [ ] Text: "Search"

### Task 3.5: Export and Test UserSearch

- [ ] Export UserSearch component
- [ ] Test typing in input
- [ ] Test form submission on Enter key
- [ ] Test Search button click
- [ ] Test with empty input (should not submit)
- [ ] Test with whitespace-only input
- [ ] Verify onUserSelect is called with correct value

---

## Phase 4: SignalCard Component - Structure

### Task 4.1: Create SignalCard Component File

- [ ] Create `/components/UserExplorer/SignalCard.tsx`
- [ ] Import React
- [ ] Import signal type interfaces from '@/lib/types'
  - [ ] CreditSignals
  - [ ] SubscriptionSignals
  - [ ] SavingsSignals
  - [ ] IncomeSignals

### Task 4.2: Define Props Interface

- [ ] Define Props interface
  - [ ] title: string
  - [ ] data: CreditSignals | SubscriptionSignals | SavingsSignals | IncomeSignals
  - [ ] type: 'credit' | 'subscriptions' | 'savings' | 'income'

### Task 4.3: Implement Component Structure

- [ ] Define SignalCard component
- [ ] Create renderContent function
  - [ ] Switch on type parameter
  - [ ] Return appropriate JSX for each type
- [ ] Return card container
  - [ ] bg-gray-50 rounded-lg border border-gray-200 p-4
- [ ] Add card title
  - [ ] h4: text-sm font-medium text-gray-900 mb-3
- [ ] Render content from renderContent()

---

## Phase 5: SignalCard Component - Credit Signals

### Task 5.1: Implement Credit Case

- [ ] In renderContent switch, add 'credit' case
- [ ] Cast data to CreditSignals type
- [ ] Return container div (space-y-2)

### Task 5.2: Add Aggregate Utilization Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Aggregate Utilization"
  - [ ] text-sm text-gray-600
- [ ] Add value with color coding:
  - [ ] > = 50: text-red-600
  - [ ] > = 30: text-yellow-600
  - [ ] < 30: text-green-600
  - [ ] text-sm font-semibold
  - [ ] Show percentage value

### Task 5.3: Add Total Credit Used Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Total Credit Used"
- [ ] Add value:
  - [ ] text-sm font-semibold text-gray-900
  - [ ] Format with toLocaleString()
  - [ ] Add $ prefix

### Task 5.4: Add Total Credit Available Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Total Credit Available"
- [ ] Add value:
  - [ ] Format with toLocaleString()
  - [ ] Add $ prefix

### Task 5.5: Add Interest Charges Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Interest Charges"
- [ ] Add value with conditional color:
  - [ ] If any_interest_charges: text-red-600, show "Yes"
  - [ ] Else: text-green-600, show "None"
  - [ ] text-sm font-semibold

---

## Phase 6: SignalCard Component - Subscriptions Signals

### Task 6.1: Implement Subscriptions Case

- [ ] In renderContent switch, add 'subscriptions' case
- [ ] Cast data to SubscriptionSignals type
- [ ] Return container div (space-y-2)

### Task 6.2: Add Recurring Merchants Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Recurring Merchants"
- [ ] Add value:
  - [ ] text-sm font-semibold text-gray-900
  - [ ] Show count

### Task 6.3: Add Monthly Spend Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Monthly Spend"
- [ ] Add value:
  - [ ] Format with toLocaleString()
  - [ ] Add $ prefix

### Task 6.4: Add Percentage of Total Spend Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "% of Total Spend"
- [ ] Add value:
  - [ ] Show percentage
  - [ ] Add % suffix

### Task 6.5: Add Top Subscriptions Section

- [ ] Check if merchants array exists and has items
- [ ] Create conditional section:
  - [ ] mt-2 pt-2 border-t border-gray-100
- [ ] Add section label:
  - [ ] text-xs text-gray-500 mb-1
  - [ ] Text: "Top Subscriptions:"
- [ ] Map through first 3 merchants:
  - [ ] text-xs text-gray-600
  - [ ] Format: "• {name}: ${amount.toFixed(2)}"

---

## Phase 7: SignalCard Component - Savings Signals

### Task 7.1: Implement Savings Case

- [ ] In renderContent switch, add 'savings' case
- [ ] Cast data to SavingsSignals type
- [ ] Return container div (space-y-2)

### Task 7.2: Add Total Balance Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Total Balance"
- [ ] Add value:
  - [ ] Format with toLocaleString()
  - [ ] Add $ prefix
  - [ ] text-sm font-semibold text-gray-900

### Task 7.3: Add Growth Rate Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Growth Rate"
- [ ] Add value with conditional color:
  - [ ] > 0: text-green-600, add "+" prefix
  - [ ] < 0: text-red-600, no prefix
  - [ ] text-sm font-semibold
  - [ ] Show percentage with % suffix

### Task 7.4: Add Monthly Inflow Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Monthly Inflow"
- [ ] Add value:
  - [ ] Format with toLocaleString()
  - [ ] Add $ prefix

### Task 7.5: Add Emergency Fund Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Emergency Fund"
- [ ] Add value with conditional color:
  - [ ] > = 3 months: text-green-600
  - [ ] < 3 months: text-yellow-600
  - [ ] text-sm font-semibold
  - [ ] Show value with toFixed(1) + " months"

---

## Phase 8: SignalCard Component - Income Signals

### Task 8.1: Implement Income Case

- [ ] In renderContent switch, add 'income' case
- [ ] Cast data to IncomeSignals type
- [ ] Return container div (space-y-2)

### Task 8.2: Add Income Type Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Income Type"
- [ ] Add value:
  - [ ] text-sm font-semibold text-gray-900 capitalize
  - [ ] Show income_type

### Task 8.3: Add Payment Frequency Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Payment Frequency"
- [ ] Add value:
  - [ ] text-sm font-semibold text-gray-900 capitalize
  - [ ] Show payment_frequency

### Task 8.4: Add Median Pay Gap Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Median Pay Gap"
- [ ] Add value:
  - [ ] text-sm font-semibold text-gray-900
  - [ ] Show median_pay_gap_days + " days"

### Task 8.5: Add Income Variability Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Income Variability"
- [ ] Add value with conditional color:
  - [ ] > 20%: text-red-600
  - [ ] <= 20%: text-green-600
  - [ ] text-sm font-semibold
  - [ ] Show percentage with % suffix

### Task 8.6: Add Cash Flow Buffer Row

- [ ] Create flex container (justify-between)
- [ ] Add label: "Cash Flow Buffer"
- [ ] Add value with conditional color:
  - [ ] < 1 month: text-red-600
  - [ ] > = 1 month: text-green-600
  - [ ] text-sm font-semibold
  - [ ] Show value with toFixed(1) + " months"

### Task 8.7: Export and Test SignalCard

- [ ] Export SignalCard component
- [ ] Test with mock credit data
- [ ] Test with mock subscriptions data
- [ ] Test with mock savings data
- [ ] Test with mock income data
- [ ] Verify all color coding works
- [ ] Verify all formatting (currency, percentages)

---

## Phase 9: PersonaTimeline Component

### Task 9.1: Create PersonaTimeline Component File

- [ ] Create `/components/UserExplorer/PersonaTimeline.tsx`
- [ ] Import React
- [ ] Import usePersonaHistory hook
- [ ] Import Spinner, Badge from Common
- [ ] Import utility functions (getPersonaColor, formatPersonaName, formatDate)
- [ ] Define Props interface
  - [ ] userId: string

### Task 9.2: Implement Component Logic

- [ ] Define PersonaTimeline component
- [ ] Call usePersonaHistory hook with userId
- [ ] Destructure: data (history), isLoading, error

### Task 9.3: Implement Loading State

- [ ] Add conditional render for isLoading
- [ ] Return centered container
  - [ ] flex justify-center py-4
- [ ] Show Spinner

### Task 9.4: Implement Error State

- [ ] Add conditional render for error
- [ ] Return error message
  - [ ] text-sm text-red-600
  - [ ] Text: "Failed to load persona history"

### Task 9.5: Implement Empty State

- [ ] Check if !history or history.length === 0
- [ ] Return empty message
  - [ ] text-sm text-gray-500
  - [ ] Text: "No persona history available"

### Task 9.6: Implement Timeline Display

- [ ] Return container div (space-y-3)
- [ ] Map through history array
- [ ] For each entry, create timeline item:
  - [ ] Key: index
  - [ ] Container: flex items-center gap-4 p-3 bg-gray-50 rounded-lg
  - [ ] Date column:
    - [ ] flex-shrink-0 text-sm text-gray-600 w-24
    - [ ] Use formatDate(entry.date)
  - [ ] Persona column:
    - [ ] flex-1 flex items-center gap-2
    - [ ] Badge with persona:
      - [ ] Use getPersonaColor(entry.persona)
      - [ ] Use formatPersonaName(entry.persona)
    - [ ] Match strength:
      - [ ] text-sm text-gray-600
      - [ ] Format: "({match_strength \* 100}% match)"
  - [ ] Current indicator (if index === 0):
    - [ ] flex-shrink-0
    - [ ] Badge: bg-indigo-100 text-indigo-800
    - [ ] Text: "Current"

### Task 9.7: Export and Test PersonaTimeline

- [ ] Export PersonaTimeline component
- [ ] Test with mock history data
- [ ] Test loading state
- [ ] Test error state
- [ ] Test empty state
- [ ] Test current badge on first item
- [ ] Verify all formatting

---

## Phase 10: UserExplorer Component - Structure

### Task 10.1: Create UserExplorer Component File

- [ ] Create `/components/UserExplorer/UserExplorer.tsx`
- [ ] Import React, useState
- [ ] Import UserSearch component
- [ ] Import SignalCard component
- [ ] Import PersonaTimeline component
- [ ] Import useUserSignals hook
- [ ] Import Spinner, Badge from Common
- [ ] Import utility functions (getPersonaColor, formatPersonaName)

### Task 10.2: Implement Component State

- [ ] Define UserExplorer component
- [ ] Add state for selectedUserId (string | null, default null)

### Task 10.3: Call useUserSignals Hook

- [ ] Call useUserSignals with selectedUserId
- [ ] Destructure: data (userData), isLoading, error

---

## Phase 11: UserExplorer Component - UI Layout

### Task 11.1: Implement Main Container

- [ ] Create main container div
  - [ ] bg-white rounded-lg border border-gray-200 p-6

### Task 11.2: Implement Header

- [ ] Add h2 title
  - [ ] text-xl font-semibold text-gray-900 mb-4
  - [ ] Text: "User Signal Explorer"

### Task 11.3: Implement Search Section

- [ ] Render UserSearch component
  - [ ] Pass onUserSelect={setSelectedUserId}

### Task 11.4: Implement User Details Container

- [ ] Add conditional render (selectedUserId exists)
- [ ] Create details container
  - [ ] mt-6 space-y-6

---

## Phase 12: UserExplorer Component - Loading and Error States

### Task 12.1: Implement Loading State

- [ ] Inside user details conditional, check isLoading
- [ ] Return loading container:
  - [ ] text-center py-8
- [ ] Show Spinner (size="lg")
- [ ] Show loading text:
  - [ ] text-gray-500 mt-2
  - [ ] Text: "Loading user data..."

### Task 12.2: Implement Error State

- [ ] Check for error
- [ ] Return error container:
  - [ ] bg-red-50 border border-red-200 rounded-lg p-4
- [ ] Show error message:
  - [ ] text-red-800
  - [ ] Text: "Failed to load user data. Please try again."

### Task 12.3: Implement User Not Found State

- [ ] Check if !userData (after loading and no error)
- [ ] Return not found container:
  - [ ] text-center py-8 text-gray-500
- [ ] Show message: "User not found"

---

## Phase 13: UserExplorer Component - User Info Display

### Task 13.1: Implement User Info Header

- [ ] Check if userData exists
- [ ] Create header container:
  - [ ] border-b border-gray-200 pb-4
- [ ] Add flex container (justify-between items-center)
- [ ] Add left side: user ID
  - [ ] h3: text-lg font-medium text-gray-900
  - [ ] Show userData.user_id
- [ ] Add right side: clear button
  - [ ] onClick={() => setSelectedUserId(null)}
  - [ ] text-sm text-gray-500 hover:text-gray-700
  - [ ] Text: "Clear"

### Task 13.2: Implement Persona Info Section

- [ ] Create container: mt-2 flex items-center gap-4
- [ ] Add Primary Persona:
  - [ ] text-sm text-gray-600
  - [ ] Label: "Primary Persona: "
  - [ ] Badge with getPersonaColor
  - [ ] formatPersonaName for display
- [ ] Add Secondary Persona (conditional):
  - [ ] Only if userData.persona_30d.secondary exists
  - [ ] Same structure as primary
- [ ] Add Match Strength:
  - [ ] Label: "Match Strength: "
  - [ ] Value: font-semibold text-gray-900
  - [ ] Format: (match_strength \* 100).toFixed(0) + "%"
- [ ] Add Window info:
  - [ ] Label: "Window: "
  - [ ] Value: "30 days"

---

## Phase 14: UserExplorer Component - Signals Grid

### Task 14.1: Implement Signals Section Header

- [ ] Create container div
- [ ] Add h4 title:
  - [ ] text-sm font-medium text-gray-900 mb-3
  - [ ] Text: "Behavioral Signals"

### Task 14.2: Implement Signals Grid Layout

- [ ] Create grid container:
  - [ ] grid grid-cols-2 gap-4

### Task 14.3: Add Credit Utilization Card

- [ ] Render SignalCard component
  - [ ] title="Credit Utilization"
  - [ ] data={userData.signals.credit}
  - [ ] type="credit"

### Task 14.4: Add Subscriptions Card

- [ ] Render SignalCard component
  - [ ] title="Subscriptions"
  - [ ] data={userData.signals.subscriptions}
  - [ ] type="subscriptions"

### Task 14.5: Add Savings Card

- [ ] Render SignalCard component
  - [ ] title="Savings"
  - [ ] data={userData.signals.savings}
  - [ ] type="savings"

### Task 14.6: Add Income Stability Card

- [ ] Render SignalCard component
  - [ ] title="Income Stability"
  - [ ] data={userData.signals.income}
  - [ ] type="income"

---

## Phase 15: UserExplorer Component - Persona History

### Task 15.1: Implement Persona History Section

- [ ] Create section container:
  - [ ] border-t border-gray-200 pt-6

### Task 15.2: Add Section Header

- [ ] Add h4 title:
  - [ ] text-sm font-medium text-gray-900 mb-4
  - [ ] Text: "Persona History (180 days)"

### Task 15.3: Render PersonaTimeline

- [ ] Render PersonaTimeline component
  - [ ] Pass userId={selectedUserId}

### Task 15.4: Export UserExplorer

- [ ] Export UserExplorer component

---

## Phase 16: Integration & Testing

### Task 16.1: Create Index File for UserExplorer

- [ ] Create `/components/UserExplorer/index.ts`
- [ ] Export UserExplorer component
- [ ] Export UserSearch component (optional)
- [ ] Export SignalCard component (optional)
- [ ] Export PersonaTimeline component (optional)

### Task 16.2: Add UserExplorer to Main Dashboard

- [ ] Open `/pages/index.tsx` or create user page
- [ ] Import UserExplorer component
- [ ] Add to layout (could be in a tab or separate page)
- [ ] Verify it renders

### Task 16.3: Test with Mock Data

- [ ] Create mock user signals data
  - [ ] Include all signal types
  - [ ] Vary values for different scenarios
- [ ] Create mock persona history data
- [ ] Test UserExplorer with mock data
- [ ] Verify all components render

### Task 16.4: Test UserSearch Flow

- [ ] Enter a user ID in search
- [ ] Press Enter
- [ ] Verify loading state shows
- [ ] Verify user data loads (or mock data displays)
- [ ] Test Search button click
- [ ] Test with invalid user ID
- [ ] Test with empty input

### Task 16.5: Test Signal Cards

- [ ] Verify all four signal cards display
- [ ] Check Credit card:
  - [ ] Utilization percentage shows
  - [ ] Color coding works (red/yellow/green)
  - [ ] Credit amounts formatted correctly
  - [ ] Interest charges indicator shows
- [ ] Check Subscriptions card:
  - [ ] Merchant count shows
  - [ ] Monthly spend formatted
  - [ ] Percentage displays
  - [ ] Top subscriptions list shows (if data exists)
- [ ] Check Savings card:
  - [ ] Balance formatted correctly
  - [ ] Growth rate shows with +/- and color
  - [ ] Inflow formatted
  - [ ] Emergency fund shows with color coding
- [ ] Check Income card:
  - [ ] Income type capitalized
  - [ ] Payment frequency capitalized
  - [ ] Pay gap days shows
  - [ ] Variability with color coding
  - [ ] Cash flow buffer with color coding

### Task 16.6: Test PersonaTimeline

- [ ] Verify timeline displays
- [ ] Check current badge on first item
- [ ] Verify dates formatted correctly
- [ ] Verify personas formatted (uppercase, spaces)
- [ ] Verify match strength percentages
- [ ] Test with empty history
- [ ] Test loading state
- [ ] Test error state

### Task 16.7: Test Clear Functionality

- [ ] Load a user
- [ ] Click Clear button
- [ ] Verify view resets to search
- [ ] Verify no data displayed

### Task 16.8: Test Loading and Error States

- [ ] Test initial loading state
  - [ ] Verify spinner shows
  - [ ] Verify "Loading user data..." message
- [ ] Test error state
  - [ ] Simulate API error
  - [ ] Verify error message displays
  - [ ] Verify red error styling
- [ ] Test user not found state
  - [ ] Search for non-existent user
  - [ ] Verify "User not found" message

---

## Phase 17: API Integration

### Task 17.1: Verify fetchUserSignals Function

- [ ] Open `/lib/api.ts`
- [ ] Verify fetchUserSignals function exists
- [ ] If not, implement it:
  - [ ] Accept userId and optional windowType parameters
  - [ ] Build URL with query params
  - [ ] Call apiRequest with proper endpoint
  - [ ] Return typed UserSignals response

### Task 17.2: Test fetchUserSignals

- [ ] Test with valid user ID
- [ ] Test with invalid user ID
- [ ] Test with different windowType values
- [ ] Verify error handling
- [ ] Check response parsing

### Task 17.3: Test fetchPersonaHistory

- [ ] Test with valid user ID
- [ ] Test with invalid user ID
- [ ] Verify response format matches PersonaHistoryEntry[]
- [ ] Test error handling

### Task 17.4: Handle API Error Cases

- [ ] Test 404 Not Found
  - [ ] Show "User not found" message
- [ ] Test 500 Server Error
  - [ ] Show generic error message
- [ ] Test network timeout
  - [ ] Show timeout message
- [ ] Test network offline
  - [ ] Show offline indicator

### Task 17.5: Test End-to-End with Real API

- [ ] If API available:
  - [ ] Search for real user
  - [ ] Verify all data loads
  - [ ] Check signal accuracy
  - [ ] Check persona history accuracy
- [ ] If API not available:
  - [ ] Document API requirements
  - [ ] Use mock data for development

---

## Phase 18: Enhancements & Polish

### Task 18.1: Add Copy User ID Feature

- [ ] Add copy icon/button next to user ID
- [ ] Implement copy to clipboard functionality
- [ ] Show toast notification on copy
- [ ] Test copy functionality

### Task 18.2: Add Window Type Selector

- [ ] Add dropdown for window type selection
  - [ ] Options: 30d, 60d, 90d, 180d
- [ ] Update useUserSignals to accept windowType
- [ ] Refetch data when window type changes
- [ ] Test window type switching

### Task 18.3: Add Signal Health Indicators

- [ ] Import getSignalHealth function
- [ ] Add health indicator badges to signal cards
- [ ] Show "Good", "Warning", or "Critical" status
- [ ] Color code indicators (green/yellow/red)
- [ ] Test with various signal values

### Task 18.4: Add Tooltips for Metrics

- [ ] Add tooltip component or use Radix Tooltip
- [ ] Add tooltips to explain metrics:
  - [ ] Credit utilization explanation
  - [ ] Emergency fund recommendation
  - [ ] Income variability meaning
  - [ ] etc.
- [ ] Test tooltips on hover

### Task 18.5: Add Recent Searches

- [ ] Add localStorage for recent searches
- [ ] Show recent user IDs as quick links
- [ ] Limit to last 5 searches
- [ ] Add clear recent searches button
- [ ] Test recent searches functionality

### Task 18.6: Add Export User Data

- [ ] Add export button
- [ ] Export user data as JSON
- [ ] Or export as CSV
- [ ] Test export functionality

---

## Phase 19: Responsive Design

### Task 19.1: Test Mobile Layout

- [ ] Test at 320px width
- [ ] Test at 640px width
- [ ] Check if signals grid stacks on mobile
- [ ] Verify search input is full width
- [ ] Check persona timeline on mobile

### Task 19.2: Adjust Grid for Smaller Screens

- [ ] Update signals grid for responsive:
  - [ ] grid-cols-1 on mobile
  - [ ] grid-cols-2 on tablet+
- [ ] Test grid stacking

### Task 19.3: Adjust Persona Info Layout

- [ ] Stack persona info on small screens
- [ ] Use flex-col on mobile
- [ ] Use flex-row on larger screens
- [ ] Test layout changes

### Task 19.4: Test All Breakpoints

- [ ] Test mobile (320-640px)
- [ ] Test tablet (640-1024px)
- [ ] Test desktop (1024px+)
- [ ] Verify no horizontal scroll
- [ ] Verify all text readable

---

## Phase 20: Accessibility

### Task 20.1: Add ARIA Labels

- [ ] Add aria-label to search input
- [ ] Add aria-label to search button
- [ ] Add aria-label to clear button
- [ ] Add aria-live for loading states
- [ ] Add role="status" for status messages

### Task 20.2: Test Keyboard Navigation

- [ ] Test Tab key through all interactive elements
- [ ] Verify focus indicators visible
- [ ] Test Enter key submits search
- [ ] Test Escape key clears search (optional)

### Task 20.3: Test Screen Reader

- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Verify all labels are read
- [ ] Verify status changes announced
- [ ] Verify data values readable

### Task 20.4: Add Focus Management

- [ ] Focus search input on mount (optional)
- [ ] Focus first signal card after data loads (optional)
- [ ] Manage focus for better UX

---

## Phase 21: Documentation

### Task 21.1: Document Component APIs

- [ ] Create `/components/UserExplorer/README.md`
- [ ] Document UserExplorer component:
  - [ ] Purpose and usage
  - [ ] State management
  - [ ] API integration
- [ ] Document UserSearch component:
  - [ ] Props interface
  - [ ] Usage example
- [ ] Document SignalCard component:
  - [ ] Props interface
  - [ ] All signal types
  - [ ] Usage examples
- [ ] Document PersonaTimeline component:
  - [ ] Props interface
  - [ ] Usage example

### Task 21.2: Add Usage Examples

- [ ] Add example of UserExplorer usage
- [ ] Add example of standalone SignalCard usage
- [ ] Add example of custom signal rendering
- [ ] Add example with mock data

### Task 21.3: Document Signal Metrics

- [ ] Create glossary of signal metrics:
  - [ ] Credit utilization meaning
  - [ ] Emergency fund calculation
  - [ ] Income variability definition
  - [ ] Cash flow buffer calculation
  - [ ] etc.
- [ ] Add thresholds for health indicators

### Task 21.4: Add Code Comments

- [ ] Add comments to complex logic
- [ ] Document color coding thresholds
- [ ] Document signal health calculations
- [ ] Add TODOs for future enhancements

---

## Phase 22: Performance Optimization

### Task 22.1: Memoize Signal Cards

- [ ] Use React.memo for SignalCard component
- [ ] Only re-render if data changes
- [ ] Test performance improvement

### Task 22.2: Optimize PersonaTimeline

- [ ] Use React.memo for timeline items
- [ ] Only re-render changed items
- [ ] Test with large history datasets

### Task 22.3: Debounce Search Input (Optional)

- [ ] Add debounce to search input
- [ ] Only search after user stops typing
- [ ] Use lodash debounce or custom hook
- [ ] Test debouncing

### Task 22.4: Test Performance

- [ ] Test with large datasets
- [ ] Check rendering speed
- [ ] Use React DevTools Profiler
- [ ] Optimize any bottlenecks

---

## Acceptance Criteria Checklist

### Must Have

- [ ] **User search input functional**
  - [ ] Can enter user ID
  - [ ] Submit on Enter key
  - [ ] Submit on button click
- [ ] **Can fetch and display user signals**
  - [ ] API call triggered
  - [ ] Data populates correctly
  - [ ] All signals displayed
- [ ] **All four signal cards render correctly**
  - [ ] Credit card displays
  - [ ] Subscriptions card displays
  - [ ] Savings card displays
  - [ ] Income card displays
- [ ] **Credit utilization shows with color coding**
  - [ ] Red for high (>=50%)
  - [ ] Yellow for medium (30-49%)
  - [ ] Green for low (<30%)
- [ ] **Subscription merchants list displays**
  - [ ] Top 3 merchants shown
  - [ ] Name and amount formatted
  - [ ] Only shows if data exists
- [ ] **Savings growth rate shows with indicator**
  - [ ] Positive: green with + prefix
  - [ ] Negative: red, no prefix
  - [ ] Percentage formatted
- [ ] **Income stability metrics visible**
  - [ ] Income type shown
  - [ ] Payment frequency shown
  - [ ] Variability with color coding
  - [ ] Cash flow buffer with color coding
- [ ] **Persona badge displays with correct color**
  - [ ] Primary persona badge
  - [ ] Correct color for each persona type
  - [ ] Proper formatting (uppercase, spaces)
- [ ] **Persona history timeline shows past assignments**
  - [ ] Timeline displays entries
  - [ ] Dates formatted correctly
  - [ ] Current badge on first item
- [ ] **Loading states for async data**
  - [ ] Spinner shows while loading
  - [ ] Loading message displayed
- [ ] **Error states for failed requests**
  - [ ] Error message displays
  - [ ] Proper styling (red background)
- [ ] **Clear button to reset search**
  - [ ] Button visible after search
  - [ ] Resets view on click
  - [ ] Clears selected user

### Should Have

- [ ] **Match strength percentage displayed**
  - [ ] Percentage shown
  - [ ] Properly formatted
- [ ] **Secondary persona shown if exists**
  - [ ] Conditional rendering
  - [ ] Proper badge styling
- [ ] **Signal health indicators**
  - [ ] Good/Warning/Critical badges
  - [ ] Color coded appropriately
- [ ] **Smooth transitions between searches**
  - [ ] Fade in/out animations
  - [ ] No jarring state changes
- [ ] **Copy user ID button**
  - [ ] Copy functionality works
  - [ ] Toast notification shows

---

## Testing Checklist

### Functional Tests

- [ ] **User search submits on Enter key**
  - [ ] Type user ID
  - [ ] Press Enter
  - [ ] Verify submission
- [ ] **Valid user ID loads signal data**
  - [ ] Search valid user
  - [ ] Verify data loads
  - [ ] All signals populated
- [ ] **Invalid user ID shows error message**
  - [ ] Search invalid user
  - [ ] Verify error displays
  - [ ] Appropriate message shown
- [ ] **All signal cards populate with data**
  - [ ] Credit data displays
  - [ ] Subscriptions data displays
  - [ ] Savings data displays
  - [ ] Income data displays
- [ ] **Credit utilization color changes based on value**
  - [ ] Test with <30% value (green)
  - [ ] Test with 30-49% value (yellow)
  - [ ] Test with >=50% value (red)
- [ ] **Subscription merchants list renders**
  - [ ] Verify list shows
  - [ ] Top 3 displayed
  - [ ] Proper formatting
- [ ] **Savings metrics display correctly**
  - [ ] Balance formatted
  - [ ] Growth rate with +/-
  - [ ] Emergency fund color coded
- [ ] **Income type and frequency shown**
  - [ ] Income type capitalized
  - [ ] Payment frequency capitalized
- [ ] **Persona timeline loads historical data**
  - [ ] Timeline displays
  - [ ] Multiple entries shown
  - [ ] Dates in order
- [ ] **Timeline shows current persona badge**
  - [ ] First item has "Current" badge
  - [ ] Badge styled correctly
- [ ] **Loading spinner displays during fetch**
  - [ ] Spinner visible
  - [ ] Loading message shows
- [ ] **Error message shows on API failure**
  - [ ] Simulate API error
  - [ ] Verify error message
  - [ ] Red styling applied
- [ ] **Clear button resets the view**
  - [ ] Click clear
  - [ ] View resets
  - [ ] No data shown

### Integration Tests

- [ ] Test full workflow: search → load → view signals → view timeline
- [ ] Test error recovery: fail → retry → success
- [ ] Test multiple searches in sequence

### Edge Case Tests

- [ ] Test with user having no subscriptions
- [ ] Test with user having no persona history
- [ ] Test with negative savings growth
- [ ] Test with very high credit utilization (>100%)
- [ ] Test with empty merchants array
- [ ] Test with missing optional fields

---

## Troubleshooting Guide

### Issue: User data not loading

**Diagnosis:**

- Check API endpoint accessibility
- Check userId being passed to hook
- Check browser Network tab
- Check for CORS errors

**Solution:**

- Verify API_URL in environment
- Test endpoint with curl/Postman
- Check API accepts userId parameter
- Console.log userId before fetch

### Issue: Signal cards not displaying correctly

**Diagnosis:**

- Check data structure matches types
- Check if data is undefined
- Check for TypeScript errors

**Solution:**

- Verify API response matches UserSignals type
- Add optional chaining for nested properties
- Add default values for missing data
- Console.log data to inspect structure

### Issue: Color coding not working

**Diagnosis:**

- Check threshold values
- Check conditional logic
- Check Tailwind classes applying

**Solution:**

- Verify threshold values in conditional
- Use browser DevTools to check classes
- Ensure Tailwind classes not purged
- Test with various data values

### Issue: Persona timeline not showing

**Diagnosis:**

- Check API endpoint for history
- Check if userId passed correctly
- Check response format

**Solution:**

- Verify endpoint exists and returns data
- Console.log response data
- Check PersonaHistoryEntry type matches response
- Add error handling to hook

### Issue: Search not triggering

**Diagnosis:**

- Check form onSubmit handler
- Check if preventDefault called
- Check if onUserSelect called

**Solution:**

- Verify handleSearch function
- Add console.logs to debug
- Check if searchInput has value
- Verify onUserSelect prop passed correctly

### Issue: Clear button not working

**Diagnosis:**

- Check onClick handler
- Check if setSelectedUserId called
- Check state update

**Solution:**

- Verify onClick={() => setSelectedUserId(null)}
- Check React DevTools for state change
- Ensure component re-renders on state change

---

## Next Steps After Completion

### Immediate Next Actions

1. **Integrate with Review Queue**: Link user IDs from recommendations to User Explorer
2. **Add to Decision Traces**: Show user signals in trace view
3. **Create dedicated user page**: Route like `/user/:userId`
4. **Add user notes**: Allow operators to add notes about users

### Integration Points

- Link from RecommendationCard user_id to UserExplorer
- Show user signals in DecisionTraces component
- Add user context to AlertPanel for flagged recommendations

### Future Enhancements

- [ ] Add transaction history view
- [ ] Add spending category breakdown
- [ ] Add cash flow visualization chart
- [ ] Add persona prediction confidence intervals
- [ ] Add alert thresholds customization
- [ ] Add comparison view (multiple users side-by-side)
- [ ] Add export user report functionality
- [ ] Add user segmentation/tagging
- [ ] Add notes and annotations on user profile
- [ ] Add audit log of operator views per user

---

## Resources

- [SWR Documentation](https://swr.vercel.app/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Utilities](https://tailwindcss.com/docs/utility-first)
- [Radix UI Primitives](https://www.radix-ui.com/)

---

## Notes & Decisions

### Decision Log

- **Date**: [Date] - **Decision**: [Decision made] - **Rationale**: [Why]

### Design Rationale

- **Color coding for urgency**: Red/yellow/green provides instant visual feedback on signal health
- **Grid layout for signals**: Easy comparison across different signal categories
- **Timeline for persona history**: Shows evolution over time, helps understand context
- **Conditional secondary persona**: Not all users have strong secondary personas
- **Top 3 subscriptions only**: Prevents overwhelming display, shows most relevant data

### Known Limitations

- No real-time updates (would need WebSocket)
- Window type fixed to 30d (could add selector)
- No comparison between users
- No detailed transaction view
- No charting/visualization of trends

### API Requirements for Backend Team

- GET /api/operator/users/{userId}/signals endpoint
  - Accept optional windowType parameter
  - Return UserSignals object
- GET /api/operator/users/{userId}/persona-history endpoint
  - Return array of PersonaHistoryEntry
  - Cover last 180 days
- CORS must allow frontend origin
- Consider caching for frequently accessed users

---

**Last Updated**: November 4, 2025  
**Progress**: ✅ 100% Complete - All Core Features Implemented  
**Actual Completion Time**: ~2 hours  
**Dependencies**: Shard 1 (Foundation), Shard 2 (UI Framework) ✅ Complete  
**Blocks**: None (independent feature, integrates with Shards 3, 5, 6)

---

## ✅ Implementation Summary (November 4, 2025)

### Completed Components

- ✅ **useUserSignals Hook** - Custom SWR hook for fetching user signals
- ✅ **usePersonaHistory Hook** - Custom SWR hook for persona history
- ✅ **UserSearch Component** - Search input with validation
- ✅ **SignalCard Component** - Displays 4 signal types (credit, subscriptions, savings, income)
- ✅ **PersonaTimeline Component** - Historical persona view with timeline
- ✅ **UserExplorer Component** - Main component integrating all features
- ✅ **Tabbed Navigation** - Integrated into main dashboard

### Completed Features

- ✅ User search by ID with real-time validation
- ✅ All 4 signal cards with color-coded indicators
- ✅ Credit utilization (red/yellow/green thresholds)
- ✅ Subscription list with top 3 merchants
- ✅ Savings growth rate with +/- indicators
- ✅ Income stability metrics
- ✅ Persona history timeline (180 days)
- ✅ Current persona badge
- ✅ Loading and error states
- ✅ Clear/reset functionality
- ✅ Responsive grid layout

### Infrastructure Updates

- ✅ **Mock Data**: Added 3 complete user profiles with history
- ✅ **API Functions**: fetchUserSignals, fetchPersonaHistory
- ✅ **Utility Functions**: formatCurrency, formatPercentage, getSignalHealth
- ✅ **Type Definitions**: All types already existed
- ✅ **Zero Linting Errors**: All TypeScript and ESLint checks passed

### Test Users Available

- **user_123**: High Utilization (78% credit, negative savings)
- **user_456**: Subscription Heavy (15 merchants, $395/month)
- **user_789**: Savings Builder (4.2 months emergency fund)

### Ready for Testing

Visit `http://localhost:3000` → Click "User Explorer" tab → Search any user ID above

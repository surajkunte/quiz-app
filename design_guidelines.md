# Design Guidelines: Online Quiz Application

## Design Approach
**Selected Approach:** Design System (Material Design + Quiz Platform Inspiration)

**Justification:** This is a utility-focused application prioritizing efficiency, clarity, and ease of use. Drawing inspiration from established quiz platforms (Kahoot, Quizizz, Google Forms) while following Material Design principles for consistency and accessibility.

**Key Design Principles:**
- Clarity over decoration - questions and options must be instantly readable
- Progressive disclosure - show only relevant information at each step
- Immediate feedback - clear visual responses to user actions
- Accessibility-first - high contrast, large touch targets, keyboard navigation

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 219 91% 60% (Vibrant Blue)
- Primary Hover: 219 91% 50%
- Background: 0 0% 100% (White)
- Surface: 220 13% 97% (Light Gray)
- Text Primary: 220 13% 18%
- Text Secondary: 220 9% 46%
- Success: 142 76% 36% (Green for correct answers)
- Error: 0 72% 51% (Red for incorrect answers)
- Border: 220 13% 91%

**Dark Mode:**
- Primary: 219 91% 60%
- Primary Hover: 219 91% 70%
- Background: 220 13% 10%
- Surface: 220 13% 15%
- Text Primary: 220 13% 91%
- Text Secondary: 220 9% 64%
- Success: 142 76% 46%
- Error: 0 72% 61%
- Border: 220 13% 23%

### B. Typography

**Font Families:**
- Primary: 'Inter', system-ui, sans-serif (headings, UI)
- Secondary: 'Inter', system-ui, sans-serif (body text)

**Type Scale:**
- Hero Heading: text-4xl font-bold (quiz titles)
- Section Heading: text-2xl font-semibold (question numbers)
- Question Text: text-xl font-medium (actual questions)
- Body Large: text-base (options, descriptions)
- Body Small: text-sm (metadata, hints)
- Caption: text-xs (timestamps, word counts)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Consistent spacing: p-4, p-6, p-8 for cards/containers
- Gap between elements: gap-4, gap-6, gap-8
- Section padding: py-8, py-12, py-16

**Container Widths:**
- Quiz Taking Interface: max-w-3xl mx-auto
- Admin/Management: max-w-6xl mx-auto
- Full-width sections: w-full with inner constraints

---

## Component Library

### D. Core UI Components

**1. Navigation Bar**
- Fixed top navigation with app logo/title on left
- User info/admin toggle on right
- Height: h-16
- Background: bg-white dark:bg-surface with bottom border
- Shadow: shadow-sm

**2. Quiz Card (List View)**
- White card with rounded corners: rounded-lg
- Padding: p-6
- Shadow: shadow-md hover:shadow-lg transition
- Content: Quiz title (text-xl font-semibold), question count, created date
- Action button: "Start Quiz" or "Edit" button top-right

**3. Question Display Card**
- Large centered card: max-w-3xl
- Padding: p-8
- Question number badge: Top-left with bg-primary text-white rounded-full px-4 py-1
- Question text: text-xl mb-6
- Progress indicator: Top of card showing "Question 3 of 10"

**4. Answer Options**
- Radio/Checkbox list for single/multiple choice
- Each option: Full-width button-like card
- Height: min-h-16 with p-4
- Hover state: subtle border color change
- Selected state: border-2 border-primary bg-primary/5
- Spacing between options: gap-3

**5. Form Components**
- Input fields: h-12 with rounded-md borders
- Text areas: min-h-32 for question input
- Labels: text-sm font-medium mb-2
- Helper text: text-xs text-secondary below inputs
- Validation errors: text-xs text-error with icon

**6. Buttons**
- Primary: bg-primary text-white h-11 px-6 rounded-md font-medium
- Secondary: border border-primary text-primary h-11 px-6 rounded-md
- Danger: bg-error text-white (for delete actions)
- Icon buttons: w-10 h-10 rounded-md (for edit, delete in lists)

**7. Score Display**
- Large centered card post-quiz
- Circular progress indicator showing score percentage
- Size: w-48 h-48 with stroke-width of 8
- Score text: text-5xl font-bold center
- Breakdown: List of correct/incorrect with green/red indicators

**8. Modals/Dialogs**
- Overlay: bg-black/50 backdrop-blur-sm
- Dialog: max-w-lg bg-white dark:bg-surface rounded-lg p-6
- Header: text-xl font-semibold mb-4
- Actions: Flex justify-end gap-3

### E. Page-Specific Layouts

**Homepage/Quiz List**
- Hero section: py-16 text-center with heading and "Create Quiz" CTA
- Grid of quiz cards: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Empty state: Centered icon + text + CTA when no quizzes

**Quiz Taking Interface**
- Clean, distraction-free centered layout
- Question card with single question visible
- Navigation: "Previous" and "Next" buttons at bottom
- "Submit Quiz" button on final question
- Timer display (if implemented): top-right corner

**Quiz Creation/Edit**
- Two-column layout on desktop: Form on left (col-span-2), Preview on right (col-span-1)
- Mobile: Stacked single column
- Add Question: Large button with icon at bottom of question list
- Question cards: Draggable with handle, edit/delete icons

**Admin Dashboard**
- Statistics cards: grid grid-cols-1 md:grid-cols-3 gap-6
- Recent quizzes table: Responsive table with actions column
- Filters/search: Top bar with input and dropdowns

### F. Interaction States

**Loading States:**
- Skeleton screens for quiz lists: animate-pulse backgrounds
- Spinner for submit actions: Centered with "Submitting..." text

**Empty States:**
- Illustration or icon (use heroicons)
- Descriptive text: "No quizzes yet"
- Primary action CTA

**Success/Error States:**
- Toast notifications: Fixed top-right, slide-in animation
- Inline validation: Below form fields with icons
- Success page: After quiz submission with confetti effect (subtle)

---

## Animations

Use sparingly:
- Card hover: scale-[1.02] transition-transform
- Button press: active:scale-95
- Page transitions: fade-in opacity animation (200ms)
- Toast notifications: slide-in from right (300ms)
- Progress bars: smooth width transitions

---

## Accessibility

- Maintain WCAG AA contrast ratios (4.5:1 minimum)
- All interactive elements: min-height of 44px (touch targets)
- Keyboard navigation: Focus rings on all interactive elements
- ARIA labels for icon-only buttons
- Form validation with aria-invalid and aria-describedby
- Dark mode: Ensure all text maintains readability on dark backgrounds

---

## Images

**No hero images required** - this is a utility application focused on functionality. Icons from Heroicons for UI elements only.
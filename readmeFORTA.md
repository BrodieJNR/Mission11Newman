# Mission 12 - Bootstrap Features

## Two Bootstrap Features Used (Not Covered in Class Videos)

### 1. Bootstrap Card
**Location:** `frontend/src/components/BookList.tsx` (line 128)

A Bootstrap Card component is used to display the **Cart Summary** on the main book list page. It uses the following Bootstrap classes:
- `card` — the main card container
- `card-header` — styled header bar with a blue background (`bg-primary text-white`)
- `card-body` — the content area inside the card
- `card-text` — formats the text paragraphs inside the card

### 2. Bootstrap Badge
**Location:** `frontend/src/components/BookList.tsx` (lines 136 and 148)

Bootstrap Badges are used to display the **cart item count** as a small pill-shaped label. They appear:
- Inside the Cart Summary section next to "Items in cart"
- Inside the "View Cart" button when there are items in the cart

The `badge` class is combined with background color utilities (`bg-primary`, `bg-light`) to style the count indicators.

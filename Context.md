# Mission 13: CRUD Operations & Deployment - Context Guide

## Purpose
Detailed notes from all Phase 5 and Phase 6 instructional videos for the Water Project.
Use this file to verify implementation, debug issues, and guide development.

---

# PHASE 5: CRUD OPERATIONS IMPLEMENTATION

## Video 1: APIs (Phase 05-01)
**Topic:** Creating a centralized API folder and organizing API calls

### Key Concepts
- Create a centralized `API/` folder so API calls are reusable and not scattered across components
- Build a `booksApi.ts` (or `projectsApi.ts`) file for shared API functions

### Step-by-Step
1. Navigate to `src/` → create folder named `API`
2. Inside `API/`, create `booksApi.ts`
3. Define a response interface:
```typescript
interface FetchBooksResponse {
  books: Book[];
  totalBooks: number;
}
```
4. Build the fetch function with async/await:
```typescript
export const fetchBooks = (
  pageSize: number,
  pageNum: number,
  category: string
): Promise<FetchBooksResponse> => {
  // implementation
}
```
5. Wrap all API logic in try/catch:
```typescript
try {
  // API call
} catch (error) {
  console.error('Error fetching books:', error);
  throw error;
}
```

### Critical Patterns
- Use `await` with fetch calls
- Return `await response.json()`
- Check `if (!response.ok)` before processing
- Always export functions

---

## Video 2: Update Project List (Phase 05-02)
**Topic:** Refactoring the list component to use centralized API

### Key Changes
1. Add loading/error state variables:
```typescript
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState<boolean>(false);
```
2. Rename the inner function to `loadBooks` (distinct from `fetchBooks`):
```typescript
const loadBooks = async () => {
  try {
    setLoading(true);
    const data = await fetchBooks(pageSize, pageNum, category);
    setBooks(data.books);
  } catch (error) {
    setError((error as Error).message);
  } finally {
    setLoading(false);
  }
};
```
3. Add conditional rendering for loading/error states:
```typescript
if (loading) return <p>Loading...</p>;
if (error) return <p className="text-danger">Error: {error}</p>;
```
4. Fix infinite loop: calculate `totalPages` directly from response instead of storing in state:
```typescript
const totalPages = Math.ceil(data.totalBooks / pageSize);
```

---

## Video 3: Bugs (Phase 05-03)
**Topic:** Debugging CORS and API connection issues

### Common Issues

**CORS Policy Errors**
- Error: "Failed to fetch" or CORS blocked
- Fix: Update CORS settings in backend `Program.cs` and restart the server

**Port Conflicts**
```bash
# Windows
netstat -ano | findstr :5179
taskkill /PID [process_id] /F
```

**Testing API Endpoints**
- Test directly in browser: `https://localhost:7294/api/books?pageNum=1&pageSize=5`
- Check browser console (F12) for the root error in the chain

### Debug Process
1. Check if backend is running
2. Verify frontend can reach it
3. Inspect browser console errors
4. Test API endpoint directly in browser
5. Check CORS configuration
6. Restart both servers after any changes

---

## Video 4: Data Call (Phase 05-04)
**Topic:** Setting up an Admin page with data fetching

### Admin Page Structure
```typescript
const AdminBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const data = await fetchBooks(1000, 1, '');
        setBooks(data.books);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadBooks(); // Don't forget to actually call it!
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (...);
};

export default AdminBooks;
```

### Important
- Must actually **call** `loadBooks()` inside `useEffect` — forgetting this is a common mistake
- Empty dependency array `[]` = runs once on mount

---

## Video 5: Table (Phase 05-05)
**Topic:** Creating an admin data table

### Table Structure
```tsx
<table className="table table-striped table-bordered">
  <thead className="table-dark">
    <tr>
      <th>Title</th>
      <th>Author</th>
      <th>Price</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {books.map((book) => (
      <tr key={book.bookId}>
        <td>{book.title}</td>
        <td>{book.author}</td>
        <td>${book.price.toFixed(2)}</td>
        <td>
          <button className="btn btn-primary btn-sm" onClick={() => handleEdit(book)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book.bookId)}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### Best Practices
- Always use `key` prop on mapped elements (use the unique ID)
- Match header columns to data columns
- Blank `<th>` is fine for the Actions column

---

## Video 6: Components (Phase 05-06)
**Topic:** Creating a reusable Pagination component

### Why
- Reuse the same pagination across multiple pages
- Single source of truth for pagination logic

### Props Interface
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}
```

### Component
```typescript
const Pagination = ({
  currentPage, totalPages, pageSize, onPageChange, onPageSizeChange
}: PaginationProps) => {
  return (
    <div>
      <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Previous</button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button key={i + 1} onClick={() => onPageChange(i + 1)}>{i + 1}</button>
      ))}
      <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button>
      <select value={pageSize} onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
      </select>
    </div>
  );
};

export default Pagination;
```

---

## Video 7: Pagination (Phase 05-07)
**Topic:** Fixing pagination placement

### Common Mistake
Placing `<Pagination />` **inside** the `.map()` renders it once per row.

```typescript
// WRONG - inside map
{books.map((book) => (
  <tr key={book.bookId}>...</tr>
  <Pagination /> // DON'T DO THIS
))}

// CORRECT - after map, outside the table
{books.map((book) => (
  <tr key={book.bookId}>...</tr>
))}
<Pagination ... /> // Place here
```

---

## Video 8: Use Component (Phase 05-08)
**Topic:** Adding pagination to the Admin page

### Steps
1. Add pagination state to Admin page:
```typescript
const [pageNum, setPageNum] = useState<number>(1);
const [pageSize, setPageSize] = useState<number>(10);
const [totalPages, setTotalPages] = useState<number>(0);
```
2. Update fetch call to use state variables (not hardcoded values)
3. Calculate total pages from response:
```typescript
setTotalPages(Math.ceil(data.totalBooks / pageSize));
```
4. Add `[pageSize, pageNum]` to `useEffect` dependency array
5. Render the Pagination component:
```tsx
<Pagination
  currentPage={pageNum}
  totalPages={totalPages}
  pageSize={pageSize}
  onPageChange={setPageNum}
  onPageSizeChange={(newSize) => { setPageSize(newSize); setPageNum(1); }}
/>
```

---

## Video 9: Form (Phase 05-09)
**Topic:** Creating the Add New Book form component

### Props Interface
```typescript
interface NewBookFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}
```

### Form State
```typescript
const [formData, setFormData] = useState<Omit<Book, 'bookId'>>({
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
});
```

### Form Structure
```tsx
<form onSubmit={handleSubmit}>
  <label>Title: <input type="text" name="title" value={formData.title} onChange={handleChange} /></label>
  <label>Author: <input type="text" name="author" value={formData.author} onChange={handleChange} /></label>
  <label>Price: <input type="number" name="price" value={formData.price} onChange={handleChange} /></label>
  <button type="submit">Add Book</button>
  <button type="button" onClick={onCancel}>Cancel</button>
</form>
```

### Key Points
- Nest `<input>` inside `<label>` for accessibility
- Use `type="number"` for numeric fields
- `name` attribute must **exactly** match the state property name
- Cancel button needs `type="button"` to avoid submitting the form

---

## Video 10: API Actions (Phase 05-10)
**Topic:** Creating backend CRUD endpoints

### Backend Controller Methods

**POST — Add**
```csharp
[HttpPost]
public IActionResult AddBook([FromBody] Book newBook)
{
    _context.Books.Add(newBook);
    _context.SaveChanges();
    return Ok(newBook);
}
```

**PUT — Update**
```csharp
[HttpPut("{id}")]
public IActionResult UpdateBook(int id, [FromBody] Book updatedBook)
{
    var book = _context.Books.Find(id);
    if (book == null) return NotFound();

    book.Title = updatedBook.Title;
    book.Author = updatedBook.Author;
    // ... update all fields

    _context.SaveChanges();
    return Ok(book);
}
```

**DELETE — Remove**
```csharp
[HttpDelete("{id}")]
public IActionResult DeleteBook(int id)
{
    var book = _context.Books.Find(id);
    if (book == null) return NotFound("Book not found");

    _context.Books.Remove(book);
    _context.SaveChanges();
    return NoContent();
}
```

### Important Notes
- `[FromBody]` tells .NET to parse JSON from the request body
- Always check for `null` when finding by ID
- Return correct status codes: `Ok`, `NotFound`, `NoContent`
- **Never forget `_context.SaveChanges()`** — changes won't persist without it

---

## Video 11: React API (Phase 05-11)
**Topic:** Creating frontend API functions for CRUD

### Add Book
```typescript
export const addBook = async (newBook: Omit<Book, 'bookId'>): Promise<Book> => {
  try {
    const response = await fetch(`${API_URL}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook),
    });
    if (!response.ok) throw new Error('Failed to add book');
    return await response.json();
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};
```

### Update Book
```typescript
export const updateBook = async (id: number, updatedBook: Book): Promise<Book> => {
  try {
    const response = await fetch(`${API_URL}/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBook),
    });
    if (!response.ok) throw new Error('Failed to update book');
    return await response.json();
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};
```

### Delete Book
```typescript
export const deleteBook = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/books/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete book');
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};
```

### Key Differences
- POST and PUT need `headers` with `Content-Type: application/json`
- POST and PUT need a `body` with `JSON.stringify(data)`
- DELETE returns `void` — no body needed
- Always include try/catch

---

## Video 12: Data Binding (Phase 05-12)
**Topic:** Binding form inputs to state

### handleChange
```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};
```

### handleSubmit
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await addBook(formData);
  onSuccess();
};
```

### Important Patterns
- Spread operator `...formData` preserves unchanged fields
- Computed property `[e.target.name]` sets the right field dynamically
- `e.preventDefault()` stops the browser from refreshing the page
- The `name` attribute on each input must exactly match the state property name

---

## Video 13: Show Form (Phase 05-13)
**Topic:** Displaying and hiding the Add form

### Show/Hide State
```typescript
const [showForm, setShowForm] = useState<boolean>(false);
```

### Conditional Rendering
```tsx
{showForm ? (
  <NewBookForm
    onSuccess={() => {
      setShowForm(false);
      loadBooks(); // refresh the list
    }}
    onCancel={() => setShowForm(false)}
  />
) : (
  <button className="btn btn-success mb-3" onClick={() => setShowForm(true)}>
    + Add New Book
  </button>
)}
```

### Flow
1. `showForm` starts as `false` → button is visible
2. Click button → `showForm = true` → form appears
3. On success: hide form, refresh list
4. On cancel: just hide form

---

## Video 14: CORS (Phase 05-14)
**Topic:** Fixing CORS for POST/PUT/DELETE

### Problem
GET requests work but POST/PUT/DELETE are blocked by CORS.

### Solution — Update `Program.cs`

**Development (allow any origin):**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
app.UseCors("AllowReactApp");
```

**Production (specific origin):**
```csharp
policy.WithOrigins("http://localhost:5173", "https://yourapp.azurestaticapps.net")
      .AllowAnyMethod()
      .AllowAnyHeader();
```

### Critical
- **Must fully restart** the backend server after CORS changes
- `dotnet watch run` hot reload does NOT pick up CORS changes — stop and restart

---

## Video 15: Add — Testing (Phase 05-15)
**Topic:** Testing and debugging Add functionality

### Testing Process
1. Click "Add New Book" → form appears with blank fields
2. Fill out all fields
3. Submit → form disappears, new book appears in table

### Common Issues
| Issue | Cause | Fix |
|---|---|---|
| 404 on submit | Endpoint path mismatch | Verify frontend URL matches backend route attribute exactly (case-sensitive) |
| Form not closing | `onSuccess` not called | Check `handleSubmit` calls `onSuccess()` |
| Book not appearing | List not refreshed | Call `loadBooks()` inside `onSuccess` |

### Debugging
- Open DevTools → Network tab
- Watch for the API call when submitting
- Check request payload and response body
- Look for errors in Console tab

---

## Video 16: Update — Part 1 (Phase 05-16)
**Topic:** Creating the Edit form component

### Key Differences from Add Form
- Receives existing `book` as a prop
- Initializes `formData` by spreading the existing book
- Calls `updateBook` instead of `addBook`
- Submit button says "Save Changes" instead of "Add Book"

### Props Interface
```typescript
interface EditBookFormProps {
  book: Book;
  onSuccess: () => void;
  onCancel: () => void;
}
```

### Initialize with Existing Data
```typescript
const EditBookForm = ({ book, onSuccess, onCancel }: EditBookFormProps) => {
  const [formData, setFormData] = useState<Book>({ ...book });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBook(formData.bookId, formData);
    onSuccess();
  };
  // ...
};
```

---

## Video 17: Update — Part 2 (Phase 05-17)
**Topic:** Integrating edit into the Admin page

### Editing State
```typescript
const [editingBook, setEditingBook] = useState<Book | null>(null);
```

### Conditional Rendering
```tsx
{editingBook && (
  <EditBookForm
    book={editingBook}
    onSuccess={() => {
      setEditingBook(null);
      loadBooks();
    }}
    onCancel={() => setEditingBook(null)}
  />
)}
```

### Edit Button
```tsx
<button className="btn btn-primary btn-sm" onClick={() => setEditingBook(book)}>
  Edit
</button>
```

### Flow
1. Click Edit → `setEditingBook(book)` stores that book
2. Edit form appears pre-filled with book data
3. User modifies fields, clicks submit
4. `updateBook` API call updates backend
5. On success: clear editing state, refresh list

---

## Video 18: Delete (Phase 05-18)
**Topic:** Implementing delete with confirmation

### handleDelete
```typescript
const handleDelete = async (id: number) => {
  const confirmed = window.confirm('Are you sure you want to delete this book?');
  if (!confirmed) return;

  try {
    await deleteBook(id);
    setBooks(books.filter((b) => b.bookId !== id)); // optimistic update
  } catch (error) {
    alert('Failed to delete. Please try again.');
  }
};
```

### Delete Button
```tsx
<button className="btn btn-danger btn-sm" onClick={() => handleDelete(book.bookId)}>
  Delete
</button>
```

### Key Features
1. **Confirmation dialog** — `window.confirm()` prevents accidental deletes
2. **Optimistic UI** — filter the book out of local state immediately (no need to refetch)
3. **Error handling** — alert the user if something goes wrong

---

## Video 19: Wrap-Up (Phase 05-19)
**Topic:** Complete CRUD data flow summary

### Full Data Flow

**CREATE:**
User clicks Add → form appears → submits → POST `/api/books` → backend adds to DB → `SaveChanges()` → frontend refreshes list

**READ:**
Component mounts → `useEffect` → `loadBooks()` → GET `/api/books` → backend queries DB with pagination → returns books + total → React re-renders table

**UPDATE:**
User clicks Edit → form pre-filled → submits → PUT `/api/books/{id}` → backend finds by ID → updates fields → `SaveChanges()` → frontend refreshes list

**DELETE:**
User clicks Delete → confirm dialog → DELETE `/api/books/{id}` → backend finds by ID → removes → `SaveChanges()` → frontend filters from local state

### Common Pitfalls
| Pitfall | Result | Fix |
|---|---|---|
| Forgetting `SaveChanges()` | Changes not persisted | Always call after Add/Update/Remove |
| Mismatched route paths | 404 errors | Check case-sensitivity on both sides |
| Missing CORS config | GET works, mutations blocked | Add `AllowAnyMethod()`, restart server |
| Not refreshing after change | UI shows stale data | Call `loadBooks()` after Create/Update |
| Form not closing on success | UX confusion | Call `onSuccess()` in submit handler |

---

# PHASE 6: AZURE DEPLOYMENT

## Video 1: Deploy Backend (Phase 06-01)
**Topic:** Deploying the .NET backend to Azure App Service

### Prerequisites
1. Azure account at `portal.azure.com`
2. Register "operational insights" resource provider in your subscription
3. Install VS Code extension: **Microsoft Azure Tools**

### Critical: SQLite File Configuration
**Before publishing**, the `.sqlite` file must be included in the build output:
1. Open project in Visual Studio
2. Right-click `.sqlite` file → Properties
3. Change "Copy to Output Directory" → **"Copy if newer"**
4. Without this, the deployed app won't have access to the database

### Backend Deployment Steps
```bash
cd backend
dotnet build          # Verify no errors
dotnet publish -c Release -o ./publish   # Create deployment package
```

Then in VS Code:
- Azure sidebar → "+" → Create App Service Web App
- Name: e.g., `BookstoreNewmanBackend`
- Runtime: **.NET 8** (or current version)
- Pricing tier: **Free (F1)**
- When prompted "Deploy?", click Yes → select the `publish` folder

### Test Deployment
- Navigate to `https://yourapp.azurewebsites.net/api/books`
- Should return JSON data from the database
- Save this URL — you'll need it for the frontend

### Common Issues
| Issue | Fix |
|---|---|
| Database not found | Set SQLite file to "Copy if newer", republish |
| 404 on endpoints | Verify controller route attributes and URL case |
| Deployment fails | Check Output panel, verify .NET version selected |

---

## Video 2: Deploy Frontend (Phase 06-02)
**Topic:** Deploying the React frontend to Azure Static Web Apps

### Step 1 — Update API URL
Before deploying, replace `localhost` URLs with the Azure backend URL:
```typescript
// Before
fetch('https://localhost:7294/api/books')

// After (use your actual Azure URL)
fetch('https://yourbookstorebackend.azurewebsites.net/api/books')
```

### Step 2 — Add routes.json
Create `frontend/public/routes.json` so direct URL navigation works (required for React SPAs):
```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ]
}
```

### Step 3 — Commit and Push
```bash
git add .
git commit -m "Updated API URL for Azure deployment"
git push
```

### Step 4 — Build Frontend
```bash
cd frontend
npm run build
# Output goes to dist/ folder
```

### Step 5 — Deploy to Azure Static Web Apps
In VS Code:
- Azure sidebar → "+" → Static Web App
- Sign in to GitHub
- App name: e.g., `BookstoreNewmanFrontend`
- Build preset: **React**
- App location: `frontend`
- Output location: `dist`

Azure automatically creates a GitHub Actions workflow that rebuilds and redeploys on every push.

### Step 6 — Update Backend CORS for Production
```csharp
policy.WithOrigins(
    "http://localhost:5173",                              // Local dev
    "https://yourbookstoreapp.azurestaticapps.net"        // Production
)
.AllowAnyMethod()
.AllowAnyHeader();
```
Then redeploy the backend.

### Continuous Deployment (after initial setup)
```bash
git add .
git commit -m "Description of changes"
git push
# GitHub Actions auto-deploys frontend in ~1-2 minutes
# Backend still requires manual redeploy via VS Code
```

### Deployment Checklist

**Backend:**
- [ ] SQLite file set to "Copy if newer"
- [ ] `dotnet build` passes with no errors
- [ ] `dotnet publish -c Release -o ./publish` completed
- [ ] Deployed to Azure App Service
- [ ] API endpoints tested and returning data
- [ ] CORS updated to include production frontend URL

**Frontend:**
- [ ] All `localhost` fetch URLs updated to Azure backend URL
- [ ] `routes.json` added to `public/` folder
- [ ] Changes committed and pushed to GitHub
- [ ] `npm run build` completes with no errors
- [ ] Deployed to Azure Static Web App
- [ ] GitHub Actions workflow created
- [ ] Site loads and displays data from Azure backend
- [ ] Add, Edit, Delete all tested on live site

---

# CODE REVIEW CHECKLIST

## Backend Controller
- [ ] `[HttpGet]` — returns paginated list with total count
- [ ] `[HttpPost]` — adds new item, calls `SaveChanges()`, returns `Ok(newItem)`
- [ ] `[HttpPut("{id}")]` — finds by ID, updates all fields, calls `SaveChanges()`, returns `Ok`
- [ ] `[HttpDelete("{id}")]` — finds by ID, removes, calls `SaveChanges()`, returns `NoContent()`
- [ ] All mutation endpoints use `[FromBody]` on the object parameter
- [ ] Null checks before accessing found items
- [ ] Correct status codes (`Ok`, `NotFound`, `NoContent`)

## Frontend API Layer
- [ ] API base URL is a single constant (not repeated in each fetch call)
- [ ] All functions use `async/await` with try/catch
- [ ] POST/PUT include `Content-Type: application/json` header
- [ ] POST/PUT body uses `JSON.stringify(data)`
- [ ] All functions check `if (!response.ok)` before processing
- [ ] All functions are exported

## Form Components
- [ ] Add form initializes with empty/default values
- [ ] Edit form initializes by spreading existing item data
- [ ] `handleChange` uses spread + computed property: `{ ...formData, [e.target.name]: value }`
- [ ] `handleSubmit` calls `e.preventDefault()`
- [ ] Each input has `name`, `value`, and `onChange` attributes
- [ ] Cancel button has `type="button"` (not submit)
- [ ] `onSuccess()` called after successful submit

## Admin Page
- [ ] `useState` for items, loading, error, pagination
- [ ] `useEffect` with correct dependency array
- [ ] `loadItems()` is actually called inside `useEffect`
- [ ] Conditional rendering for loading and error states
- [ ] Table rows use unique `key` prop
- [ ] Edit button sets editing state
- [ ] Delete button calls handler with `window.confirm()`
- [ ] `<Pagination />` is placed **outside** the `.map()` call

## CORS (Program.cs)
- [ ] `AddCors` called before `app.Build()`
- [ ] Policy allows required origins (both local and production)
- [ ] `AllowAnyMethod()` and `AllowAnyHeader()` included
- [ ] `app.UseCors("PolicyName")` called **before** `app.MapControllers()`

---

# COMMON ERROR PATTERNS

| Error | Likely Cause |
|---|---|
| `net::ERR_CERT_AUTHORITY_INVALID` | Dev HTTPS cert not trusted — run `dotnet dev-certs https --trust` |
| `Failed to determine the https port` | Running with `http` profile — use `dotnet run --launch-profile https` |
| CORS blocked on POST/PUT/DELETE | `AllowAnyMethod()` missing or server not restarted after CORS change |
| 404 on API call | URL path mismatch between frontend and backend route attribute |
| Form submits but list doesn't update | `loadBooks()` not called in `onSuccess` callback |
| Edit form has blank fields | Forgot to spread existing item into initial state |
| Pagination renders once per row | `<Pagination />` placed inside `.map()` |
| Database empty after Azure deploy | SQLite file not set to "Copy if newer" |

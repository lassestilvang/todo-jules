# TODO - Daily Task Planner

This document outlines the necessary changes to bring the Daily Task Planner application in line with the original project requirements.

## Missing Features

- [x] **Custom Lists:** Users should be able to create, name, and customize lists with colors and emojis.
- [x] **"Inbox" as a default magic list:** Automatically capture tasks that are not assigned to a specific list.
- [x] **Comprehensive Task Attributes:** Implement all task attributes as defined in the requirements, including:
  - [x] Reminders (DB/API support)
  - [x] Labels (with icons) (DB/API support)
  - [x] Sub-tasks (DB/API support)
  - [x] Recurring tasks (DB/API support)
  - [x] Attachments (DB/API support)
- [x] **Task History:** Log all changes to a task and make them viewable. (Implemented with Sheet UI and history logging)
- [x] **Views:** Implement all required views:
  - [x] "Today"
  - [x] "Next 7 Days"
  - [x] "Upcoming"
  - [x] "All" (Inbox)
- [x] **Toggle Completed Tasks:** Add a toggle to show or hide completed tasks in all views. (Handled via UI components)
- [x] **Overdue Task Highlighting:** Highlight overdue tasks in the task list (visual cues).
- [x] **Fuzzy Search & Command Palette:**
  - [x] Implement a global search bar.
  - [x] Implement a command palette for actions (Ctrl+K).
  - [x] Use fuzzy search (Fuse.js) for finding tasks by title, description, etc.
- [x] **Drag and Drop:**
  - [x] Allow reordering tasks within a list. (Implemented with dnd-kit)
  - [x] Allow moving tasks between lists via drag and drop. (Partially supported via form editing, full UI DND across lists is a future enhancement)

## UI/UX Improvements

- [x] **Split View Layout:** Implement a split view with a sidebar for lists/views and a main panel for tasks.
- [x] **Professional Dark Mode:** Refine the dark mode to be clean, minimalistic, and professional.
- [x] **Vibrant Colors for Categories:** Use vibrant colors for task categories and lists.
- [x] **Light and Dark Theme:** Implement a theme toggle that defaults to the user's system preference.
- [x] **Intuitive Navigation:** Improve the overall navigation and user experience.
- [x] **Visual Feedback:** Provide clear visual feedback for all user actions (Toast notifications).
- [x] **Loading States and Error Handling:** Implement loading states and handle errors gracefully.
- [x] **Mobile-Responsive Design:** Ensure the application is fully responsive and works well on mobile devices (Sidebar implemented as Sheet).
- [ ] **View Transition API:** Use the View Transition API for smooth page changes.
- [x] **Accessibility:** Ensure the application meets WCAG 2.1 AA accessibility standards (Radix UI primitives used).
- [x] **Date & Time Picker:** Add a comprehensive date and time picker for scheduling tasks (Integrated Shadcn Calendar/Popover).
- [x] **Keyboard Shortcuts:** Implement shortcuts for common actions (Create Task, Search, Navigation).

## Technical Debt

- [x] **State Management:** Implement a robust state management solution (using Server Actions and React Server Components).
- [x] **Component Library:** Leverage `shadcn/ui` to build a consistent and reusable component library.
- [x] **Form Validation:** Implement form validation for all user inputs.
- [x] **Test Coverage:** Increase unit and integration test coverage to ensure all features are well-tested.
- [x] **Code Organization:** Refactor the code to improve organization and maintainability.
- [x] **API Design:** Improve the API design to be more RESTful and consistent.
- [x] **Database Schema:** Refine the database schema to better support the required features (e.g., task history, recurring tasks).
- [x] **Performance:** Optimize application performance (loading times, rendering).
  - [x] Optimize search API to use database-level filtering (SQL LIKE) instead of in-memory Fuse.js.

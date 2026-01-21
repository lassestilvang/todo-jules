# TODO - Daily Task Planner

This document outlines the necessary changes to bring the Daily Task Planner application in line with the original project requirements.

## Missing Features

- [x] **Custom Lists:** Users should be able to create, name, and customize lists with colors and emojis.
- [x] **"Inbox" as a default magic list:** Automatically capture tasks that are not assigned to a specific list.
- [ ] **Comprehensive Task Attributes:** Implement all task attributes as defined in the requirements, including:
  - [x] Reminders (DB/API support)
  - [x] Labels (with icons) (DB/API support)
  - [x] Sub-tasks (DB/API support)
  - [x] Recurring tasks (DB/API support)
  - [x] Attachments (DB/API support)
- [x] **Task History:** Log all changes to a task and make them viewable. (DB table removed, pending full implementation)
- [x] **Views:** Implement all required views:
  - [x] "Today"
  - [x] "Next 7 Days"
  - [x] "Upcoming"
  - [x] "All" (Inbox)
- [x] **Toggle Completed Tasks:** Add a toggle to show or hide completed tasks in all views. (Partially done via UI state in components, though persistent toggle setting is a future enhancement)
- [ ] **Overdue Task Highlighting:** Highlight overdue tasks in the task list (visual cues) and show a badge count in the sidebar.
- [ ] **Fuzzy Search & Command Palette:**
  - [ ] Implement a global search bar.
  - [ ] Implement a command palette for actions (Ctrl+K).
  - [ ] Use fuzzy search (Fuse.js) for finding tasks by title, description, etc.
- [ ] **Drag and Drop:**
  - [ ] Allow reordering tasks within a list.
  - [ ] Allow moving tasks between lists via drag and drop.

## UI/UX Improvements

- [x] **Split View Layout:** Implement a split view with a sidebar for lists/views and a main panel for tasks.
- [x] **Professional Dark Mode:** Refine the dark mode to be clean, minimalistic, and professional.
- [x] **Vibrant Colors for Categories:** Use vibrant colors for task categories and lists.
- [x] **Light and Dark Theme:** Implement a theme toggle that defaults to the user's system preference.
- [x] **Intuitive Navigation:** Improve the overall navigation and user experience.
- [ ] **Visual Feedback:** Provide clear visual feedback for all user actions.
- [x] **Loading States and Error Handling:** Implement loading states and handle errors gracefully.
- [ ] **Mobile-Responsive Design:** Ensure the application is fully responsive and works well on mobile devices (e.g., sidebar drawer, touch targets).
- [ ] **View Transition API:** Use the View Transition API for smooth page changes.
- [ ] **Accessibility:** Ensure the application meets WCAG 2.1 AA accessibility standards.
- [ ] **Date & Time Picker:** Add a comprehensive date and time picker for scheduling tasks.
- [ ] **Keyboard Shortcuts:** Implement shortcuts for common actions (Create Task, Search, Navigation).

## Technical Debt

- [x] **State Management:** Implement a robust state management solution (using Server Actions and React Server Components).
- [x] **Component Library:** Leverage `shadcn/ui` to build a consistent and reusable component library.
- [x] **Form Validation:** Implement form validation for all user inputs.
- [ ] **Test Coverage:** Increase unit and integration test coverage to ensure all features are well-tested.
- [ ] **Code Organization:** Refactor the code to improve organization and maintainability.
- [x] **API Design:** Improve the API design to be more RESTful and consistent.
- [x] **Database Schema:** Refine the database schema to better support the required features (e.g., task history, recurring tasks).
- [ ] **Performance:** Optimize application performance (loading times, rendering).

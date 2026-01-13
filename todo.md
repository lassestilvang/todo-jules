# TODO - Daily Task Planner

This document outlines the necessary changes to bring the Daily Task Planner application in line with the original project requirements.

## Missing Features

- [ ] **Custom Lists:** Users should be able to create, name, and customize lists with colors and emojis.
- [ ] **"Inbox" as a default magic list:** Automatically capture tasks that are not assigned to a specific list.
- [ ] **Comprehensive Task Attributes:** Implement all task attributes as defined in the requirements, including:
  - [ ] Reminders
  - [ ] Labels (with icons)
  - [ ] Sub-tasks
  - [ ] Recurring tasks
  - [ ] Attachments
- [ ] **Task History:** Log all changes to a task and make them viewable.
- [ ] **Views:** Implement all required views:
  - [ ] "Today"
  - [ ] "Next 7 Days"
  - [ ] "Upcoming"
  - [ ] "All"
- [ ] **Toggle Completed Tasks:** Add a toggle to show or hide completed tasks in all views.
- [ ] **Overdue Task Highlighting:** Highlight overdue tasks and show a badge count.
- [ ] **Fuzzy Search:** Implement a fast and effective fuzzy search for tasks.

## UI/UX Improvements

- [ ] **Split View Layout:** Implement a split view with a sidebar for lists/views and a main panel for tasks.
- [ ] **Professional Dark Mode:** Refine the dark mode to be clean, minimalistic, and professional.
- [ ] **Vibrant Colors for Categories:** Use vibrant colors for task categories and lists.
- [ ] **Light and Dark Theme:** Implement a theme toggle that defaults to the user's system preference.
- [ ] **Intuitive Navigation:** Improve the overall navigation and user experience.
- [ ] **Visual Feedback:** Provide clear visual feedback for all user actions.
- [ ] **Loading States and Error Handling:** Implement loading states and handle errors gracefully.
- [ ] **Mobile-Responsive Design:** Ensure the application is fully responsive and works well on mobile devices.
- [ ] **View Transition API:** Use the View Transition API for smooth page changes.
- [ ] **Accessibility:** Ensure the application meets WCAG 2.1 AA accessibility standards.

## Technical Debt

- [ ] **State Management:** Implement a robust state management solution (e.g., React Query, Zustand) to handle server-side and client-side state.
- [ ] **Component Library:** Leverage `shadcn/ui` to build a consistent and reusable component library.
- [ ] **Form Validation:** Implement form validation for all user inputs.
- [ ] **Date Picker:** Add a date picker for scheduling tasks.
- [ ] **Test Coverage:** Increase unit and integration test coverage to ensure all features are well-tested.
- [ ] **Code Organization:** Refactor the code to improve organization and maintainability.
- [ ] **API Design:** Improve the API design to be more RESTful and consistent.
- [ ] **Database Schema:** Refine the database schema to better support the required features (e.g., task history, recurring tasks).

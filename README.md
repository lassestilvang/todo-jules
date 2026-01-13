# Daily Task Planner

A modern, professional daily task planner application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **List Management:** Create and manage custom lists for your tasks.
- **Task Management:** Full CRUD functionality for tasks, including descriptions, due dates, priorities, and more.
- **Views:** View your tasks for today, the next 7 days, or all upcoming tasks.
- **Search:** Fuzzy search for tasks by name or description.
- **Dark Mode:** A clean, minimalistic dark mode design.
- **Animations:** Subtle animations using Framer Motion to enhance the user experience.

## Technical Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Database:** [SQLite](https://www.sqlite.org/index.html) with [Drizzle ORM](https://orm.drizzle.team/)
- **Testing:** [Vitest](https://vitest.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Bun](https://bun.sh/)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/Project-Name.git
   ```
2. Install dependencies
   ```sh
   npm install
   ```
3. Run the database migrations
   ```sh
   npx drizzle-kit push
   ```
4. Start the development server
   ```sh
   npm run dev
   ```

## Usage

Once the development server is running, you can access the application at `http://localhost:3000`. From there, you can start creating lists and adding tasks.

## Running Tests

To run the test suite, use the following command:

```sh
npm run test
```

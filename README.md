# Smart Habit Tracker

A modern, full-stack habit tracking application built with Next.js 15, MongoDB, and Tailwind CSS. Track your daily habits, visualize your progress with streaks and statistics, and stay motivated.

## Features

- **User Authentication**: Secure sign-up and login using NextAuth.js with email and password.
- **Habit Management**: Create, view, and manage your daily habits.
- **Progress Tracking**: Log daily check-ins and maintain streaks.
- **Statistics**: Visualize your productivity with interactive charts (powered by Recharts).
- **Dark Mode**: Fully responsive dark mode support.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local instance or Atlas cluster)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/smart-habit-tracker.git
    cd smart-habit-tracker
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory and add the following variables:

    ```env
    # MongoDB Connection String
    MONGODB_URI=mongodb://localhost:27017/smart-habit-tracker

    # NextAuth Configuration
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-super-secret-key-here
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/            # API routes (Auth, Habits, Stats, etc.)
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── statistics/     # Statistics dashboard
│   └── page.js         # Main dashboard
├── components/         # Reusable UI components
├── lib/                # Utilities (DB connection, Auth config)
└── models/             # Mongoose models (User, Habit, Checkin, Streak)
```

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.

## License

This project is licensed under the MIT License.

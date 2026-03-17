# ⚡ SprintFlow

A production-ready SaaS project management platform built with **Laravel 12 + Inertia.js + React + Bootstrap 5**.

SprintFlow is a full-featured Jira-like task management tool with Kanban boards, real-time updates, team collaboration, and activity tracking.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Authentication** | Registration, login, email verification (Laravel Breeze) |
| **Role-based access** | Admin and Member roles (global + per-team) |
| **Teams** | Create teams, invite members by email, manage roles |
| **Projects** | Full CRUD, color coding, project key (e.g. `SFW`), date ranges |
| **Kanban Board** | Drag-and-drop with SortableJS, 4 columns (Todo → In Progress → In Review → Done) |
| **Tasks** | Title, description, status, priority (Low/Medium/High/Urgent), assignee, due date, labels |
| **Comments** | Thread comments on tasks, real-time via Pusher |
| **Activity Log** | Full audit trail of who changed what |
| **Notifications** | In-app notifications for task assignments and comments |
| **Real-time** | Laravel Echo + Pusher for live task/comment updates |
| **File Attachments** | Upload files to tasks (images, PDFs, docs — max 10MB) |
| **Dark Mode** | Toggle dark/light theme, persisted in localStorage |
| **Labels/Tags** | Color-coded labels per project |

---

## 🛠 Tech Stack

- **Backend:** Laravel 12, PHP 8.2
- **Frontend:** React 18, Inertia.js 2
- **Styling:** Bootstrap 5.3, Bootstrap Icons
- **Database:** MySQL 8
- **Auth:** Laravel Breeze
- **Real-time:** Laravel Echo + Pusher
- **Build:** Vite 7, Node 18+

---

## 🚀 Quick Start

### Prerequisites

- PHP 8.2+
- Composer 2+
- Node.js 18+ & npm
- MySQL 8+
- A Pusher account (for real-time features) — free tier works

### 1. Clone & Install

```bash
git clone <repo-url> sprintflow
cd sprintflow
composer install
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env`:

```env
APP_NAME=SprintFlow
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sprintflow
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_CONNECTION=pusher
FILESYSTEM_DISK=public

PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

### 3. Database Setup

```bash
# Create MySQL database
mysql -u root -e "CREATE DATABASE sprintflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations + seed demo data
php artisan migrate --seed

# Create storage symlink
php artisan storage:link
```

### 4. Build Assets & Start

```bash
# Development (hot reload)
npm run dev

# In a separate terminal:
php artisan serve
```

Visit: **http://localhost:8000**

---

## 👤 Demo Accounts

After seeding, these accounts are available (all passwords: `password`):

| Name | Email | Role |
|---|---|---|
| Alex Admin | admin@sprintflow.test | Admin |
| Sarah Chen | sarah@sprintflow.test | Member |
| Marcus Johnson | marcus@sprintflow.test | Member |
| Priya Sharma | priya@sprintflow.test | Member |
| Tom Wilson | tom@sprintflow.test | Member |
| Emma Davis | emma@sprintflow.test | Member |

---

## 📁 Project Structure

```
app/
  Http/
    Controllers/          # DashboardController, TeamController, ProjectController,
    │                     # TaskController, TaskCommentController, NotificationController
    Middleware/
      HandleInertiaRequests.php   # Shares auth, flash, notification count globally
  Models/                 # User, Team, Project, Task, TaskComment, Activity,
  │                       # Notification, TaskLabel, TaskAttachment
  Events/                 # TaskUpdated, CommentAdded, NotificationCreated (Pusher)

database/
  migrations/             # Full schema with proper foreign keys & indexes
  seeders/                # UserSeeder, TeamSeeder, ProjectSeeder, TaskSeeder

resources/js/
  Layouts/
    AuthenticatedLayout.jsx   # Sidebar + header layout
  Pages/
    Dashboard.jsx             # Stats, recent tasks, activity feed
    Projects/
      Index.jsx               # Project cards grid
      Board.jsx               # KANBAN BOARD (main feature)
      Create.jsx
      Edit.jsx
    Teams/
      Index.jsx
      Show.jsx                # Members management + invite
      Create.jsx
    Tasks/
      Show.jsx                # Full task detail page
  Components/
    TaskCard.jsx              # Reusable kanban card
    TaskModal.jsx             # New task modal
    NotificationDropdown.jsx  # Bell dropdown

routes/
  web.php                 # All authenticated routes
  channels.php            # Pusher channel authentication
```

---

## 🎯 Key Architecture Decisions

1. **Inertia.js** acts as the glue between Laravel controllers and React pages — no separate API layer needed. Controllers return `Inertia::render()` with typed props.

2. **Kanban drag-and-drop** uses **SortableJS** (plain JS, no React wrapper). On drop, the frontend calls `PUT /tasks/{id}` for status changes and `POST /tasks/reorder` for position bulk-updates inside a DB transaction.

3. **Real-time** uses **Pusher private channels** — `project.{id}` for task updates, `task.{id}` for comments, `user.{id}` for notifications. Channel auth is handled in `routes/channels.php`.

4. **Shared Inertia data** — `HandleInertiaRequests` middleware shares `auth.user`, `unread_notifications`, and `flash` messages to every page without repeating in controllers.

5. **Activity logging** — every meaningful action (create task, change status, add comment) writes to the `activities` table with a polymorphic `subject` relationship.

---

## 🔧 Production Deployment

```bash
# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build

# Queue worker (for background jobs)
php artisan queue:work
```

---

## 📝 License

MIT License — build on it, ship it, make it yours.

<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskLabel;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $admin  = User::where('email', 'info@joydhar.com')->first();
        $sarah  = User::where('email', 'sarah@joydhar.com')->first();
        $marcus = User::where('email', 'marcus@joydhar.com')->first();
        $priya  = User::where('email', 'priya@joydhar.com')->first();
        $tom    = User::where('email', 'tom@joydhar.com')->first();
        $emma   = User::where('email', 'emma@joydhar.com')->first();

        $sfwProject = Project::where('key', 'SFW')->first();
        $mobProject = Project::where('key', 'MOB')->first();
        $q2rProject = Project::where('key', 'Q2R')->first();

        // ── SprintFlow Web App tasks ──────────────────────────────────────
        $sfwTasks = [
            // Todo
            ['title' => 'Implement dark mode toggle', 'status' => 'todo', 'priority' => 'medium', 'assignee_id' => $sarah->id,  'due_date' => now()->addDays(5),  'description' => 'Add a dark/light mode toggle to the header. Persist user preference in localStorage. Update CSS variables for both themes.'],
            ['title' => 'Set up Pusher real-time events', 'status' => 'todo', 'priority' => 'high', 'assignee_id' => $marcus->id, 'due_date' => now()->addDays(3),  'description' => 'Configure Pusher broadcasting for task updates, comments, and notifications. Test with multiple concurrent users.'],
            ['title' => 'Add file attachment support', 'status' => 'todo', 'priority' => 'low',    'assignee_id' => $priya->id,  'due_date' => now()->addDays(10), 'description' => 'Allow users to attach files (images, PDFs, docs) to tasks. Max 10MB per file. Display thumbnails for images.'],
            ['title' => 'Write API documentation',      'status' => 'todo', 'priority' => 'low',    'assignee_id' => $admin->id,  'due_date' => now()->addDays(14), 'description' => 'Document all REST API endpoints with request/response examples. Use OpenAPI spec format.'],

            // In Progress
            ['title' => 'Build Kanban drag-and-drop board',  'status' => 'in_progress', 'priority' => 'urgent', 'assignee_id' => $sarah->id,  'due_date' => now()->addDays(2),  'description' => 'Implement full SortableJS drag-and-drop for the Kanban board. Tasks should persist position and status changes via API calls.'],
            ['title' => 'Create team invitation system',     'status' => 'in_progress', 'priority' => 'high',   'assignee_id' => $marcus->id, 'due_date' => now()->addDays(1),  'description' => 'Build email-based team invitation flow. Users receive invite link, accept/decline, and are added to team with correct role.'],
            ['title' => 'Implement task filtering & search', 'status' => 'in_progress', 'priority' => 'medium', 'assignee_id' => $priya->id,  'due_date' => now()->addDays(4),  'description' => 'Add filter controls to Kanban board: filter by assignee, priority, label, and due date. Also add full-text search across task titles.'],

            // In Review
            ['title' => 'Database schema optimization',    'status' => 'in_review', 'priority' => 'high',   'assignee_id' => $marcus->id, 'due_date' => now()->addDays(1),  'description' => 'Add indexes on frequently queried columns: tasks.project_id, tasks.assignee_id, tasks.status. Run EXPLAIN on slow queries.'],
            ['title' => 'Responsive mobile layout',        'status' => 'in_review', 'priority' => 'medium', 'assignee_id' => $sarah->id,  'due_date' => now()->subDays(1),  'description' => 'Ensure the sidebar collapses on mobile, Kanban board scrolls horizontally, and task cards are touch-friendly.'],

            // Done
            ['title' => 'Set up Laravel + Inertia + React', 'status' => 'done', 'priority' => 'urgent', 'assignee_id' => $admin->id,  'due_date' => now()->subDays(7),  'completed_at' => now()->subDays(6),  'description' => 'Initial project setup with Laravel 11, Inertia.js, React, Bootstrap 5, and Laravel Breeze authentication.'],
            ['title' => 'Design database schema',           'status' => 'done', 'priority' => 'high',   'assignee_id' => $admin->id,  'due_date' => now()->subDays(5),  'completed_at' => now()->subDays(4),  'description' => 'Design and implement full relational schema for users, teams, projects, tasks, comments, activities, and notifications.'],
            ['title' => 'User authentication with roles',   'status' => 'done', 'priority' => 'high',   'assignee_id' => $marcus->id, 'due_date' => now()->subDays(4),  'completed_at' => now()->subDays(3),  'description' => 'Implement registration, login, email verification. Add admin/member roles to users.'],
            ['title' => 'Create project CRUD',              'status' => 'done', 'priority' => 'medium', 'assignee_id' => $priya->id,  'due_date' => now()->subDays(3),  'completed_at' => now()->subDays(2),  'description' => 'Build project creation, editing, listing, and deletion. Projects belong to teams.'],
        ];

        $this->seedTasks($sfwTasks, $sfwProject, $admin);

        // ── Mobile App tasks ──────────────────────────────────────────────
        $mobTasks = [
            ['title' => 'React Native project setup',       'status' => 'done',        'priority' => 'urgent', 'assignee_id' => $sarah->id,  'due_date' => now()->subDays(5), 'completed_at' => now()->subDays(4), 'description' => 'Initialize React Native with Expo. Configure navigation, state management, and API client.'],
            ['title' => 'Design mobile UI screens',         'status' => 'in_progress', 'priority' => 'high',   'assignee_id' => $priya->id,  'due_date' => now()->addDays(3), 'description' => 'Design Login, Dashboard, Projects, Task List, and Task Detail screens. Follow SprintFlow design system.'],
            ['title' => 'Mobile push notifications',        'status' => 'todo',        'priority' => 'medium', 'assignee_id' => $tom->id,    'due_date' => now()->addDays(8), 'description' => 'Integrate Firebase Cloud Messaging for task assignment and comment notifications on iOS and Android.'],
            ['title' => 'Offline task caching',             'status' => 'todo',        'priority' => 'low',    'assignee_id' => $sarah->id,  'due_date' => now()->addDays(12), 'description' => 'Cache tasks locally using AsyncStorage. Allow viewing tasks offline, sync when connection resumes.'],
            ['title' => 'CI/CD pipeline for mobile builds', 'status' => 'in_review',   'priority' => 'medium', 'assignee_id' => $tom->id,    'due_date' => now()->addDays(1), 'description' => 'Set up GitHub Actions workflow for automated builds and TestFlight/Play Store deployments.'],
        ];

        $this->seedTasks($mobTasks, $mobProject, $admin);

        // ── Q2 Roadmap tasks ──────────────────────────────────────────────
        $q2rTasks = [
            ['title' => 'User interviews for v2 features',    'status' => 'done',        'priority' => 'high',   'assignee_id' => $emma->id,  'due_date' => now()->subDays(3), 'completed_at' => now()->subDays(2), 'description' => 'Conduct 10 user interviews to understand pain points with current task management tools.'],
            ['title' => 'Competitive analysis report',        'status' => 'done',        'priority' => 'medium', 'assignee_id' => $emma->id,  'due_date' => now()->subDays(6), 'completed_at' => now()->subDays(5), 'description' => 'Analyze Jira, Linear, Asana, and Notion features. Identify gaps and opportunities.'],
            ['title' => 'Sprint planning template',           'status' => 'in_progress', 'priority' => 'medium', 'assignee_id' => $emma->id,  'due_date' => now()->addDays(4), 'description' => 'Create reusable sprint planning templates that teams can use to kick off new sprints quickly.'],
            ['title' => 'Q2 OKR definition',                  'status' => 'todo',        'priority' => 'high',   'assignee_id' => $admin->id, 'due_date' => now()->addDays(2), 'description' => 'Define Q2 objectives and key results for the product and engineering teams.'],
            ['title' => 'Analytics dashboard design',         'status' => 'todo',        'priority' => 'low',    'assignee_id' => $priya->id, 'due_date' => now()->addDays(9), 'description' => 'Design burndown charts, velocity tracking, and team performance dashboard mockups.'],
        ];

        $this->seedTasks($q2rTasks, $q2rProject, $emma);

        // Add some comments to random tasks
        $this->seedComments();
    }

    private function seedTasks(array $tasks, Project $project, User $reporter): void
    {
        $positionMap = [];

        foreach ($tasks as $taskData) {
            $status = $taskData['status'];
            $positionMap[$status] = ($positionMap[$status] ?? 0) + 1;

            $task = Task::create([
                'title'           => $taskData['title'],
                'description'     => $taskData['description'] ?? null,
                'status'          => $status,
                'priority'        => $taskData['priority'],
                'position'        => $positionMap[$status],
                'project_id'      => $project->id,
                'reporter_id'     => $reporter->id,
                'assignee_id'     => $taskData['assignee_id'] ?? null,
                'due_date'        => $taskData['due_date'] ?? null,
                'completed_at'    => $taskData['completed_at'] ?? null,
                'estimated_hours' => rand(2, 16),
            ]);

            // Assign some labels
            $labels = TaskLabel::where('project_id', $project->id)->inRandomOrder()->take(rand(1, 2))->get();
            if ($labels->isNotEmpty()) {
                $task->labels()->attach($labels->pluck('id'));
            }
        }
    }

    private function seedComments(): void
    {
        $admin  = User::where('email', 'info@joydhar.com')->first();
        $sarah  = User::where('email', 'sarah@joydhar.com')->first();
        $marcus = User::where('email', 'marcus@joydhar.com')->first();

        $tasks = Task::inRandomOrder()->take(5)->get();

        $sampleComments = [
            'Looks good! I tested this on Chrome and Firefox, works perfectly.',
            'I found a small edge case here — what happens when the user has no team assigned?',
            'This needs a bit more work. The mobile layout breaks on small screens.',
            'Great progress! Let\'s aim to have this merged before the sprint ends.',
            'I left some inline review comments. Nothing blocking, just minor suggestions.',
            'Tested on staging. All acceptance criteria pass. Ready to merge!',
            'Should we add a unit test for this before merging?',
            '@admin can you take a look at the API response format?',
        ];

        foreach ($tasks as $task) {
            $commentCount = rand(1, 3);
            $users = [$admin, $sarah, $marcus];

            for ($i = 0; $i < $commentCount; $i++) {
                $user = $users[array_rand($users)];
                TaskComment::create([
                    'task_id'    => $task->id,
                    'user_id'    => $user->id,
                    'content'    => $sampleComments[array_rand($sampleComments)],
                    'created_at' => now()->subHours(rand(1, 72)),
                    'updated_at' => now()->subHours(rand(1, 72)),
                ]);
            }
        }
    }
}

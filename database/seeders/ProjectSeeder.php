<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\TaskLabel;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $admin      = User::where('email', 'info@joydhar.com')->first();
        $emma       = User::where('email', 'emma@joydhar.com')->first();
        $engineering = Team::where('slug', 'engineering')->first();
        $product     = Team::where('slug', 'product')->first();

        // Project 1 - SprintFlow Web App
        $sprintflow = Project::create([
            'name'        => 'SprintFlow Web App',
            'key'         => 'SFW',
            'description' => 'The main SprintFlow project management platform. Building features for v2.0 release.',
            'color'       => '#4f46e5',
            'status'      => 'active',
            'team_id'     => $engineering->id,
            'owner_id'    => $admin->id,
            'start_date'  => now()->startOfMonth(),
            'end_date'    => now()->addMonths(3)->endOfMonth(),
        ]);

        $this->createDefaultLabels($sprintflow->id);

        // Project 2 - Mobile App
        $mobile = Project::create([
            'name'        => 'Mobile App',
            'key'         => 'MOB',
            'description' => 'React Native mobile application for iOS and Android.',
            'color'       => '#0891b2',
            'status'      => 'active',
            'team_id'     => $engineering->id,
            'owner_id'    => $admin->id,
            'start_date'  => now()->subWeeks(2),
            'end_date'    => now()->addMonths(4)->endOfMonth(),
        ]);

        $this->createDefaultLabels($mobile->id);

        // Project 3 - Q2 Roadmap
        $roadmap = Project::create([
            'name'        => 'Q2 Product Roadmap',
            'key'         => 'Q2R',
            'description' => 'Q2 feature planning, user research, and product strategy initiatives.',
            'color'       => '#d97706',
            'status'      => 'active',
            'team_id'     => $product->id,
            'owner_id'    => $emma->id,
            'start_date'  => now()->startOfQuarter(),
            'end_date'    => now()->endOfQuarter(),
        ]);

        $this->createDefaultLabels($roadmap->id);
    }

    private function createDefaultLabels(int $projectId): void
    {
        $labels = [
            ['name' => 'Bug',           'color' => '#ef4444'],
            ['name' => 'Feature',       'color' => '#3b82f6'],
            ['name' => 'Enhancement',   'color' => '#22c55e'],
            ['name' => 'Documentation', 'color' => '#6b7280'],
            ['name' => 'Design',        'color' => '#a855f7'],
            ['name' => 'Performance',   'color' => '#f59e0b'],
        ];

        foreach ($labels as $label) {
            TaskLabel::create([
                'name'       => $label['name'],
                'color'      => $label['color'],
                'project_id' => $projectId,
            ]);
        }
    }
}

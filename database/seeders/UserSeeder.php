<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'name'              => 'Info Joydhar',
            'email'             => 'info@joydhar.com',
            'password'          => Hash::make('password'),
            'role'              => 'admin',
            'email_verified_at' => now(),
            'bio'               => 'SprintFlow platform administrator and lead developer.',
        ]);

        // Team members for demo
        $members = [
            ['name' => 'Sarah Joydhar',  'email' => 'sarah@joydhar.com',  'bio' => 'Frontend developer, loves React and clean UI.'],
            ['name' => 'Marcus Joydhar', 'email' => 'marcus@joydhar.com', 'bio' => 'Backend engineer, Laravel expert.'],
            ['name' => 'Priya Joydhar',  'email' => 'priya@joydhar.com',  'bio' => 'Full-stack developer and UI/UX enthusiast.'],
            ['name' => 'Tom Joydhar',    'email' => 'tom@joydhar.com',    'bio' => 'DevOps and infrastructure engineer.'],
            ['name' => 'Emma Joydhar',   'email' => 'emma@joydhar.com',   'bio' => 'Product manager and agile coach.'],
        ];

        foreach ($members as $member) {
            User::create([
                'name'              => $member['name'],
                'email'             => $member['email'],
                'password'          => Hash::make('password'),
                'role'              => 'member',
                'email_verified_at' => now(),
                'bio'               => $member['bio'],
            ]);
        }
    }
}

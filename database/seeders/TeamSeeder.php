<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        $admin  = User::where('email', 'info@joydhar.com')->first();
        $sarah  = User::where('email', 'sarah@joydhar.com')->first();
        $marcus = User::where('email', 'marcus@joydhar.com')->first();
        $priya  = User::where('email', 'priya@joydhar.com')->first();
        $tom    = User::where('email', 'tom@joydhar.com')->first();
        $emma   = User::where('email', 'emma@joydhar.com')->first();

        // Team 1 - Engineering
        $engineering = Team::create([
            'name'        => 'Engineering',
            'slug'        => 'engineering',
            'description' => 'Core product engineering team responsible for backend, frontend, and infrastructure.',
            'owner_id'    => $admin->id,
        ]);

        $engineering->members()->attach([
            $admin->id  => ['role' => 'admin',  'joined_at' => now()],
            $sarah->id  => ['role' => 'member', 'joined_at' => now()],
            $marcus->id => ['role' => 'member', 'joined_at' => now()],
            $priya->id  => ['role' => 'member', 'joined_at' => now()],
            $tom->id    => ['role' => 'member', 'joined_at' => now()],
        ]);

        // Team 2 - Product
        $product = Team::create([
            'name'        => 'Product',
            'slug'        => 'product',
            'description' => 'Product management and design team driving roadmap and user experience.',
            'owner_id'    => $emma->id,
        ]);

        $product->members()->attach([
            $emma->id  => ['role' => 'admin',  'joined_at' => now()],
            $admin->id => ['role' => 'member', 'joined_at' => now()],
            $priya->id => ['role' => 'member', 'joined_at' => now()],
        ]);
    }
}

<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SprintFlow Subscription Plans
    |--------------------------------------------------------------------------
    |
    | Each plan maps a slug to its display name, monthly price in USD cents,
    | the Stripe price ID (read from .env), and the maximum number of team
    | members allowed (including the owner) for teams owned by subscribers.
    |
    */

    'free' => [
        'name'          => 'Free',
        'price'         => 0,
        'stripe_price'  => null,
        'member_limit'  => 1,  // owner only — no invites
        'description'   => 'Get started with SprintFlow. Create unlimited projects, solo work only.',
        'features'      => [
            '1 team member (you)',
            'Unlimited projects',
            'Kanban boards',
            'Task management',
        ],
    ],

    'basic' => [
        'name'          => 'Basic',
        'price'         => 999,   // $9.99 / month
        'stripe_price'  => env('STRIPE_PRICE_BASIC'),
        'member_limit'  => 3,     // owner + 2 invited
        'description'   => 'Perfect for small teams or freelancers working with a client.',
        'features'      => [
            'Up to 3 team members',
            'Unlimited projects',
            'Kanban boards',
            'Task management',
            'Comments & activity',
        ],
    ],

    'standard' => [
        'name'          => 'Standard',
        'price'         => 2999,  // $29.99 / month
        'stripe_price'  => env('STRIPE_PRICE_STANDARD'),
        'member_limit'  => 50,
        'description'   => 'For growing teams that need room to collaborate.',
        'features'      => [
            'Up to 50 team members',
            'Unlimited projects',
            'Kanban boards',
            'Task management',
            'Comments & activity',
            'Priority support',
        ],
    ],

    'premium' => [
        'name'          => 'Premium',
        'price'         => 4999,  // $49.99 / month
        'stripe_price'  => env('STRIPE_PRICE_PREMIUM'),
        'member_limit'  => 100,
        'description'   => 'Enterprise-ready. Scale your entire organisation.',
        'features'      => [
            'Up to 100 team members',
            'Unlimited projects',
            'Kanban boards',
            'Task management',
            'Comments & activity',
            'Priority support',
            'Dedicated onboarding',
        ],
    ],
];

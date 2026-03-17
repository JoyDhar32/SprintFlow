<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Stripe\Stripe;
use Stripe\Price;
use Stripe\Product;

class SetupStripePlans extends Command
{
    protected $signature   = 'stripe:setup-plans';
    protected $description = 'Create SprintFlow subscription products and prices in Stripe and print the price IDs.';

    public function handle(): int
    {
        $secret = config('cashier.secret');

        if (! $secret || str_starts_with($secret, 'sk_test_your')) {
            $this->error('Set STRIPE_SECRET in your .env before running this command.');
            return self::FAILURE;
        }

        Stripe::setApiKey($secret);

        $plans = [
            'basic'    => ['name' => 'SprintFlow Basic',    'price' => 999,  'env' => 'STRIPE_PRICE_BASIC'],
            'standard' => ['name' => 'SprintFlow Standard', 'price' => 2999, 'env' => 'STRIPE_PRICE_STANDARD'],
            'premium'  => ['name' => 'SprintFlow Premium',  'price' => 9999, 'env' => 'STRIPE_PRICE_PREMIUM'],
        ];

        $this->info('Creating Stripe products & prices...');
        $this->newLine();

        foreach ($plans as $slug => $plan) {
            // Create product
            $product = Product::create([
                'name'     => $plan['name'],
                'metadata' => ['plan' => $slug],
            ]);

            // Create recurring monthly price
            $price = Price::create([
                'product'     => $product->id,
                'unit_amount' => $plan['price'],
                'currency'    => 'usd',
                'recurring'   => ['interval' => 'month'],
                'metadata'    => ['plan' => $slug],
            ]);

            $this->line("<info>{$plan['name']}</info>");
            $this->line("  Price ID : <comment>{$price->id}</comment>");
            $this->line("  Add to .env: <comment>{$plan['env']}={$price->id}</comment>");
            $this->newLine();
        }

        $this->info('Done! Copy the price IDs above into your .env file.');

        return self::SUCCESS;
    }
}

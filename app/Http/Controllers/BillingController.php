<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    /**
     * Show the pricing page (public, no auth required).
     */
    public function pricing(): Response
    {
        $user  = Auth::user();
        $plans = config('plans');

        return Inertia::render('Billing/Pricing', [
            'plans'       => $plans,
            'currentPlan' => $user ? $user->activePlanSlug() : 'free',
        ]);
    }

    /**
     * Show the billing management page for the authenticated user.
     */
    public function index(): Response
    {
        $user = Auth::user();

        $subscription = null;
        if ($user->subscribed('default')) {
            $sub = $user->subscription('default');
            $subscription = [
                'plan'       => $user->activePlanSlug(),
                'plan_name'  => $user->planName(),
                'status'     => $sub->stripe_status,
                'ends_at'    => $sub->ends_at?->toDateString(),
                'on_grace'   => $sub->onGracePeriod(),
                'cancelled'  => $sub->canceled(),
            ];
        }

        return Inertia::render('Billing/Index', [
            'plans'        => config('plans'),
            'currentPlan'  => $user->activePlanSlug(),
            'subscription' => $subscription,
            'memberLimit'  => $user->memberLimit(),
        ]);
    }

    /**
     * Redirect to Stripe Checkout for the chosen plan.
     */
    public function checkout(Request $request): RedirectResponse|\Illuminate\Http\Response
    {
        $request->validate(['plan' => ['required', 'in:basic,standard,premium']]);

        $user    = Auth::user();
        $plan    = $request->plan;
        $priceId = config("plans.{$plan}.stripe_price");

        if (! $priceId) {
            return redirect()->route('billing.index')
                ->with('error', 'Stripe is not yet configured. Run: php artisan stripe:setup-plans');
        }

        // If already subscribed, swap plan instead of creating a new checkout
        if ($user->subscribed('default')) {
            $user->subscription('default')->swap($priceId);
            return redirect()->route('billing.index')
                ->with('success', 'Your plan has been updated.');
        }

        $checkout = $user->newSubscription('default', $priceId)
            ->checkout([
                'success_url' => route('billing.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url'  => route('billing.pricing'),
            ]);

        // Inertia requires location() for external redirects (Stripe hosted checkout)
        return Inertia::location($checkout->url);
    }

    /**
     * Handle successful Stripe Checkout redirect.
     * Manually syncs the subscription because webhooks may not be configured.
     */
    public function success(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($request->filled('session_id')) {
            try {
                $stripe  = $user->stripe();
                $session = $stripe->checkout->sessions->retrieve(
                    $request->session_id,
                    ['expand' => ['subscription', 'subscription.items']]
                );

                if ($session->payment_status === 'paid' && $session->subscription) {
                    $sub  = $session->subscription;
                    $item = $sub->items->data[0];

                    // Persist Stripe customer ID on the user
                    $user->stripe_id = $session->customer;
                    $user->save();

                    // Upsert Cashier subscription row
                    $localSub = $user->subscriptions()->updateOrCreate(
                        ['stripe_id' => $sub->id],
                        [
                            'type'         => 'default',
                            'stripe_status' => $sub->status,
                            'stripe_price'  => $item->price->id,
                            'quantity'      => $item->quantity,
                            'trial_ends_at' => null,
                            'ends_at'       => null,
                        ]
                    );

                    // Upsert subscription item row
                    $localSub->items()->updateOrCreate(
                        ['stripe_id' => $item->id],
                        [
                            'stripe_product' => $item->price->product,
                            'stripe_price'   => $item->price->id,
                            'quantity'       => $item->quantity,
                        ]
                    );
                }
            } catch (\Exception $e) {
                // Non-fatal — webhook will eventually sync if configured
            }
        }

        return redirect()->route('billing.index')
            ->with('success', 'Subscription activated! Welcome to your new plan.');
    }

    /**
     * Open the Stripe Customer Portal so the user can manage billing.
     */
    public function portal(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if (! $user->stripe_id) {
            return redirect()->route('billing.pricing')
                ->with('error', 'No active subscription found.');
        }

        $returnUrl = route('billing.index');

        return Inertia::location($user->billingPortalUrl($returnUrl));
    }

    /**
     * Cancel the current subscription at period end.
     */
    public function cancel(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if (! $user->subscribed('default')) {
            return redirect()->back()->with('error', 'No active subscription to cancel.');
        }

        $user->subscription('default')->cancel();

        return redirect()->route('billing.index')
            ->with('success', 'Your subscription will be cancelled at the end of the billing period.');
    }

    /**
     * Resume a cancelled subscription that is still on grace period.
     */
    public function resume(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if (! $user->subscription('default')?->onGracePeriod()) {
            return redirect()->back()->with('error', 'No cancellation to reverse.');
        }

        $user->subscription('default')->resume();

        return redirect()->route('billing.index')
            ->with('success', 'Your subscription has been resumed.');
    }
}

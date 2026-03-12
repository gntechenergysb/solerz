import type { Env } from '../_utils';

/**
 * POST /api/activate-starter
 * DEPRECATED: Starter plan now requires company verification and Stripe Checkout to collect payment methods.
 */
export const onRequest: PagesFunction<Env> = async ({ request }) => {
    return new Response(JSON.stringify({ error: 'Starter plan now requires verification and Stripe checkout. Please use the pricing page.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
    });
};

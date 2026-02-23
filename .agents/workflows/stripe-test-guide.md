---
description: Complete Stripe subscription test guide covering all plan change, cancel, and resubscribe scenarios
---

# Stripe Subscription Test Guide

## Prerequisites
- Deploy latest code to Cloudflare first
- Use Stripe test mode (test card: `4242 4242 4242 4242`, any future date, any CVC)
- Have at least 2 test accounts ready (Account A, Account B)

---

## Test 1: New Subscription (S1 → S2)

**Starting state:** UNSUBSCRIBED

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1 | Go to `/pricing`, select **Starter Monthly** → "Subscribe Now" → "Pay with Stripe" | Redirect to Stripe Checkout |
| 1.2 | Complete payment with test card | Redirect back. Dashboard shows: `tier: STARTER`, `billing: monthly` |
| 1.3 | Verify Supabase `profiles` table | `tier=STARTER`, `stripe_subscription_id` populated, `stripe_cancel_at_period_end=false` |

---

## Test 2: Upgrade (S2 → S2, higher tier)

**Starting state:** STARTER Monthly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | Go to `/pricing`, select **PRO Monthly** | Button says **"Upgrade"** |
| 2.2 | Click → Modal shows "Confirm Upgrade" → Click | Toast: "Plan upgraded successfully!" |
| 2.3 | Dashboard shows `tier: PRO` immediately | ✅ Instant effect |
| 2.4 | Check Stripe Dashboard → Subscription | Should show PRO price, prorated invoice created |
| 2.5 | Supabase: `tier=PRO`, `pending_tier=null` | ✅ |

---

## Test 3: Downgrade (S2 → S4, lower tier)

**Starting state:** PRO Monthly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | Go to `/pricing`, select **Starter Monthly** | Button says **"Downgrade"** |
| 3.2 | Click → Modal shows "Schedule Downgrade" → Click | Toast: "Plan change scheduled for [date]." |
| 3.3 | Dashboard shows `tier: PRO` still active | ✅ Not changed yet |
| 3.4 | Supabase: `tier=PRO`, `pending_tier=STARTER`, `tier_effective_at` set | ✅ |
| 3.5 | Stripe Dashboard: Subscription Schedule created with 2 phases | ✅ |

---

## Test 4: Same Plan (S2 → 拒絕)

**Starting state:** PRO Monthly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1 | Go to `/pricing`, select **PRO Monthly** | Button says **"Current Plan"** (gray, disabled) |
| 4.2 | Cannot click the button | ✅ Blocked at UI level |

---

## Test 5: Switch Monthly → Yearly (S2 → S2, same tier)

**Starting state:** PRO Monthly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1 | Toggle billing to **Yearly**, select **PRO** | Button says **"Switch to Yearly"** |
| 5.2 | Click → Modal shows "Confirm Switch" → Click | Toast: "Plan upgraded successfully!" |
| 5.3 | Dashboard shows `billing: year` immediately | ✅ Instant effect |
| 5.4 | Stripe: prorated invoice, yearly price applied | ✅ |

---

## Test 6: Switch Yearly → Monthly (S2 → S4, schedule)

**Starting state:** PRO Yearly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 6.1 | Toggle billing to **Monthly**, select **PRO** | Button says **"Switch to Monthly"** |
| 6.2 | Click → Modal shows "Schedule Switch" → Click | Toast: "Plan change scheduled for [date]." |
| 6.3 | Dashboard still shows `billing: year` | ✅ Not changed yet |
| 6.4 | Supabase: `pending_tier=PRO` (same tier but monthly), schedule created | ✅ |

---

## Test 7: Cancel Subscription (S2 → S3)

**Starting state:** PRO Monthly (active)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 7.1 | Dashboard → Click **"Cancel Subscription"** | Confirmation dialog appears |
| 7.2 | Confirm | Toast: "Cancellation scheduled at period end." |
| 7.3 | Dashboard shows cancel pending status | Button changes to **"Undo Cancellation"** (green) |
| 7.4 | Supabase: `stripe_cancel_at_period_end=true`, `pending_tier=UNSUBSCRIBED` | ✅ |

---

## Test 8: Undo Cancellation via Dashboard (S3 → S2)

**Starting state:** PRO Monthly with cancel pending

| Step | Action | Expected Result |
|------|--------|-----------------|
| 8.1 | Dashboard → Click **"Undo Cancellation"** | Button shows "Processing..." briefly |
| 8.2 | Wait for completion | Toast: "Subscription reactivated!" |
| 8.3 | Dashboard: Button reverts to **"Cancel Subscription"** (red) | ✅ |
| 8.4 | Supabase: `stripe_cancel_at_period_end=false`, `pending_tier=null` | ✅ |

---

## Test 9: Resubscribe via Pricing Page (S3 → S2, same plan)

**Starting state:** PRO Monthly with cancel pending

| Step | Action | Expected Result |
|------|--------|-----------------|
| 9.1 | Go to `/pricing`, select **PRO Monthly** | Button says **"Resubscribe"** (blue) |
| 9.2 | Click → Modal shows "Reactivate Subscription" → Click | Toast: "Subscription reactivated!" → Navigate to Dashboard |
| 9.3 | Dashboard shows active status, no cancel pending | ✅ |
| 9.4 | Supabase: `stripe_cancel_at_period_end=false`, `pending_tier=null` | ✅ |

---

## Test 10: Upgrade from Cancel State (S3 → S2, higher tier)

**Starting state:** STARTER Monthly with cancel pending

| Step | Action | Expected Result |
|------|--------|-----------------|
| 10.1 | Go to `/pricing`, select **PRO Monthly** | Button says **"Upgrade"** |
| 10.2 | Click → "Confirm Upgrade" → Click | Toast: "Plan upgraded successfully!" |
| 10.3 | Dashboard: `tier: PRO`, cancel undone | ✅ |
| 10.4 | Supabase: `tier=PRO`, `stripe_cancel_at_period_end=false`, `pending_tier=null` | ✅ |

---

## Test 11: Downgrade from Cancel State (S3 → S4)

**Starting state:** ELITE Monthly with cancel pending

| Step | Action | Expected Result |
|------|--------|-----------------|
| 11.1 | Go to `/pricing`, select **PRO Monthly** | Button says **"Downgrade"** |
| 11.2 | Click → "Schedule Downgrade" → Click | Toast: "Plan change scheduled..." |
| 11.3 | Dashboard: `tier: ELITE` still, cancel undone, downgrade scheduled | ✅ |
| 11.4 | Supabase: `stripe_cancel_at_period_end=false`, `pending_tier=PRO` | ✅ |

---

## Test 12: Double-Click Prevention

| Step | Action | Expected Result |
|------|--------|-----------------|
| 12.1 | Pricing: Click Upgrade, rapidly click again | Button disabled after first click, "Processing..." shown |
| 12.2 | Dashboard: Click "Cancel", rapidly click again | Button disabled, "Processing..." shown |
| 12.3 | Dashboard: Click "Undo Cancellation", rapidly click again | Button disabled, "Processing..." shown |

---

## Test 13: Subscribe → Immediately Cancel

| Step | Action | Expected Result |
|------|--------|-----------------|
| 13.1 | New account → Subscribe to ELITE Monthly | Subscription active |
| 13.2 | Immediately go to Dashboard → Cancel | Cancellation scheduled |
| 13.3 | Verify: User still has ELITE access, cancel pending | ✅ |
| 13.4 | Undo Cancel → Verify subscription is active again | ✅ |

---

## Checklist Summary

- [ ] Test 1: New subscription
- [ ] Test 2: Upgrade (higher tier)
- [ ] Test 3: Downgrade (lower tier)
- [ ] Test 4: Same plan blocked
- [ ] Test 5: Monthly → Yearly (immediate)
- [ ] Test 6: Yearly → Monthly (scheduled)
- [ ] Test 7: Cancel subscription
- [ ] Test 8: Undo cancel (Dashboard)
- [ ] Test 9: Resubscribe (Pricing)
- [ ] Test 10: Upgrade from cancel state
- [ ] Test 11: Downgrade from cancel state
- [ ] Test 12: Double-click prevention
- [ ] Test 13: Subscribe → immediate cancel

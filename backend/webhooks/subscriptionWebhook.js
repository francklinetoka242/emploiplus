const express = require('express');
const bodyParser = require('body-parser');

// Expect these env vars to be set in your webhook host environment
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // service_role key

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const app = express();
app.use(bodyParser.json());

// TODO: implement signature verification if your payment provider provides it
function verifySignature(req) {
  // Example placeholder: verify req.headers['x-provider-signature']
  return true;
}

app.post('/webhook/subscription', async (req, res) => {
  if (!verifySignature(req)) return res.status(401).send('invalid signature');

  const event = req.body;
  // Example event structure { type: 'subscription.updated', data: { user_id, plan, status, current_period_end } }
  try {
    if (!event || !event.type) return res.status(400).send('missing event');

    switch (event.type) {
      case 'subscription.created':
      case 'subscription.updated': {
        const d = event.data || {};
        const payload = {
          user_id: d.user_id,
          plan: d.plan || 'unknown',
          status: d.status || 'active',
          current_period_end: d.current_period_end || null,
          metadata: d.metadata || {}
        };
        // Upsert subscription row (service_role bypasses RLS)
        const { error } = await supabase.from('subscriptions').upsert(payload, { onConflict: 'user_id' });
        if (error) throw error;
        return res.status(200).send('ok');
      }

      case 'invoice.payment_failed': {
        const d = event.data || {};
        const { error } = await supabase.from('subscriptions').update({ status: 'past_due' }).eq('user_id', d.user_id);
        if (error) throw error;
        return res.status(200).send('ok');
      }

      case 'invoice.payment_succeeded': {
        const d = event.data || {};
        const { error } = await supabase.from('subscriptions').update({ status: 'active', current_period_end: d.current_period_end }).eq('user_id', d.user_id);
        if (error) throw error;
        return res.status(200).send('ok');
      }

      default:
        console.log('Unhandled event type', event.type);
        return res.status(200).send('ignored');
    }
  } catch (err) {
    console.error('Webhook handling error', err);
    return res.status(500).send('internal error');
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Subscription webhook listening on ${PORT}`));

module.exports = app;

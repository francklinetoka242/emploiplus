export async function sendInteraction(payload: { user_id?: string | null; service?: string | null; event_type?: string; payload?: any }) {
  try {
    await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // fail silently
    console.error('sendInteraction error', err);
  }
}

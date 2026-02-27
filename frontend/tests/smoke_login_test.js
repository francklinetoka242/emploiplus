// smoke_login_test.js
// Simule le parsing de la réponse de login comme dans `src/pages/admin/login/page.tsx`

// Minimal in-memory localStorage shim for Node
const localStorage = (function () {
  const store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    _dump: () => ({ ...store }),
  };
})();

function extractApiPayload(parsed) {
  return parsed && parsed.data && parsed.data.data ? parsed.data.data : parsed && parsed.data ? parsed.data : parsed;
}

function simulateLoginResponse(parsed) {
  const apiPayload = extractApiPayload(parsed);
  if (parsed && parsed.success) {
    localStorage.setItem('adminToken', apiPayload.token ?? '');
    localStorage.setItem('admin', JSON.stringify(apiPayload.admin ?? {}));
    return { ok: true, tokenStored: localStorage.getItem('adminToken'), admin: JSON.parse(localStorage.getItem('admin') || '{}') };
  }
  return { ok: false };
}

// Test cases
const cases = [
  {
    name: 'axios-style nested',
    parsed: { success: true, data: { data: { token: 'tok123', admin: { email: 'a@b' } } } },
  },
  {
    name: 'flat data',
    parsed: { success: true, data: { token: 'tok456', admin: { email: 'c@d' } } },
  },
  {
    name: 'top-level',
    parsed: { success: true, token: 'tok789', admin: { email: 'e@f' } },
  },
];

for (const c of cases) {
  localStorage.clear();
  const res = simulateLoginResponse(c.parsed);
  console.log(`Case: ${c.name}`);
  console.log('  success:', res.ok);
  console.log('  adminToken stored:', res.tokenStored);
  console.log('  admin stored:', res.admin);
  console.log('---');
}

// Dump final store for manual inspection
console.log('Final localStorage snapshot:', localStorage._dump());

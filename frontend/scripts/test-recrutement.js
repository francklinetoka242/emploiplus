import { chromium } from 'playwright';
import fs from 'fs';

async function waitForServer(url, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok || res.status === 200) return true;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

(async () => {
  try {
    const ports = [5173, 5174];
    let base = null;
    for (const p of ports) {
      const url = `http://localhost:${p}/recrutement`;
      try {
        const ok = await waitForServer(url, 10000);
        if (ok) { base = url; break; }
      } catch (e) {}
    }
    if (!base) {
      console.error('Dev server not reachable on ports 5173/5174');
      process.exit(2);
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();
    console.log('Opening', base);
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForSelector('button:has-text("Candidatures")', { timeout: 10000 });
    const btn = await page.$('button:has-text("Candidatures")');
    const text = await btn.innerText();
    console.log('Candidatures button text:', text);
    await btn.click();
    await page.waitForTimeout(1200);

    const allText = await page.content();
    fs.writeFileSync('test-recrutement-page.html', allText);
    console.log('Saved full page HTML to test-recrutement-page.html');

    const modal = await page.$('text="Dossier de candidature"') || await page.$('.fixed.inset-0');
    if (modal) {
      const html = await modal.innerHTML().catch(() => null);
      if (html) {
        fs.writeFileSync('test-recrutement-modal.html', html);
        console.log('Saved modal HTML to test-recrutement-modal.html');
      } else {
        console.log('Modal element found but could not extract innerHTML');
      }
    } else {
      console.log('No modal found; saved entire page HTML instead.');
    }

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
})();

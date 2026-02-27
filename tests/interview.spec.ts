import { test, expect } from '@playwright/test';

test('Interview simulator - mobile flow', async ({ page }) => {
  await page.goto('/interview-simulator');
  await expect(page.locator('text=Simulateur d\'entretien')).toBeVisible();

  await page.fill('input[placeholder="Ex: Développeur React"]', 'Développeur React');
  await page.click('text=Commencer la simulation');

  // Wait for first question
  await expect(page.locator('text=Parlez-moi de votre expérience professionnelle.')).toBeVisible();

  // Answer and proceed
  await page.fill('textarea[placeholder="Tapez votre réponse ici..."]', 'J\'ai travaillé 3 ans...');
  await page.click('text=Envoyer');

  // Expect next question or feedback
  await expect(page.locator('text=Question 2')).toBeVisible({ timeout: 5000 });
});

import { test, expect } from '@playwright/test';

test('CV editor - mobile flow', async ({ page }) => {
  await page.goto('/cv-generator');
  await expect(page.locator('text=Créateur de CV')).toBeVisible();

  // Create a new CV
  await page.click('text=Créer mon premier CV');
  await page.fill('input[placeholder="Votre nom"]', 'Test User');
  await page.fill('input[placeholder="votre@email.com"]', 'test@example.com');
  await page.click('text=Afficher l\'aperçu');

  // Ensure preview rendered
  await expect(page.locator('#cv-preview')).toBeVisible();
});

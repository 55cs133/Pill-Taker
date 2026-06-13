import { test, expect } from '@playwright/test';

test.describe('User Journey', () => {
  test('full registration, treatment creation, QR display, and logout', async ({ page }) => {
    // 1. Navigate to app
    await page.goto('/');

    // 2. Register new account
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await page.getByRole('button', { name: /register/i }).click();
    await page.getByLabelText(/name/i).fill('E2E User');
    await page.getByLabelText(/email/i).fill('e2e@test.com');
    await page.getByLabelText(/password/i).fill('e2epassword');
    await page.getByRole('button', { name: /^register$/i }).click();

    // 3. Verify dashboard loads
    await expect(page.getByText('E2E User')).toBeVisible();

    // 4. Create treatment
    await page.getByPlaceholder('Treatment name').fill('E2E Treatment');
    await page.getByPlaceholder('Hours between each take').fill('8');
    await page.getByPlaceholder('Medicine name').fill('E2E Med');
    await page.getByPlaceholder('Dosage of substance').fill('100mg');
    await page.getByPlaceholder('Amount of pills').fill('1');
    await page.getByRole('button', { name: /submit/i }).click();

    // 5. Verify treatment card appears
    await expect(page.getByText('E2E Treatment')).toBeVisible();

    // 6. Show QR code
    await page.getByRole('button', { name: /show qr/i }).click();
    const qrImage = page.locator('img[alt*="QR for E2E Treatment"]');
    await expect(qrImage).toBeVisible();

    // 7. Extract slug from QR image src and flash dose via API
    const qrSrc = await qrImage.getAttribute('src');
    expect(qrSrc).toContain('/treatments/');
    expect(qrSrc).toContain('/qr');

    // 8. Refresh history
    await page.getByRole('button', { name: /refresh history/i }).first().click();

    // 9. Logout
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });
});

test.describe('Unauthorized Access', () => {
  test('API returns 401 for protected routes without auth', async ({ request }) => {
    const res1 = await request.get('/treatments');
    expect(res1.status()).toBe(401);

    const res2 = await request.post('/treatments', { data: {} });
    expect(res2.status()).toBe(401);

    const res3 = await request.get('/user-info');
    expect(res3.status()).toBe(401);
  });

  test('API returns 404 for invalid flash slug', async ({ request }) => {
    const res = await request.post('/flash/invalid-slug-123');
    expect(res.status()).toBe(404);
  });
});

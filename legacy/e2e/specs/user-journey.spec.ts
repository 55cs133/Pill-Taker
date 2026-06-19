import { test, expect } from '@playwright/test';

test.describe('API End-to-End', () => {
  test('full flow: register, login, create treatment, generate QR, flash dose', async ({ request }) => {
    // 1. Register
    const registerRes = await request.post('/login/register', {
      data: { email: 'e2e@test.com', password: 'e2epass123', name: 'E2E User' },
    });
    expect(registerRes.status()).toBe(201);
    const registerBody = await registerRes.json();
    expect(registerBody.message).toBe('Welcome E2E User');
    expect(registerBody.user).toEqual({ name: 'E2E User', email: 'e2e@test.com' });

    // 2. Login
    const loginRes = await request.post('/login', {
      data: { email: 'e2e@test.com', password: 'e2epass123' },
    });
    expect(loginRes.status()).toBe(200);
    const cookies = loginRes.headers()['set-cookie'];
    expect(cookies).toContain('session_token=');

    // 3. Create treatment
    const treatmentRes = await request.post('/treatments', {
      data: {
        treatmentName: 'E2E Treatment',
        interval: '8',
        medicines: [{ name: 'E2E Med', dosage: '100mg', quantity: '1' }],
      },
      headers: { Cookie: cookies },
    });
    expect(treatmentRes.status()).toBe(201);
    const treatment = await treatmentRes.json();
    expect(treatment.name).toBe('E2E Treatment');
    expect(treatment.interval).toBe(8);
    expect(treatment.slug).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

    // 4. List treatments (scoped to user)
    const listRes = await request.get('/treatments', {
      headers: { Cookie: cookies },
    });
    expect(listRes.status()).toBe(200);
    const treatments = await listRes.json();
    expect(treatments).toHaveLength(1);
    expect(treatments[0].name).toBe('E2E Treatment');

    // 5. Generate QR code
    const qrRes = await request.get(`/treatments/${treatment.id}/qr`, {
      headers: { Cookie: cookies },
    });
    expect(qrRes.status()).toBe(200);
    expect(qrRes.headers()['content-type']).toContain('image/svg+xml');
    const qrBody = await qrRes.text();
    expect(qrBody).toContain('<svg');

    // 6. Flash QR code (public, no auth)
    const flashRes = await request.post(`/flash/${treatment.slug}`);
    expect(flashRes.status()).toBe(200);
    const flashBody = await flashRes.json();
    expect(flashBody.message).toBe('Dose recorded successfully');
    expect(flashBody.dose.treatmentName).toBe('E2E Treatment');

    // 7. Verify dose history
    const dosesRes = await request.get(`/treatments/${treatment.id}/doses`, {
      headers: { Cookie: cookies },
    });
    expect(dosesRes.status()).toBe(200);
    const doses = await dosesRes.json();
    expect(doses).toHaveLength(1);
    expect(doses[0].confirmedVia).toBe('qr_scan');

    // 8. Logout
    const logoutRes = await request.post('/login/logout', {
      headers: { Cookie: cookies },
    });
    expect(logoutRes.status()).toBe(200);
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

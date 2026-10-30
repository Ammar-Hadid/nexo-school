import { expect, test } from '@playwright/test';

test('built app keeps local identity disabled without explicit synthetic configuration', async ({
  request,
}) => {
  const response = await request.post('/api/auth/sign-in/email', {
    data: {
      email: 'guardian@example.invalid',
      password: 'synthetic-only-password',
    },
  });
  expect(response.status()).toBe(503);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(await response.json()).toEqual({
    error: 'LOCAL_IDENTITY_UNAVAILABLE',
  });
  expect(response.headers()['set-cookie']).toBeUndefined();
});

for (const method of ['get', 'post', 'patch', 'delete'] as const) {
  test(`built app keeps student resources disabled: ${method}`, async ({
    request,
  }) => {
    const response = await request[method](
      '/api/identity/students/00000000-0000-0000-0000-000000000000',
    );
    expect(response.status()).toBe(503);
    expect(response.headers()['cache-control']).toBe('no-store');
    expect(await response.json()).toEqual({
      error: 'LOCAL_IDENTITY_UNAVAILABLE',
    });
    expect(response.headers()['set-cookie']).toBeUndefined();
  });
}

for (const path of [
  '/student/enroll',
  '/student/approve',
  '/passkey/verify-authentication',
]) {
  test(`built app keeps D04 disabled: ${path}`, async ({ request }) => {
    const response = await request.post(`/api/auth${path}`, { data: {} });
    expect(response.status()).toBe(503);
    expect(response.headers()['set-cookie']).toBeUndefined();
    expect(response.headers()['cache-control']).toBe('no-store');
  });
}

for (const method of ['get', 'post'] as const) {
  test(`D05 assignment route fails closed without synthetic configuration: ${method}`, async ({
    request,
  }) => {
    const response = await request[method](
      '/api/practice/assignments/00000000-0000-0000-0000-000000000000',
    );
    expect(response.status()).toBe(503);
    expect(response.headers()['cache-control']).toBe('no-store');
    expect(await response.json()).toEqual({
      error: 'LOCAL_IDENTITY_UNAVAILABLE',
    });
  });
}
test('built HTML, RSC and loaded browser scripts exclude the D05 private seed/evaluator', async ({
  page,
  request,
}) => {
  const responses: Promise<string>[] = [];
  page.on('response', (response) => {
    if (response.request().resourceType() === 'script')
      responses.push(response.text());
  });
  const html = await request.get('/');
  const rsc = await request.get('/', { headers: { RSC: '1' } });
  expect(html.status()).toBe(200);
  expect(rsc.status()).toBe(200);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  for (const body of [
    await html.text(),
    await rsc.text(),
    ...(await Promise.all(responses)),
  ]) {
    for (const privateMarker of [
      'synthetic-addition-seed-v1',
      'counting-oracle-v1',
      'd05-add-v1-',
      'integer-exact-v1',
      'ArithmeticQuestionVersion',
    ])
      expect(body).not.toContain(privateMarker);
  }
});

for (const endpoint of ['attempts', 'progress']) {
  test(`D06 remains disabled without synthetic identity: ${endpoint}`, async ({
    request,
  }) => {
    const path = `/api/practice/assignments/00000000-0000-0000-0000-000000000000/${endpoint}`;
    const response =
      endpoint === 'attempts'
        ? await request.post(path, { data: {} })
        : await request.get(path);
    expect(response.status()).toBe(503);
    expect(response.headers()['cache-control']).toBe('no-store');
    expect(await response.json()).toEqual({
      error: 'LOCAL_IDENTITY_UNAVAILABLE',
    });
  });
}

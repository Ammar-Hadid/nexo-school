import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import catalogue from '../../src/components/nexai/nexai-layered-catalogue.json' with { type: 'json' };

// Synthetic presentation responses only; real authorization/persistence is
// covered by test:saved. Asset requests always hit the standalone server.
for (const failedArtwork of [false, true]) {
  test(`standalone saved exercise assets${failedArtwork ? ' with artwork failure' : ''}`, async ({
    page,
    request,
  }, testInfo) => {
    // D04-M1 gates the saved route before loading the presentation fixtures.
    // This asset-only test mocks that public status; test:saved owns real auth.
    await page.route('**/api/auth/portal-session', (route) =>
      route.fulfill({ json: { role: 'student' } }),
    );
    const requested = new Set<string>();
    page.on('request', (req) => {
      if (req.url().includes('/nexai/'))
        requested.add(new URL(req.url()).pathname);
    });
    if (failedArtwork)
      await page.route('**/nexai/**', (route) => route.abort());
    const progress = {
      revision: 1,
      next: { itemId: 'two', attemptNumber: 1 },
      outcomes: ['first', 'open'],
      result: null,
    };
    await page.route('**/api/practice/assignments/asset-check', (route) =>
      route.fulfill({
        json: {
          id: 'asset-check',
          studentId: 'synthetic',
          revision: 1,
          subject: 'Rekenen',
          category: 'Optellen',
          items: [
            {
              id: 'one',
              position: 0,
              prompt: '1 + 3 = ?',
              responseType: 'integer',
            },
            {
              id: 'two',
              position: 1,
              prompt: '2 + 3 = ?',
              responseType: 'integer',
            },
          ],
        },
      }),
    );
    await page.route(
      '**/api/practice/assignments/asset-check/progress',
      (route) =>
        route.fulfill({
          json: {
            progress,
            lastSubmission: {
              attemptId: 'synthetic',
              itemId: 'one',
              attemptNumber: 1,
              submitted: '4',
              correct: true,
              progress,
            },
            presentation: {
              version: 1,
              progressRevision: 1,
              acknowledgedRevision: 0,
              answer: '',
              requestId: null,
            },
          },
        }),
    );
    await page.goto('/student/assignments/asset-check');
    const artwork = page.locator('svg[data-pose]');
    await expect(artwork).toHaveAttribute(
      failedArtwork ? 'data-asset-error' : 'data-ready',
      'true',
    );
    await expect(page.getByText('✓ Goed!', { exact: true })).toBeVisible();
    const continueButton = page.getByRole('button', { name: 'Verder' });
    await expect(continueButton).toBeEnabled();
    await continueButton.focus();
    await expect(continueButton).toBeFocused();
    const poseId = await artwork.getAttribute('data-pose');
    const pose = catalogue.find((item) => item.id === poseId)!;
    expect([...requested].sort()).toEqual([pose.asset, pose.eyes].sort());
    if (!failedArtwork) {
      for (const [url, hash] of [
        [pose.asset, pose.sha256],
        [pose.eyes, pose.eyeSha256],
      ]) {
        const response = await request.get(url!);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('image/png');
        expect(
          createHash('sha256')
            .update(await response.body())
            .digest('hex'),
        ).toBe(hash);
      }
      expect((await request.get('/nexai/motion-v2/rest.png')).status()).toBe(
        404,
      );
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() =>
          ['Nexo Outfit', 'Nexo Lexend'].every((family) =>
            document.fonts.check(`18px "${family}"`),
          ),
        ),
      ).toBe(true);
      const resources = await page.evaluate(() =>
        performance
          .getEntriesByType('resource')
          .map((entry) => {
            const resource = entry as PerformanceResourceTiming;
            return {
              path: new URL(resource.name).pathname,
              transferred: resource.transferSize,
              encoded: resource.encodedBodySize,
              decoded: resource.decodedBodySize,
            };
          })
          .filter((entry) => /\.(png|ttf|js|css)$/.test(entry.path)),
      );
      expect(
        resources.filter((entry) => entry.path.endsWith('.ttf')),
      ).toHaveLength(2);
      await writeFile(
        testInfo.outputPath('asset-network.json'),
        JSON.stringify(resources, null, 2),
      );
      await testInfo.attach('asset-network.json', {
        body: JSON.stringify(resources, null, 2),
        contentType: 'application/json',
      });
    }
    await page.screenshot({
      path: testInfo.outputPath(
        failedArtwork ? 'artwork-failed.png' : 'artwork-loaded.png',
      ),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath('phone.png'),
      fullPage: true,
    });
  });
}

test('standalone serves every approved pose with its frozen bytes', async ({
  request,
}) => {
  for (const pose of catalogue) {
    for (const [url, hash] of [
      [pose.asset, pose.sha256],
      [pose.eyes, pose.eyeSha256],
    ]) {
      const response = await request.get(url!);
      expect(response.status()).toBe(200);
      expect(
        createHash('sha256')
          .update(await response.body())
          .digest('hex'),
      ).toBe(hash);
    }
  }
});

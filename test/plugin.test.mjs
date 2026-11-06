import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

describe('HDFull login screen v1.0.0', () => {
  it('uses Kino visualBrowser and an encrypted password setting', async () => {
    const src = await readFile('src/plugin.js', 'utf8');
    const manifest = JSON.parse(await readFile('kino-plugin.json', 'utf8'));
    assert.match(src, /kino\.visualBrowser\.open/);
    assert.match(src, /storeAs:/);
    assert.equal(manifest.visualBrowser, true);
    assert.equal(manifest.settings[0].type, 'password');
  });
  it('does not auto-close the visual login window on its login URL', async () => {
    const src = await readFile('src/plugin.js', 'utf8');
    assert.doesNotMatch(src, /doneWhen:\s*\{\s*urlMatches/);
  });
  it('shows the login-required screen before a session exists', async () => {
    globalThis.kino = { config: { get: () => '' } };
    const mod = await import('../src/plugin.js?test=unauth');
    const view = await mod.screen();
    assert.match(JSON.stringify(view), /Inicio de sesión requerido/);
    assert.match(JSON.stringify(view), /hdfull\.login/);
  });
});

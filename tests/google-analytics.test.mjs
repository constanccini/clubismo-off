import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { googleAnalyticsTag } from '../lib/google-analytics.ts';

test('sem ID de medição, não carrega nem inicializa o Analytics', () => {
  for (const value of ['', '   ', undefined, null, 123, 'G-', 'UA-123-1', 'GTM-ABC']) {
    assert.equal(googleAnalyticsTag(value), null);
  }
});

test('ID não pode injetar script ou parâmetros na tag', () => {
  for (const value of ['G-X</script><script>alert(1)</script>', "G-X');alert(1)//", 'G-X&other=1']) {
    assert.equal(googleAnalyticsTag(value), null);
  }
});

test('a tag válida preserva a fila e usa uma única configuração para visitas automáticas', () => {
  const tag = googleAnalyticsTag(' g-TEST123456 ');
  assert.equal(tag.src, 'https://www.googletagmanager.com/gtag/js?id=G-TEST123456');
  const queued = ['existing-event'];
  const context = { dataLayer: [queued] };
  context.window = context;
  runInNewContext(tag.bootstrap, context);
  assert.equal(context.dataLayer[0], queued);
  assert.equal(context.dataLayer.length, 3);
  assert.equal(context.dataLayer[1][0], 'js');
  const config = context.dataLayer[2];
  assert.equal(config[0], 'config');
  assert.equal(config[1], 'G-TEST123456');
  assert.equal(config[2].send_page_view, undefined);
  assert.equal(config[2].allow_google_signals, false);
  assert.equal(config[2].allow_ad_personalization_signals, false);
});

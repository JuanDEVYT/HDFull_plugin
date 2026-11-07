import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseCards } from '../src/hdfull.js';

describe('HDFull v1.0.1', () => {
  it('parses sample cards from HTML', () => {
    const sample = `
      <div class="item">
        <a href="https://www3.hdfull.one/pelicula/gladiator-ii" title="Gladiator II (2024)">
          <img src="/thumbs/gladiator.jpg" alt="Gladiator II (2024)" />
        </a>
      </div>
      <div class="span-6">
        <a href="/serie/arcane" title="Arcane (2021)">
          <img data-src="/thumbs/arcane.jpg" />
        </a>
      </div>
    `;
    const cards = parseCards(sample);
    assert.equal(cards.length, 2);
    assert.equal(cards[0].title, "Gladiator II");
    assert.equal(cards[0].kind, "movie");
    assert.equal(cards[0].year, 2024);
    assert.equal(cards[1].title, "Arcane");
    assert.equal(cards[1].kind, "series");
    assert.equal(cards[1].year, 2021);
  });

  it('exports required Kino functions', async () => {
    const code = await readFile('plugin.js', 'utf8');
    assert.match(code, /home/);
    assert.match(code, /browse/);
    assert.match(code, /search/);
    assert.match(code, /details/);
    assert.match(code, /episodes/);
    assert.match(code, /resolve/);
    assert.match(code, /screen/);
  });
});

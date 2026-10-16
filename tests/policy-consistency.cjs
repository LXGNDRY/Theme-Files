const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const files = [
  'sections/header-group.json',
  'sections/lb-product-page.liquid',
  'sections/lb-stat-strip.liquid',
  'templates/index.json',
  'templates/product.json',
  'templates/product.clear-pvc-stadium-travel.json',
  'templates/product.clear-pvc-travel-bag.json',
  'templates/product.featured-productss.json',
  'templates/product.lb-product-page.json',
  'templates/product.legendary-d20-speaker.json',
  'templates/product.legendary-x20-speaker.json',
];

const storefrontCopy = files
  .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
  .join('\n');

assert.doesNotMatch(storefrontCopy, /free worldwide shipping/i);
assert.doesNotMatch(storefrontCopy, /free shipping on all orders/i);
assert.doesNotMatch(storefrontCopy, /responsibility of the customer unless otherwise stated at checkout/i);
assert.doesNotMatch(storefrontCopy, /all orders are processed within <strong>2 business days/i);
assert.doesNotMatch(storefrontCopy, /2[–-]3 business days/i);
assert.match(storefrontCopy, /2–5 business days/);
assert.match(storefrontCopy, /Standard shipping is \$5 USD on orders under \$100 USD/);
assert.match(storefrontCopy, /Express shipping is available for \$12 USD/);
assert.match(storefrontCopy, /Applicable duties and taxes are calculated and collected at checkout/);

console.log('PASS: storefront shipping claims match configured rates and checkout collection');

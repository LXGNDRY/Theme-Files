const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');

const layout = fs.readFileSync(path.resolve(__dirname, '../layout/theme.liquid'), 'utf8');

assert.match(layout, /window\.addEventListener\('load',loadGTM,\{once:true\}\)/);
assert.match(layout, /document\.addEventListener\(e,onInteract,\{passive:true,capture:true,once:true\}\)/);
assert.match(layout, /window\.dataLayer\.push\(\{'gtm\.start':new Date\(\)\.getTime\(\),event:'gtm\.js'\}\)/);
assert.doesNotMatch(layout, /rel="preconnect" href="https:\/\/www\.googletagmanager\.com"/);
assert.doesNotMatch(layout, /var CONVERSION_PAGES/);

console.log('PASS: GTM queues data, loads after interaction/load, and does not reserve an early connection');

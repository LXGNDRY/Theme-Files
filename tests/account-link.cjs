const {Liquid}=require('liquidjs');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../snippets/header-actions.liquid'),'utf8');
const account=source.slice(source.indexOf('  {% if shop.customer_accounts_enabled %}'),source.indexOf("  {% if settings.cart_type == 'drawer'"));
const engine=new Liquid();
engine.registerFilter('t',key=>key==='content.account_title'?'Account':key);
const routes={account_url:'/fr/account',account_login_url:'/fr/account/login'};
(async()=>{
 for(const display_style of ['icon','text']) {
  for(const customer of [null,{id:1}]) {
   const html=await engine.parseAndRender(account,{shop:{customer_accounts_enabled:true},routes,customer,display_style,account_icon:'<svg></svg>'});
   assert(html.includes('href="'+(customer?routes.account_url:routes.account_login_url)+'"'));
   assert(html.includes('aria-label="Account"'));
   assert(!html.includes('<shopify-account'));
   assert(html.includes('<svg>'));
  }
 }
 const disabled=await engine.parseAndRender(account,{shop:{customer_accounts_enabled:false},routes});assert(!disabled.includes('<a'));
 const css=fs.readFileSync(path.join(__dirname,'../assets/chaos-theme-styles.css'),'utf8');assert(css.includes(':has(shopify-account, .account-button__link)'));
 console.log('PASS account links: guest/member localized routes, icon/text modes, account-disabled state, mobile selector');
})().catch(e=>{console.error(e);process.exitCode=1});

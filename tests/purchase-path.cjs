const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function element(dataset = {}, selected = false) {
  const classes = new Set(selected ? ['is-selected'] : []);
  return {dataset, style:{}, value:'', disabled:false, textContent:'', handlers:{},
    classList:{contains:k=>classes.has(k),remove:k=>classes.delete(k),toggle(k,on){on?classes.add(k):classes.delete(k)}},
    addEventListener(k,f){this.handlers[k]=f},setAttribute(k,v){this[k]=v},getAttribute(k){return this[k]}};
}
const buttons=[element({optionIndex:'0',optionValue:'Red'},true),element({optionIndex:'0',optionValue:'Blue'}),element({optionIndex:'1',optionValue:'S'},true),element({optionIndex:'1',optionValue:'M'})];
const form=element();
const input=element(); input.value='1'; input.form=form;
const atc=element(); const image=element();
const variants=[{id:1,option1:'Red',option2:'S',available:true,price:5500},{id:2,option1:'Blue',option2:'M',available:true,price:6000,featured_image:{src:'https://cdn.shopify.com/s/files/blue_hoodie.jpg?v=123',alt:'Blue hoodie'}}];
const nodes={'lb-pdp-variant-id':input,'lb-pdp-atc':atc,'lb-pdp-main-img':image,'lb-pdp-price':element(),'lb-pdp-variants-json':{textContent:JSON.stringify(variants)}};
const document={getElementById:k=>nodes[k]||null,querySelectorAll(q){if(q==='.lb-pdp__opt-btn')return buttons;if(q.includes('data-option-index=')){const idx=q.match(/index="(\d)"/)[1];return buttons.filter(b=>b.dataset.optionIndex===idx)}return []},querySelector:()=>null,addEventListener(){},dispatchEvent(){}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/lb-product-page.js'),'utf8'),{document,window:{location:{href:'https://example.com/products/hoodie'}},URL,CustomEvent:function(){}});
buttons[1].handlers.click();
assert.equal(input.value,''); assert.equal(atc.disabled,true);
let prevented=false;form.handlers.submit({preventDefault(){prevented=true}});assert.equal(prevented,true);
buttons[3].handlers.click();assert.equal(input.value,2);assert.equal(atc.disabled,false);
const url=new URL(image.src);assert.equal(url.pathname,'/s/files/blue_hoodie.jpg');assert.equal(url.searchParams.get('v'),'123');assert.equal(url.searchParams.get('width'),'1000');
assert.equal(buttons[3]['aria-pressed'],'true');
console.log('PASS: invalid combination blocks submission, valid combination recovers, image URL preserves version, pressed state updates');
const layout=fs.readFileSync(path.join(root, 'layout/theme.liquid'),'utf8');
const fn=layout.match(/function isNoiseContext\(\)\{[\s\S]*?\n    \}/)[0];
function noise(search){const w={location:{search}};w.top=w;w.self=w;return vm.runInNewContext('('+fn+')()',{window:w,URLSearchParams});}
assert.equal(noise('?utm_campaign=fall_school'),false);
assert.equal(noise('?utm_campaign=preview_theme_id_launch'),false);
assert.equal(noise('?preview_theme_id=123'),true);
assert.equal(noise('?_sc=1'),true);
assert.equal(noise('?pb=0'),true);
assert.equal(noise('?pb=1'),false);
console.log('PASS: campaign values retain analytics; actual preview/debug parameters suppress it');

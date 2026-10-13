const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../assets/component-cart-items.js'), 'utf8').replace(/^import[\s\S]*?;\n/gm, '');
function classes() { const s = new Set(['hidden']); return {add:k=>s.add(k),remove:k=>s.delete(k),contains:k=>s.has(k)}; }
class Element { constructor(){this.classList=classes();this.dataset={};} }
class Component extends Element { constructor(){super();this.refs={};this.events=[];} dispatchEvent(e){this.events.push(e);} }
async function run(result, reject=false) {
  let resolve, rejectRequest;
  const request = new Promise((a,b)=>{resolve=a;rejectRequest=b;});
  const morphs=[], renders=[];
  const context={Component,HTMLElement:Element,Node:Element,document:{querySelectorAll:()=>[]},window:{location:{pathname:'/cart'}},Theme:{routes:{cart_change_url:'/cart/change'},translations:{cart_update_error:'Please try again'}},fetch:()=>request,fetchConfig:(type,opts)=>opts,debounce:f=>f,resetShimmer(){},sectionRenderer:{renderSection(id){renders.push(id);return Promise.resolve();}},morphSection:(...a)=>morphs.push(a),cartPerformance:{createStartingMarker:()=>0,measureFromMarker(){}},ThemeEvents:{},QuantitySelectorUpdateEvent:class {},CartAddEvent:class {},DiscountUpdateEvent:class {},CartUpdateEvent:class {constructor(cart,id,data){this.cart=cart;this.data=data;}},console:{error(){}},customElements:{get:()=>false,define(name,C){context.Cart=C;}}};
  vm.runInNewContext(source,context);
  const cart=new context.Cart();cart.dataset.sectionId='cart-section';
  const input={value:'3',defaultValue:'2'};
  const error=new Element();const container=new Element();
  let removed=false;
  cart.refs={quantitySelectors:[{querySelector:()=>input}],cartItemRows:[{remove(){removed=true}}],'cartItemError-1':error,'cartItemErrorContainer-1':container};
  const pending=cart.onLineItemRemove(1);
  assert.equal(removed,false);assert.equal(cart.classList.contains('cart-items-disabled'),true);
  if(reject)rejectRequest(new Error('offline'));else resolve({ok:result.ok,json:async()=>result.data});
  await pending;
  assert.equal(cart.classList.contains('cart-items-disabled'),false);
  return {cart,input,error,container,morphs,renders,removed};
}
(async()=>{
 let r=await run({},true);assert.equal(r.input.value,'2');assert.equal(r.removed,false);assert.equal(r.error.textContent,'Please try again');assert.equal(r.container.classList.contains('hidden'),false);
 r=await run({ok:false,data:{description:'Quantity not available'}});assert.equal(r.input.value,'2');assert.equal(r.error.textContent,'Quantity not available');assert.equal(r.morphs.length,0);
 r=await run({ok:true,data:{item_count:0,items:[],sections:{'cart-section':'<div>Empty</div>'}}});assert.equal(r.morphs.length,1);assert.equal(r.cart.events[0].data.itemCount,0);
 r=await run({ok:true,data:{item_count:0,items:[],sections:{'cart-section':null}}});assert.equal(r.renders.length,1);assert.equal(r.morphs.length,0);
 console.log('PASS cart recovery: removal waits, network/HTTP failures preserve items, confirmed changes render, null sections refetch');
})().catch(e=>{console.error(e);process.exitCode=1;});

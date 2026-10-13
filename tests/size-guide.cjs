const {Liquid}=require('liquidjs');
const fs=require('fs');const assert=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'..')+'/';
const engine=new Liquid();
const snippet=fs.readFileSync(root+'snippets/lb-size-guide.liquid','utf8').replace(/\{%-? doc -?%\}[\s\S]*?\{%-? enddoc -?%\}/,'').split('<script>')[0];
const section=fs.readFileSync(root+'sections/lb-product-page.liquid','utf8');
const assign=section.match(/\{%- liquid[\s\S]*?-%\}/)[0];
const modal=section.slice(section.indexOf('{%- if show_size_guide -%}'),section.indexOf('{%- comment -%} ── Main product section'));
function product(description,custom){return {id:1,description,options:['Size'],metafields:{custom:{size_guide:{value:custom}}}};}
(async()=>{
for(const template of [snippet,assign+modal]){
 let html=await engine.parseAndRender(template,{product:product('<h2>Size Guide</h2><table><tr><td>Verified 27.5</td></tr></table>',''),section:{settings:{}}});assert(html.includes('Verified 27.5'));assert(!html.includes('Model wears size M'));assert(!html.includes('38–40'));
 html=await engine.parseAndRender(template,{product:product('<table><tr><td>Description chart</td></tr></table>','<table><tr><td>Override chart</td></tr></table>'),section:{settings:{}}});assert(html.includes('Override chart'));assert(!html.includes('Description chart'));
 html=await engine.parseAndRender(template,{product:product('No size data',''),section:{settings:{}}});assert(!html.includes('<table'));assert(!html.includes('lb-size-guide__trigger'));assert(!html.includes('role="dialog"'));
}
console.log('PASS rendered size guides: product description fallback, override precedence, no generic chart without data');
})().catch(e=>{console.error(e);process.exitCode=1});

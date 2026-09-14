const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), ts = require('typescript');
function load(file, mocks) {
 const exports = {};
 const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(js,{exports,require:n=>{if(n in mocks)return mocks[n];throw Error('Unexpected import '+n)},console,process});
 return exports;
}
(async()=>{
 let state='active';
 const route=load('src/app/listing/[[...listingName]]/page.tsx',{
  'react/jsx-runtime':{},'next/headers':{headers:async()=>({})},'next/navigation':{},
  '@configs/content':{default:{missingPropertyMetadata:{title:'Missing',robots:{index:true,follow:true}}}},'@configs/routes':{default:{}},'@templates':{},'components/atoms':{},
  'utils/properties':{withdrawn:()=>state==='withdrawn',formatMetadata:()=>({title:'Condo',robots:{index:true,follow:true,googleBot:{index:true}}})},
  'utils/properties/seo':{},'utils/structuredData':{},'utils/urls':{getProtocolHost:()=> 'https://precondo.ca'},
  './utils':{parseParams:()=>({listingId:'id'}),fetchProperty:async()=>{if(state==='error')throw Error('Unavailable');return {}}}
 });
 for(state of ['active','withdrawn','error']) {
  const m=await route.generateMetadata({params:{},searchParams:{}});
  assert.equal(m.robots.index,false,state);assert.equal(m.robots.follow,false,state);
  assert.equal(m.robots.googleBot.index,false,state);assert.equal(m.robots.googleBot.follow,false,state);
 }
 class Response {constructor(body,opts){this.body=body;Object.assign(this,opts)}}
 const retired=load('src/app/listings.xml/route.ts',{'next/server':{NextResponse:Response}});
 const r=await retired.GET();assert.equal(r.status,410);assert.equal(r.headers['X-Robots-Tag'],'noindex, nofollow');
 const text=fs.readFileSync('src/app/locations/[[...slugs]]/page.tsx','utf8');assert.ok(text.includes('return generatePropertyMetadata('),'Legacy listing aliases share noindex metadata');
 console.log('Passed: active, withdrawn and failed listing metadata; retired sitemap; shared alias metadata');
})();

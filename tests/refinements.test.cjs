const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../docs/assets/studio-refinements.js'),'utf8');
const clip={name:'Giọng Lunis',src:'data:audio/mpeg;base64,SUQz'};
function fixture(){
 const elements=new Map(),players=[];
 const element=id=>{if(!elements.has(id))elements.set(id,{textContent:'',setAttribute(){},disabled:false});return elements.get(id);};
 const context=vm.createContext({console,Blob,setTimeout,clearTimeout,Math,Option:class{},
  window:{addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},
  document:{addEventListener(){},getElementById:element,querySelectorAll(){return []}},
  Audio:class {constructor(){players.push(this);this.paused=true}pause(){this.paused=true}load(){}removeAttribute(){this.src=''}play(){this.paused=false;return Promise.resolve()}},
  champions:[{id:'a',voices:[clip,null]},{id:'b',voices:[null,null]}],currentChampIndex:0,isEditMode:false,
  customAlert(message){context.alerts.push(message)},alerts:[],saves:0,saveData:async()=>{context.saves++;return true}
 });vm.runInContext(source,context);
 return {context,players,run:code=>vm.runInContext(code,context)};
}
test('legacy data stays compatible; reject arbitrary URLs and oversized or invalid audio',()=>{
 const {context,run}=fixture();context.clip=clip;
 assert.equal(run('normalizeVoices(undefined).filter(Boolean).length'),0);
 assert.equal(run('normalizeVoices([clip,clip,clip]).filter(Boolean).length'),2);
 assert.equal(run('normalizeVoices([{src:"https://example.com/track.mp3"}])[0]'),null);
 assert.equal(run('normalizeVoices([{src:"data:text/html;base64,SUQz"}])[0]'),null);
 assert.equal(run('normalizeVoices([{src:"data:audio/mpeg;base64,"+"A".repeat(3000000)}])[0]'),null);
 assert.equal(run('JSON.parse(JSON.stringify(normalizeVoices([clip])))[0].src'),clip.src);
});
test('each opening chooses one clip and reuses a single player; mute and edit suppress autoplay',async()=>{
 const {context,players,run}=fixture();context.champions[0].voices=[clip,{name:'Hai',src:'data:audio/mpeg;base64,QUJD'}];
 context.Math=Object.create(Math);context.Math.random=()=>.99;
 await run('playChampionVoice()');assert.equal(players.length,1);assert.match(players[0].src,/QUJD$/);
 context.Math.random=()=>0;await run('playChampionVoice()');assert.equal(players.length,1);assert.equal(players[0].src,clip.src);
 run('toggleVoiceMute()');assert.equal(players[0].paused,true);await run('playChampionVoice()');assert.equal(players[0].src,'');
 run('toggleVoiceMute()');context.isEditMode=true;await run('playChampionVoice()');assert.equal(players[0].src,'');
 await run('playChampionVoice(1,true)');assert.match(players[0].src,/QUJD$/);
 run('stopChampionVoice()');assert.equal(players[0].paused,true);
});
test('a slow upload remains attached to the original champion after navigation',async()=>{
 const {context,run}=fixture();context.isEditMode=true;
 context.input={files:[{name:'moon.mp3',type:'audio/mpeg',size:500}],value:'selected'};
 let release;context.read=()=>new Promise(resolve=>release=resolve);
 run('voiceFileDuration=async()=>5;fileAsDataUrl=read');
 const pending=run('uploadChampionVoice(input,1)');await Promise.resolve();await Promise.resolve();
 context.currentChampIndex=1;release(clip.src);await pending;
 assert.equal(context.champions[0].voices[1].src,clip.src);assert.equal(context.champions[1].voices[1],null);assert.equal(context.saves,1);
});
test('importing a different snapshot during upload cancels attachment',async()=>{
 const {context,run}=fixture();context.isEditMode=true;context.input={files:[{name:'moon.mp3',type:'audio/mpeg',size:500}],value:''};
 let release;context.read=()=>new Promise(resolve=>release=resolve);run('voiceFileDuration=async()=>5;fileAsDataUrl=read');
 const pending=run('uploadChampionVoice(input,1)');await Promise.resolve();await Promise.resolve();
 context.champions=[{id:'replacement',voices:[null,null]}];release(clip.src);await pending;
 assert.equal(context.saves,0);assert.equal(context.champions[0].voices[1],null);assert.equal(context.alerts.length,1);
});
test('oversized and long uploads leave existing voice untouched',async()=>{
 const {context,run}=fixture();context.isEditMode=true;context.input={files:[{name:'large.mp3',type:'audio/mpeg',size:3000000}],value:''};
 await run('uploadChampionVoice(input,0)');assert.equal(context.saves,0);assert.equal(context.champions[0].voices[0],clip);
 context.input.files[0].size=500;run('voiceFileDuration=async()=>31');await run('uploadChampionVoice(input,0)');assert.equal(context.saves,0);assert.equal(context.champions[0].voices[0],clip);
});
test('both role slots create custom filters and match legacy spacing, accents and case',()=>{
 const {context,run}=fixture();
 context.champions=[{roles:['  ĐẤU   SĨ\n','Dị Năng']},{roles:['Dị Năng','phap su']}];
 const labels=Array.from(run('championRoleOptions(champions)'));
 assert.equal(labels.filter(x=>x==='Đấu Sĩ').length,1);
 assert.equal(labels.filter(x=>x==='Dị Năng').length,1);
 assert.equal(labels.filter(x=>x==='Pháp Sư').length,1);
 assert.equal(run("matchesChampionRole(champions[0],'Đấu Sĩ')"),true);
 assert.equal(run("matchesChampionRole(champions[0],'dị năng')"),true);
 assert.equal(run("matchesChampionRole(champions[1],'Pháp Sư')"),true);
 assert.equal(run("matchesChampionRole(champions[0],'Xạ Thủ')"),false);
 context.champions[0].roles[1]='';context.champions[1].roles[0]='';
 assert.equal(run("championRoleOptions(champions).includes('Dị Năng')"),false);
});
test('role editing updates the record before blur and persists both fields together',async()=>{
 const {context,run}=fixture();context.isEditMode=true;
 run("document.getElementById('p-role1').innerText='  đấu sĩ ';document.getElementById('p-role2').innerText='Dị Năng';syncEditedRoles()");
 assert.deepEqual(Array.from(context.champions[0].roles),['Đấu Sĩ','Dị Năng']);
 assert.equal(run("matchesChampionRole(champions[0],'Dị Năng')"),true);
 run("document.getElementById('p-role2').innerText='Trợ   Thủ';syncEditedRoles()");
 await new Promise(resolve=>setTimeout(resolve,400));
 assert.equal(context.saves,1);assert.deepEqual(Array.from(context.champions[0].roles),['Đấu Sĩ','Trợ Thủ']);
 assert.equal(run("matchesChampionRole(champions[0],'Dị Năng')"),false);
});

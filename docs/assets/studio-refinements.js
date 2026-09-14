/* Shared helpers load before the core so old JSON also passes through normalization. */
const MOUR_VOICE_MAX_BYTES = 2 * 1024 * 1024;
const MOUR_AUDIO_TYPES = new Set(['audio/mpeg','audio/mp3','audio/mp4','audio/x-m4a','audio/ogg','audio/wav','audio/x-wav','audio/wave','audio/webm']);
function normalizeVoices(input) {
    return [0,1].map(index => {
        const clip=Array.isArray(input)?input[index]:null;
        if(!clip || typeof clip.src!=='string' || clip.src.length>Math.ceil(MOUR_VOICE_MAX_BYTES/3)*4+100) return null;
        const match=/^data:(audio\/[a-z0-9-]+);base64,([a-z0-9+/]+={0,2})$/i.exec(clip.src);
        if(!match || !MOUR_AUDIO_TYPES.has(match[1].toLowerCase())) return null;
        return {name:typeof clip.name==='string'?clip.name.slice(0,160):'Giọng '+(index+1),src:clip.src};
    });
}

let activeRoleFilter='Tất cả', activePositionFilter='';
function refreshPositionFilter() {
    const select=document.getElementById('position-filter');
    const positions=[...new Set(champions.map(c=>(c.position||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'vi'));
    select.replaceChildren(new Option('Tất cả vị trí',''));
    positions.forEach(position=>select.add(new Option(position,position)));
    if(!positions.includes(activePositionFilter)) activePositionFilter='';
    select.value=activePositionFilter;
}
function filterPosition(value) { activePositionFilter=value;renderList(activeRoleFilter); }
function resetChampionFilters() {
    activeRoleFilter='Tất cả';activePositionFilter='';refreshPositionFilter();
    document.querySelectorAll('#role-filters button').forEach((button,index)=>{
        button.classList.toggle('active',index===0);button.setAttribute('aria-pressed',String(index===0));
    });
}

let voicePlayer=null,voiceSequence=0,voiceMuted=false,voiceUploadCount=0;
try { voiceMuted=localStorage.getItem('MourVoiceMuted')==='true'; } catch {}
function stopChampionVoice() {
    voiceSequence++;
    if(voicePlayer){voicePlayer.pause();voicePlayer.removeAttribute('src');voicePlayer.load();}
}
function updateVoiceControls() {
    const champ=champions[currentChampIndex];
    const clips=normalizeVoices(champ?.voices),available=clips.some(Boolean);
    document.getElementById('voice-controls').hidden=!available;
    const mute=document.getElementById('voice-mute');
    mute.textContent=voiceMuted?'Bật giọng':'Tắt giọng';
    mute.setAttribute('aria-pressed',String(voiceMuted));
    document.getElementById('voice-replay').textContent='Nghe giọng';
    for(let i=0;i<2;i++){
        document.getElementById('voice-name-'+i).textContent=clips[i]?.name||'Chưa có âm thanh';
        document.getElementById('voice-preview-'+i).disabled=!clips[i];
        document.getElementById('voice-remove-'+i).disabled=!clips[i];
    }
}
function toggleVoiceMute() {
    voiceMuted=!voiceMuted;
    try { localStorage.setItem('MourVoiceMuted',String(voiceMuted)); } catch {}
    if(voiceMuted)stopChampionVoice();
    updateVoiceControls();
}
async function playChampionVoice(index=null,preview=false) {
    stopChampionVoice();
    const champ=champions[currentChampIndex];
    if(!champ || (!preview&&(voiceMuted||isEditMode)))return;
    const clips=normalizeVoices(champ.voices);
    const available=clips.filter(Boolean);
    const clip=index===null?available[Math.floor(Math.random()*available.length)]:clips[index];
    if(!clip)return;
    if(!voicePlayer){voicePlayer=new Audio();voicePlayer.preload='none';voicePlayer.volume=.75;}
    const sequence=voiceSequence;
    voicePlayer.src=clip.src;
    try { await voicePlayer.play(); }
    catch(error){
        if(sequence!==voiceSequence)return;
        const button=document.getElementById('voice-replay');
        button.textContent=error.name==='NotAllowedError'?'Bấm để nghe giọng':'Thử nghe lại';
        if(preview&&error.name!=='NotAllowedError')customAlert('Không phát được tệp này. Hãy thử MP3, M4A, OGG hoặc WAV khác.');
    }
}
function voiceFileDuration(file) {
    return new Promise((resolve,reject)=>{
        const probe=new Audio(),url=URL.createObjectURL(file);
        let timer;
        const finish=(error,value)=>{clearTimeout(timer);probe.onloadedmetadata=probe.onerror=null;probe.removeAttribute('src');probe.load();URL.revokeObjectURL(url);error?reject(error):resolve(value);};
        timer=setTimeout(()=>finish(new Error('Không đọc được âm thanh. Hãy thử tệp MP3 khác.')),10000);
        probe.onloadedmetadata=()=>Number.isFinite(probe.duration)&&probe.duration>0?finish(null,probe.duration):finish(new Error('Không xác định được độ dài âm thanh.'));
        probe.onerror=()=>finish(new Error('Trình duyệt không hỗ trợ tệp này. Hãy dùng MP3, M4A, OGG hoặc WAV.'));
        probe.preload='metadata';probe.src=url;
    });
}
function fileAsDataUrl(file) { return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Không đọc được tệp âm thanh.'));reader.readAsDataURL(file);}); }
async function uploadChampionVoice(input,index) {
    const file=input.files?.[0];input.value='';
    if(!file||!isEditMode||![0,1].includes(index))return;
    const champion=champions[currentChampIndex];if(!champion)return;
    const fallback={mp3:'audio/mpeg',m4a:'audio/mp4',ogg:'audio/ogg',wav:'audio/wav',webm:'audio/webm'};
    const extension=file.name.split('.').pop().toLowerCase();
    const mime=MOUR_AUDIO_TYPES.has(file.type)?file.type:fallback[extension];
    if(!mime){customAlert('Chọn tệp MP3, M4A, OGG, WAV hoặc WebM.');return;}
    if(file.size>MOUR_VOICE_MAX_BYTES){customAlert('Mỗi giọng tối đa 2 MB. Hãy dùng một đoạn MP3 ngắn để tiết kiệm bộ nhớ.');return;}
    voiceUploadCount++;
    document.querySelectorAll('.voice-upload').forEach(el=>el.disabled=true);
    document.getElementById('voice-notice').textContent='Đang kiểm tra âm thanh…';
    try {
        const duration=await voiceFileDuration(file);
        if(duration>30)throw new Error('Mỗi giọng tối đa 30 giây. Hãy cắt một câu ngắn trước khi thêm.');
        const src=await fileAsDataUrl(new Blob([file],{type:mime}));
        // Capture the champion object: a slow file read must never attach to a different profile.
        if(!isEditMode||!champions.includes(champion))throw new Error('Chưa thêm âm thanh vì dữ liệu hoặc chế độ chỉnh sửa đã thay đổi.');
        champion.voices=normalizeVoices(champion.voices);
        champion.voices[index]={name:file.name.slice(0,160),src};
        stopChampionVoice();updateVoiceControls();
        const saved=await saveData();
        document.getElementById('voice-notice').textContent=saved?'Đã lưu giọng. Âm thanh được kèm trong file JSON khi xuất.':'Chưa lưu được. Hãy Xuất File để giữ âm thanh vừa thêm.';
    }catch(error){customAlert(error.message);document.getElementById('voice-notice').textContent='Chưa thay đổi giọng đã lưu.';}
    finally{voiceUploadCount--;document.querySelectorAll('.voice-upload').forEach(el=>el.disabled=voiceUploadCount>0);}
}
function removeChampionVoice(index) {
    if(!isEditMode||![0,1].includes(index))return;
    const champion=champions[currentChampIndex];if(!champion)return;
    champion.voices=normalizeVoices(champion.voices);champion.voices[index]=null;
    stopChampionVoice();updateVoiceControls();saveData();
}
window.addEventListener('pagehide',stopChampionVoice);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopChampionVoice();});
window.addEventListener('beforeunload',event=>{if(voiceUploadCount){event.preventDefault();event.returnValue='';}});
document.addEventListener('DOMContentLoaded',()=>{
    const media=matchMedia('(max-width:760px)'),stack=document.getElementById('filter-stack');
    const adapt=()=>{stack.open=!media.matches;};adapt();media.addEventListener('change',adapt);
});

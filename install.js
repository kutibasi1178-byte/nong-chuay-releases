(() => {
 const words={ja:{title:'検品アプリのインストールと登録',intro:'店舗PCからアプリを取得します。インストール済みなら下の「登録を続ける」へ進めます。',download:'アプリをダウンロードする',openApp:'インストール済み・登録を続ける',instructions:'ダウンロードしたファイルを開き、Androidが求めるインストール許可を確認してください。インストール後、このブラウザー画面へ戻って「登録を続ける」を押します。携帯とPCの照合コードを見比べ、PCで許可してから携帯で名前を確認します。',warning:'店舗PCの案内であることを確認してください。証明書や安全性に関する予期しない警告が出た場合は操作を止めて担当者へ連絡してください。'},th:{title:'ติดตั้งและลงทะเบียนแอปตรวจรับสินค้า',intro:'ดาวน์โหลดแอปจาก PC ของร้าน หากติดตั้งแล้วให้กดดำเนินการลงทะเบียนต่อ',download:'ดาวน์โหลดแอป',openApp:'ติดตั้งแล้ว ดำเนินการลงทะเบียนต่อ',instructions:'เปิดไฟล์ที่ดาวน์โหลดและตรวจสอบการอนุญาตติดตั้งจาก Android หลังติดตั้งให้กลับมาหน้าเบราว์เซอร์นี้แล้วกดลงทะเบียนต่อ เปรียบเทียบรหัสบนโทรศัพท์กับ PC อนุญาตบน PC แล้วตรวจสอบชื่อบนโทรศัพท์',warning:'ตรวจสอบว่าเป็นคำแนะนำจาก PC ของร้าน หากพบคำเตือนเกี่ยวกับใบรับรองหรือความปลอดภัยที่ไม่คาดหมาย ให้หยุดและติดต่อผู้ดูแล'}};
 let language=location.hash==='#th'?'th':'ja';
 let installationStarted=false;
 const pendingKey='nongchuay.installation.pending.v3';
 const appEntry=()=>location.hash==='#continue';
 let retainedEncoded=null;
 try{if(!location.hash||appEntry())retainedEncoded=localStorage.getItem(pendingKey);}catch(_){}
 function forget(encoded){try{if(localStorage.getItem(pendingKey)===encoded)localStorage.removeItem(pendingKey);}catch(_){}}
 function handoff(){
  try{
   if(location.origin+location.pathname!=="https://kutibasi1178-byte.github.io/nong-chuay-releases/install.html"||location.search)return null;
   const values=new URLSearchParams(location.hash.slice(1)),explicit=!!location.hash&&!appEntry(),encoded=explicit?values.get('resume'):retainedEncoded;
   if(explicit&&([...values.keys()].length!==1||values.getAll('resume').length!==1))return null;
   if(!encoded||encoded.length>4096||!/^[A-Za-z0-9_-]+$/.test(encoded))return null;
   const d=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(encoded.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));
   if(!explicit&&d.v!=='3')return null;
   const keys=['v','page','pcId','registrationId','language','expiresAt','endpoint','certificateSha256','generation'];
   if(d.v==='3')keys.push('enrollmentToken','displayName','nameConfirmed');
   if(Object.keys(d).length!==keys.length||keys.some(k=>typeof d[k]!=='string')||!['2','3'].includes(d.v)||!['ja','th'].includes(d.language))return null;
   if(d.v==='3'&&(!/^[A-Za-z0-9_-]{43}$/.test(d.enrollmentToken)||!d.displayName.trim()||d.displayName.length>200||!['true','false'].includes(d.nameConfirmed)))return null;
   if(d.page!==location.origin+location.pathname||!/^pc-[A-Za-z0-9_-]{1,100}$/.test(d.pcId)||!/^registration-[A-Za-z0-9_-]{1,100}$/.test(d.registrationId)||!/^https:\/\//.test(d.endpoint)||!/^\d{1,16}$/.test(d.generation)||Number(d.generation)<1||!(/^[a-f0-9]{64}$/).test(d.certificateSha256))return null;
   const endpoint=new URL(d.endpoint);if(endpoint.pathname!='/mobile_registration'||endpoint.username||endpoint.password||endpoint.search||endpoint.hash||(location.protocol==='http:'&&endpoint.hostname!==location.hostname))return null;
   const expiry=Date.parse(d.expiresAt);if(!Number.isFinite(expiry)||expiry<=Date.now()||expiry>Date.now()+600000){forget(encoded);return null;}
   return {encoded,language:d.language,data:d};
  }catch(_){return null;}
 }
 function render(){const h=handoff();document.documentElement.lang=language;for(const [id,text] of Object.entries(words[language]))document.getElementById(id).textContent=text;document.getElementById('source').textContent=location.origin;
  const open=document.getElementById('openApp');open.hidden=!h;if(h)open.href='foodinventory://installation/resume?data='+encodeURIComponent(h.encoded);else open.removeAttribute('href');
  const owner=document.getElementById('ownerName'),ownerMode=!!(h&&h.data.v==='3');owner.hidden=!ownerMode;
  document.getElementById('ja').hidden=ownerMode;document.getElementById('th').hidden=ownerMode;
  const download=document.getElementById('download');
  download.style.display=ownerMode&&installationStarted?'none':'';
  if(ownerMode){owner.hidden=true;open.hidden=!installationStarted;}
  if(h&&h.data.v==='3'){
   const d={...h.data,nameConfirmed:'false'},bytes=new TextEncoder().encode(JSON.stringify(d));let raw='';for(const b of bytes)raw+=String.fromCharCode(b);
   const encoded=btoa(raw).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
   open.href='intent://installation/resume?data='+encoded+'#Intent;scheme=foodinventory;package=com.example.food_inventory_app;end';
   owner.textContent='';
   open.textContent=language==='th'?'ติดตั้งแล้ว ลงทะเบียนต่อ':'インストール後、登録を続ける';
   document.getElementById('intro').textContent=language==='th'?'ติดตั้งแอปแล้วตรวจสอบชื่อ หากชื่อไม่ถูกต้อง อย่ากดใช่ ให้เริ่มใหม่บน PC':'アプリをインストールして、お名前を確認してください。名前が違う場合は「はい」を押さず、PC側でやり直してください。';
   document.getElementById('download').textContent=language==='th'?'ติดตั้งแอป':'アプリをインストール';
   document.getElementById('instructions').textContent=language==='th'?'เปิดจากข้อความดาวน์โหลดเสร็จและติดตั้ง หลังติดตั้งให้เปิดแอปน้องช่วยแล้วกดลงทะเบียนต่อ หากกดเสร็จสิ้น ให้เปิดแอปน้องช่วยจากรายการแอป เมื่อหน้า Chrome เปิดขึ้นให้กดปุ่มด้านล่างและตรวจสอบชื่อในแอป':'ダウンロード完了表示の「開く」からインストールします。インストール後はノーン・チュアイを開き「登録を続ける」を押してください。「完了」で画面が閉じた場合も、アプリ一覧からノーン・チュアイを開きます。Chromeの案内が開いたら下のボタンで進み、アプリ内でお名前を確認します。';
  }
  if((location.hash.startsWith('#resume=')||retainedEncoded||appEntry())&&!h){
   document.getElementById('warning').textContent=language==='th'?'QR ไม่ถูกต้องหรือหมดอายุ กรุณาออกใหม่บน PC':'QRが無効または期限切れです。PCで再発行してください。';
   download.style.display='none';if(retainedEncoded)forget(retainedEncoded);
  }
 }
 const initial=handoff();if(initial)language=initial.language;
 if(initial&&initial.data.v==='3'){
  if(!location.hash||appEntry())installationStarted=true;
  try{localStorage.setItem(pendingKey,initial.encoded);}catch(_){}
 }
 document.getElementById('download').addEventListener('click',()=>{installationStarted=true;render();});
 document.getElementById('ja').addEventListener('click',()=>{language='ja';render();});document.getElementById('th').addEventListener('click',()=>{language='th';render();});
 addEventListener('hashchange',()=>{
  const next=handoff();installationStarted=false;
  if(next){language=next.language;if(next.data.v==='3')try{localStorage.setItem(pendingKey,next.encoded);}catch(_){}}
  render();
 });setInterval(render,1000);render();
})();

// Keep the music iframe outside the content replaced during internal navigation.
(() => {
 const playlists=[['2M0rQPc8OH1DZGryxinTRr','EDM'],['5ISMTs9lsDMzDRynnmn98G','Hip-Hop'],['1tz3CadR4DkYb8poVgRVM8','Alt']];
 const content=document.createElement('div');content.id='site-content';
 while(document.body.firstChild)content.append(document.body.firstChild);
 document.body.append(content);
 const host=document.createElement('div');host.className='spotify-host is-away';
 const mount=document.createElement('div');mount.id='spotify-mount';host.append(mount);
 const dismiss=document.createElement('button');dismiss.className='native-music-dismiss';dismiss.type='button';dismiss.setAttribute('aria-label','Pause music and close compact player');dismiss.textContent='Close ⌄';host.append(dismiss);document.body.append(host);
 let controller=null,apiRequested=false,selected=playlists[0][0],started=false,slotObserver=null;
 function positionPlayer(){
  const slot=content.querySelector('#inline-spotify-slot'),iframe=host.querySelector('iframe');
  const inline=!!slot&&!started;
  host.classList.toggle('is-docked',started);
  host.classList.toggle('is-away',!inline&&!started);
  document.body.classList.toggle('has-native-music',started);
  if(slot){
   slot.classList.toggle('music-is-active',started);
   slot.querySelector('.spotify-loading').textContent=started?'Your music is playing in the player below. Choose a playlist on the left to change the soundtrack.':'Loading Spotify…';
  }
  if(inline){
   const rect=slot.getBoundingClientRect();
   Object.assign(host.style,{left:`${rect.left+scrollX}px`,top:`${rect.top+scrollY}px`,width:`${rect.width}px`,height:'452px'});
  }else{host.removeAttribute('style');}
  if(iframe){const height=inline?452:80;iframe.height=String(height);iframe.style.height=`${height}px`;}
 }
 function ensurePlayer(){
  if(apiRequested)return;apiRequested=true;
  window.onSpotifyIframeApiReady=api=>{
   api.createController(mount,{url:`https://open.spotify.com/playlist/${selected}`,width:'100%',height:452},embed=>{
    controller=embed;positionPlayer();
    embed.addListener('playback_started',()=>{started=true;positionPlayer();});
    embed.addListener('playback_update',event=>{if(!event.data.isPaused&&!started){started=true;positionPlayer();}});
   });
  };
  const api=document.createElement('script');api.src='https://open.spotify.com/embed/iframe-api/v1';api.async=true;document.head.append(api);
 }
 window.musicPlayer={open(){content.querySelector('#inline-spotify-slot')?.scrollIntoView({block:'center'});},select(id){
  if(id!==selected){selected=id;controller?.loadEntity(`https://open.spotify.com/playlist/${id}`);}
  ensurePlayer();syncSelection();
 }};
 function syncSelection(){
  const direct=content.querySelector('#spotify-link'),name=playlists.find(([id])=>id===selected)[1];
  if(direct){direct.href=`https://open.spotify.com/playlist/${selected}`;direct.textContent=`Open ${name} in Spotify ↗`;}
  content.querySelectorAll('.playlist-tab').forEach(tab=>{const active=tab.dataset.playlist===selected;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active)content.querySelector('#playlist-panel')?.setAttribute('aria-labelledby',tab.id);});
  slotObserver?.disconnect();const slot=content.querySelector('#inline-spotify-slot');
  if(slot){ensurePlayer();slotObserver=new ResizeObserver(positionPlayer);slotObserver.observe(slot);}
  positionPlayer();
 }
 window.addEventListener('resize',positionPlayer);
 dismiss.addEventListener('click',()=>{controller?.pause();started=false;positionPlayer();content.querySelector('.playlist-tab[aria-selected="true"]')?.focus({preventScroll:true});});
 let cleanup=()=>{},navigationController=null,displayedPath=location.pathname;
 function init(){cleanup();cleanup=window.initResearch?.()||(()=>{});window.initPlaylists?.();window.initTravelMap?.();syncSelection();document.querySelectorAll('#year').forEach(el=>el.textContent=new Date().getFullYear());}
 async function navigate(url,push=true){
  if(url.pathname===displayedPath){if(push)history.pushState(null,'',url);scrollToHash(url.hash);return;}
  navigationController?.abort();const controller=new AbortController();navigationController=controller;
  try{
   const response=await fetch(url.pathname,{signal:controller.signal});if(!response.ok)throw Error('Page unavailable');
   const doc=new DOMParser().parseFromString(await response.text(),'text/html');
   if(!doc.querySelector('main'))throw Error('Missing page content');
   cleanup();content.innerHTML=doc.body.innerHTML;document.title=doc.title;displayedPath=url.pathname;
   const description=doc.querySelector('meta[name="description"]');if(description)document.querySelector('meta[name="description"]').content=description.content;
   if(push)history.pushState(null,'',url);init();scrollToHash(url.hash);const heading=content.querySelector('main h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
  }catch(error){if(error.name!=='AbortError')location.assign(url.href);}
 }
 function legacyResearch(url){if(['/','/index.html'].includes(url.pathname)&&['#research','#research-fxt','#research-frb','#publications','#software','#teaching'].includes(url.hash))return new URL('research.html'+url.hash,location.href);return url;}
 function scrollToHash(hash){const target=hash?document.getElementById(decodeURIComponent(hash.slice(1))):null;if(target)target.scrollIntoView();else window.scrollTo(0,0);}
 document.addEventListener('click',event=>{
  const menu=event.target.closest('.menu-toggle');if(menu){const state=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(state));content.querySelector('#navigation').classList.toggle('open',state);return;}
  const email=event.target.closest('#reveal-email');if(email){const link=document.createElement('a');link.className='email-link';link.href='mailto:'+atob('Y29ubmVyeS5jaGVuQGxzdS5lZHU=');link.textContent=atob('Y29ubmVyeS5jaGVuQGxzdS5lZHU=')+' ↗';email.replaceWith(link);link.focus();return;}
  const link=event.target.closest('a');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target||link.hasAttribute('download'))return;
  let url=legacyResearch(new URL(link.href));if(url.origin!==location.origin||!['/','/index.html','/research.html','/personal.html','/contact.html'].includes(url.pathname))return;
  if(url.hash==='#about'&&['/','/index.html'].includes(url.pathname))url=new URL('personal.html#about',location.href);
  if(url.hash==='#contact'&&['/','/index.html'].includes(url.pathname))url=new URL('contact.html',location.href);
  event.preventDefault();const menuButton=content.querySelector('.menu-toggle');menuButton?.setAttribute('aria-expanded','false');content.querySelector('#navigation')?.classList.remove('open');navigate(url);
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){const menu=content.querySelector('.menu-toggle');if(menu?.getAttribute('aria-expanded')==='true'){menu.setAttribute('aria-expanded','false');content.querySelector('#navigation').classList.remove('open');menu.focus();}}});
 window.addEventListener('popstate',()=>{navigate(new URL(location.href),false);});
 init();
 const legacy=legacyResearch(new URL(location.href));if(legacy.pathname!==location.pathname)navigate(legacy);
 if(['#about','#contact'].includes(location.hash)&&['/','/index.html'].includes(location.pathname))navigate(new URL(location.hash==='#about'?'personal.html#about':'contact.html',location.href));
})();

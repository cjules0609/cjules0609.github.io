window.initPlaylists=function(){
const playlistTabs=[...document.querySelectorAll('.playlist-tab')];
function selectPlaylist(tab){
 if(tab.getAttribute('aria-selected')==='true'){window.musicPlayer.select(tab.dataset.playlist,tab.dataset.name);return;}
 playlistTabs.forEach(item=>{const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;});
 document.querySelector('#playlist-panel').setAttribute('aria-labelledby',tab.id);
 window.musicPlayer.select(tab.dataset.playlist,tab.dataset.name);
}
playlistTabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>selectPlaylist(tab));
 tab.addEventListener('keydown',event=>{
  let next;
  if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%playlistTabs.length;
  else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index-1+playlistTabs.length)%playlistTabs.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=playlistTabs.length-1;
  else return;
  event.preventDefault();playlistTabs[next].focus();selectPlaylist(playlistTabs[next]);
 });
});

};

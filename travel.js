window.initTravelMap=function(){
 const svg=document.querySelector('.travel-map');if(!svg)return;
 const world=svg.querySelector('.travel-map-world'),points=svg.querySelector('.travel-map-points'),caption=document.querySelector('#travel-selection');
 let scale=1,tx=0,ty=0,drag=null;
 function draw(){world.setAttribute('transform',`translate(${tx} ${ty}) scale(${scale})`);}
 function zoom(next){const old=scale;scale=Math.max(1,Math.min(8,next));tx=450-(450-tx)*scale/old;ty=225-(225-ty)*scale/old;if(scale===1)tx=ty=0;draw();}
 document.querySelectorAll('[data-map-zoom]').forEach(button=>button.addEventListener('click',()=>{const mode=button.dataset.mapZoom;if(mode==='reset'){scale=1;tx=ty=0;draw();}else zoom(scale*(mode==='in'?1.5:1/1.5));}));
 svg.addEventListener('pointerdown',event=>{if(event.target.closest('.travel-point'))return;drag={x:event.clientX,y:event.clientY,tx,ty};svg.setPointerCapture(event.pointerId);});
 svg.addEventListener('pointermove',event=>{if(!drag)return;const box=svg.getBoundingClientRect();tx=drag.tx+(event.clientX-drag.x)*900/box.width;ty=drag.ty+(event.clientY-drag.y)*900/box.width;draw();});
 svg.addEventListener('pointerup',()=>{drag=null;});svg.addEventListener('pointercancel',()=>{drag=null;});
 fetch('assets/travel-places.json').then(r=>{if(!r.ok)throw Error('Map data unavailable');return r.json();}).then(places=>{
 if(!svg.isConnected)return;
 document.querySelector('.travel-map-toolbar>span').textContent=`${places.length} places & counting`;
 function locationLabel(p){return [...new Set([p.name,p.country==='United States'?p.region:null,p.country].filter(Boolean))].join(', ');}
 function choose(index,center=false){const p=places[index];if(!p)return;points.querySelectorAll('.travel-point').forEach((node,i)=>{node.classList.toggle('is-selected',i===index);node.setAttribute('aria-pressed',String(i===index));});caption.textContent=locationLabel(p);if(center){scale=4;tx=450-(p.lon+180)*2.5*scale;ty=225-(90-p.lat)*2.5*scale;draw();}}
 places.forEach((p,index)=>{const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','travel-point');g.setAttribute('transform',`translate(${(p.lon+180)*2.5} ${(90-p.lat)*2.5})`);g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-label',locationLabel(p));g.setAttribute('aria-pressed','false');
 for(const [radius,cls] of [[7,'point-hit'],[3.2,'point-halo'],[1.3,'point-light']]){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('r',radius);c.setAttribute('class',cls);g.append(c);}
 const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent=locationLabel(p);g.append(title);g.addEventListener('click',()=>choose(index));g.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(index);}});points.append(g);
 });

 }).catch(()=>{caption.textContent='The travel map couldn’t load. Please refresh to try again.';});
};

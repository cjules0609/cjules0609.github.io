/* Publication metadata from Connery Chen's October 2026 CV.
   Update this list as new papers appear. ADS searches use DOI identifiers
   so links remain useful without depending on a particular ADS bibcode. */
const publications = [
  {date:'08/2026', title:'Einstein Probe Fast X-Ray Transients Extend the Physical Parameter Space of Relativistic Jets', authors:'Chen, C. J., Wang, Y., & Zhang, B.', journal:'The Astrophysical Journal Letters · 1006, L44', doi:'10.3847/2041-8213/ae89a4'},
  {date:'04/2026', title:'X-Ray Emission Signatures of Neutron Star Mergers', authors:'Chen, C. J., Wang, Y., & Zhang, B.', journal:'The Astrophysical Journal · 1001, 177', doi:'10.3847/1538-4357/ae5535'},
  {date:'02/2026', title:'VegasAfterglow: A High-Performance Framework for Gamma-Ray Burst Afterglows', authors:'Wang, Y., Chen, C. J., & Zhang, B.', journal:'Journal of High Energy Astrophysics · 50, 100490', doi:'10.1016/j.jheap.2025.100490'},
  {date:'03/2023', title:'FRB–SRB–XRB: Geometric and Relativistic Beaming Constraints of Fast Radio Bursts from the Galactic Magnetar SGR J1935+2154', authors:'Chen, C. J., & Zhang, B.', journal:'Monthly Notices of the Royal Astronomical Society · 519, 6284–6296', doi:'10.1093/mnras/stac3747'}
];
function adsLink(doi){return `https://ui.adsabs.harvard.edu/search/q=${encodeURIComponent(`doi:"${doi}"`)}`;}
document.querySelectorAll('[data-doi]').forEach(a=>{a.href=adsLink(a.dataset.doi);});
const publicationList=document.querySelector('#publication-list');
for(const p of publications){
  const article=document.createElement('article');article.className='publication';
  const year=document.createElement('span');year.className='publication-year';year.textContent=p.date;
  const body=document.createElement('div');const title=document.createElement('h3');title.textContent=p.title;
  const authors=document.createElement('p');authors.textContent=p.authors;
  const journal=document.createElement('div');journal.className='publication-journal';journal.textContent=p.journal;
  const link=document.createElement('a');link.href=adsLink(p.doi);link.textContent='ADS ↗';link.setAttribute('aria-label',`${p.title} on NASA ADS`);
  body.append(title,authors,journal);article.append(year,body,link);publicationList.append(article);
}
const menuButton=document.querySelector('.menu-toggle');const nav=document.querySelector('#navigation');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menuButton.setAttribute('aria-expanded','false');nav.classList.remove('open');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true'){menuButton.setAttribute('aria-expanded','false');nav.classList.remove('open');menuButton.focus();}});
// Sweep from the first scroll pixel until the figure leaves the viewport.
const cosmos=document.querySelector('.cosmos');const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');let sweepQueued=false;
function updateSweep(){
 sweepQueued=false;
 const figure=cosmos.getBoundingClientRect();
 const end=Math.max(1,figure.bottom+scrollY);
 const progress=Math.max(0,Math.min(1,scrollY/end));
 const w=cosmos.clientWidth,h=cosmos.clientHeight;
 const icon=document.querySelector('.satellite svg').getBoundingClientRect();
 const detectorX=icon.left-figure.left+icon.width/2,detectorY=icon.top-figure.top+icon.height/2;
 const dx=detectorX-w/2,dy=detectorY-h/2,length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length;
 const detectorAngle=Math.atan2(dx,-dy)*180/Math.PI;
 const sweep=reduceMotion.matches?detectorAngle:detectorAngle-34+76*progress;
 cosmos.style.setProperty('--sweep',sweep+'deg');const jet=document.querySelector('.jet-top');const halfCone=Math.atan2(jet.offsetWidth/2,jet.offsetHeight)*180/Math.PI;const difference=Math.abs(((sweep-detectorAngle+540)%360)-180);const hit=difference<=halfCone;cosmos.classList.toggle('on-beam',hit);document.querySelector('#detector-status').value=hit?'In beam':'Off beam';
 // A schematic Doppler response: strongest at exact alignment, smoothly
 // dimmer away from it. Visual compression keeps the off-axis arcs visible.
 const alignment=Math.exp(-.5*(difference/8)**2);
 cosmos.style.setProperty('--signal-opacity',(.10+.9*alignment).toFixed(4));
 cosmos.style.setProperty('--signal-glow',(.5+5*alignment).toFixed(2)+'px');
 cosmos.style.setProperty('--signal-brightness',(.55+1.25*alignment).toFixed(3));
 const signal=document.querySelector('.detector-signal');
 signal.setAttribute('viewBox',`0 0 ${w} ${h}`);
 const x=detectorX-40*ux,y=detectorY-40*uy;
 document.querySelector('#signal-arcs').setAttribute('transform',`translate(${x} ${y}) rotate(${Math.atan2(dy,dx)*180/Math.PI}) scale(-.38 .38)`);
 const guide=document.querySelector('.geometry-guide');
 guide.setAttribute('viewBox',`0 0 ${w} ${h}`);
 guide.querySelector('path').setAttribute('d',`M${w/2} ${h/2}L${detectorX-58*ux} ${detectorY-58*uy}`);

}
addEventListener('scroll',()=>{if(!sweepQueued){sweepQueued=true;requestAnimationFrame(updateSweep);}},{passive:true});addEventListener('resize',updateSweep);reduceMotion.addEventListener('change',updateSweep);updateSweep();
document.querySelector('#year').textContent=new Date().getFullYear();
// Basic scraping deterrent: the email address is decoded only on interaction.
const emailButton=document.querySelector('#reveal-email');
emailButton.addEventListener('click',()=>{
  const address=atob('Y29ubmVyeS5jaGVuQGxzdS5lZHU=');const link=document.createElement('a');
  link.className='email-link';link.href='mailto:'+address;link.textContent=address+' ↗';
  emailButton.replaceWith(link);link.focus();
});

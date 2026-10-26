// Same-page Evidence/Profile orientation only. No domain, route or focus mutation.
let cleanup=()=>{};
export function mountProfileScroll(){
 cleanup();cleanup=()=>{};
 const area=location.hash.slice(1).split('/')[0]||'evidence';
 if(!['evidence','profile'].includes(area))return;
 const root=document.querySelector('#main');if(!root)return;
 const links=()=>[...document.querySelectorAll('.local-nav a')].filter(a=>a.hash.startsWith('#'+area+'/')&&document.getElementById(a.hash.split('/').at(-1)));
 const sections=()=>links().map(a=>({id:a.hash.split('/').at(-1),el:document.getElementById(a.hash.split('/').at(-1))}));
 let frame=0,current=null,requested=null,until=0,timer;
 const select=id=>{if(!id)return;current=id;for(const a of links())if(a.hash.split('/').at(-1)===id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');};
 const update=()=>{frame=0;if(!root.isConnected||document.querySelector('.navigation-drawer[open]'))return;if(performance.now()<until){select(requested);return;}
  const bottom=document.querySelector('#app>header')?.getBoundingClientRect().bottom||0,threshold=bottom+Math.max(0,innerHeight-bottom)*.325;
  const list=sections().map(s=>({...s,top:(s.el.querySelector('h1,h2,h3')||s.el).getBoundingClientRect().top}));
  let choice=list.filter(s=>s.top<=threshold).at(-1)||list.find(s=>s.el.getBoundingClientRect().bottom>threshold)||list[0];
  if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)choice=list.at(-1);
  if(choice?.id!==current&&current&&Math.abs(choice?.top-threshold)<8)return;select(choice?.id);
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 const explicit=e=>{const a=e.target.closest('.local-nav a');if(!a||!links().includes(a))return;requested=a.hash.split('/').at(-1);until=performance.now()+180;select(requested);clearTimeout(timer);timer=setTimeout(schedule,190);};
 const manual=e=>{if(e.type==='keydown'&&(!['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(e.key)||e.target.matches('input,textarea,select')))return;until=0;schedule();};
 const observer=new ResizeObserver(schedule);observer.observe(root);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);window.addEventListener('hashchange',schedule);root.addEventListener('toggle',schedule,true);document.addEventListener('click',explicit,true);document.addEventListener('keydown',manual,true);window.addEventListener('wheel',manual,{passive:true});schedule();
 cleanup=()=>{observer.disconnect();cancelAnimationFrame(frame);clearTimeout(timer);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);window.removeEventListener('hashchange',schedule);root.removeEventListener('toggle',schedule,true);document.removeEventListener('click',explicit,true);document.removeEventListener('keydown',manual,true);window.removeEventListener('wheel',manual);};
}

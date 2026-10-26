export const readingThreshold=(viewportHeight,stickyBottom)=>stickyBottom+Math.max(0,viewportHeight-stickyBottom)*0.325;
// Application-only orientation. No route, focus, domain or storage mutations.
let stop=()=>{};
export const applicationScroll={stop(){stop();stop=()=>{};},mount(root){this.stop();if(!location.hash.startsWith('#applications/'))return;
 const names=['clarifications','language','documents','submission','history'];let current=null,frame=0,lockedUntil=0,requested=null;
 const elements=()=>names.map(id=>({id,el:id==='overview'?root.querySelector('.workspace-identity'):root.querySelector('#'+id)})).filter(x=>x.el);
 const select=id=>{if(!id)return;current=id;document.querySelectorAll('.local-nav a').forEach(link=>{if(link.hash.split('/').at(-1)===id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});};
 const update=()=>{frame=0;if(!root.isConnected||document.querySelector('.navigation-drawer[open]'))return;if(performance.now()<lockedUntil){select(requested);return;}const threshold=readingThreshold(innerHeight,document.querySelector('#app > header')?.getBoundingClientRect().bottom||88);
 const list=elements().map(x=>({...x,top:(x.el.querySelector('h1,h2,h3')||x.el).getBoundingClientRect().top}));let choice=list.filter(x=>x.top<=threshold).at(-1)||list.find(x=>x.el.getBoundingClientRect().bottom>threshold)||list[0];
 if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)choice=list.at(-1);
 const next=choice?.id;if(next!==current&&current){const boundary=list.find(x=>x.id===next);if(boundary&&Math.abs(boundary.top-threshold)<8)return;}select(next);
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 const explicit=e=>{const link=e.target.closest('a[href^="#"]');if(!link||!link.closest('.local-nav'))return;const parts=link.hash.split('/');if(parts[0]!=='#applications'||parts[1]!==root.dataset.applicationWorkspace)return;const section=parts.at(-1);requested=section.startsWith('artifact-')?'documents':section;if(!names.includes(requested))return;lockedUntil=performance.now()+180;select(requested);};
 const manual=e=>{if(e.type==='keydown'&&(!['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(e.key)||e.target.matches('input,textarea,select')))return;lockedUntil=0;schedule();};
 const observer=new ResizeObserver(schedule);observer.observe(root);elements().forEach(x=>observer.observe(x.el));window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);root.addEventListener('toggle',schedule,true);document.addEventListener('click',explicit,true);window.addEventListener('hashchange',schedule);
 document.addEventListener('keydown',manual,true);window.addEventListener('wheel',manual,{passive:true});
 schedule();stop=()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);root.removeEventListener('toggle',schedule,true);document.removeEventListener('click',explicit,true);document.removeEventListener('keydown',manual,true);window.removeEventListener('wheel',manual);window.removeEventListener('hashchange',schedule);};
}};

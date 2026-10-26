// R3: ephemeral DOM custody between existing overview and assessment destinations.
// No domain model, storage, lifecycle action, or navigation-shell replacement.
export const isAssessmentRoute=(hash=location.hash)=>{
 const [area,section]=hash.slice(1).split('/');
 return area==='vacancies'&&(['vacancy','requirements','other-relationships','practical','decision','source-details','employer-source','structured-interpretation'].includes(section)||section?.startsWith('requirement.'));
};
export function setVacancyExpanded(button,expanded){
 const panel=document.getElementById(button.getAttribute('aria-controls'));
 if(!panel)return;
 if(!expanded&&panel.contains(document.activeElement))button.focus({preventScroll:true});
 button.setAttribute('aria-expanded',String(expanded));panel.hidden=!expanded;
}
const views=new Map();
let stateIdentity,navigationBound=false,returnRequested=false;
function focusTarget(target){
 if(!target)return;
 if(target.tagName==='DETAILS')target.open=true;
 for(let p=target.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
 const heading=target.tagName==='DETAILS'?target.querySelector('summary'):target.matches('h1,h2,h3,button,summary')?target:target.querySelector('h1,h2,h3')||target;
 if(!heading.matches('button,summary'))heading.setAttribute('tabindex','-1');
 heading.focus({preventScroll:true});
 (target.id==='vacancy'&&target.classList.contains('c2-assessment')?document.querySelector('main .context'):target.id==='vacancy'?document.querySelector('.rb-vacancies'):heading).scrollIntoView({block:'start',behavior:'instant'});
}
function revealRoute(hash=location.hash){
 const [area,section]=hash.slice(1).split('/');
 if(area!=='vacancies')return;
 if(returnRequested&&!isAssessmentRoute(hash)){
  const button=document.querySelector('#overview-TAVERA-EK-2026-14 .rb-entry-action a');
  returnRequested=false;
  const saved=views.get('overview');if(saved)window.scrollTo({top:saved.scroll,behavior:'instant'});
  if(button){button.focus({preventScroll:true});button.scrollIntoView({block:'nearest',behavior:'instant'});return;}
 }
 if(!section||section==='opportunities')for(const b of document.querySelectorAll('[data-vacancy-toggle]'))setVacancyExpanded(b,false);
 focusTarget(section?document.getElementById(section):document.querySelector('main h1'));
}
export const vacancyOverview={
 beforeRender(state){
  if(stateIdentity!==state){views.clear();stateIdentity=state;returnRequested=false;return;}
  const element=document.querySelector('.rb-vacancies[data-view]');
  if(element)views.set(element.dataset.view,{element,scroll:window.scrollY});
 },
 needsViewChange(){
  if(location.hash.split('/')[0]!=='#vacancies')return false;
  const current=document.querySelector('.rb-vacancies')?.dataset.view;
  return !!current&&current!==(isAssessmentRoute()?'assessment':'overview');
 },
 mount(){
  const element=document.querySelector('.rb-vacancies[data-view]');
  if(element){const saved=views.get(element.dataset.view);if(saved)element.replaceWith(saved.element);}
  if(!navigationBound){
   document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#vacancies"]');
    if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
    returnRequested=link.hasAttribute('data-vacancy-return');
    if(link.hash===location.hash)queueMicrotask(()=>revealRoute(link.hash));
   },true);navigationBound=true;
  }
  for(const b of document.querySelectorAll('[data-vacancy-toggle]'))b.onclick=()=>setVacancyExpanded(b,b.getAttribute('aria-expanded')!=='true');
  revealRoute();
 },
 route:revealRoute
};

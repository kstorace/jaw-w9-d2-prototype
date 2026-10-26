// R7: ephemeral intake presentation only. No model, route or persistence changes.
import {setVacancyExpanded} from './vacancy-overview.js';
export function captureIntakePresentation(){
 const overview=document.querySelector('.rb-vacancies[data-view="overview"]');
 return {
  expanded:[...(overview?.querySelectorAll('[data-vacancy-toggle]')||[])].filter(b=>b.getAttribute('aria-expanded')==='true').map(b=>b.getAttribute('aria-controls')),
  pasteOpen:!!document.querySelector('.rb-paste-disclosure')?.open,
  text:document.getElementById('vacancy-text')?.value||''
 };
}
export function restoreIntakePresentation(saved){
 for(const b of document.querySelectorAll('[data-vacancy-toggle]'))if(saved.expanded.includes(b.getAttribute('aria-controls')))setVacancyExpanded(b,true);
 const details=document.querySelector('.rb-paste-disclosure'),text=document.getElementById('vacancy-text');
 if(details)details.open=saved.pasteOpen;
 syncIntakePaste();
 if(text)text.value=saved.text;
}
export function focusIntakeVacancy(id){
 const heading=document.getElementById('overview-'+id)?.querySelector('.rb-entry-heading');
 if(!heading)return;
 heading.setAttribute('tabindex','-1');
 heading.focus({preventScroll:true});
 heading.scrollIntoView({block:'start',behavior:'instant'});
}
export function showIntakeError(message,fileName=''){
 const error=document.getElementById('vacancy-error');
 if(!error)return;
 error.textContent=message+(fileName?' Selected file: '+fileName+'.':'');error.hidden=false;
 error.focus({preventScroll:true});
 error.scrollIntoView({block:'start',behavior:'instant'});
}

function syncIntakePaste(){
 const details=document.querySelector('.rb-paste-disclosure'),panel=document.getElementById('vacancy-paste-panel');
 if(details&&panel)panel.hidden=!details.open;
}
export function mountIntakeDisclosure(){
 const details=document.querySelector('.rb-paste-disclosure');
 if(details)details.ontoggle=syncIntakePaste;
 syncIntakePaste();
}

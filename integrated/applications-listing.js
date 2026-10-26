import {activeRecords,recordArea} from './model.js';
import {applicationListView as existingList} from './ongoing.js';
import {vacancyConditions} from './application-state-view.js';
import {applicationsExamples} from './applications-examples.js';
// Read-only presentation labels. Unknown/incomplete record shapes safely omit them.
export function preparationCondition(a,primary='Preparing'){
 if(primary!=='Preparing'||a?.submission?.confirmedAt)return '';
 if(!a?.clarifications||!Object.hasOwn(a.clarifications,'sap'))return '';
 if(a.clarifications.sap===null)return 'Clarification';
 if(!Object.hasOwn(a,'outputLanguage'))return '';
 if(a.outputLanguage===null)return 'Application language';
 if(!['English','German'].includes(a.outputLanguage))return '';
 if(['cv','coverLetter'].some(k=>Array.isArray(a.documents?.[k]?.versions)&&a.documents[k].versions.length))return 'Document review';
 return '';
}
const signpost=(primary,secondary,esc)=>`<span class="ae-state"><span>${esc(primary)}</span>${secondary?` <span class="ae-state-secondary">${esc(secondary)}</span>`:''}</span>`;
const conditions=(values,esc,attribution='')=>`<div class="rb-text-group ae-conditions">${attribution?`<span class="ae-example-label" id="${attribution}">Illustrative example</span> `:''}${values.map(x=>'<span>'+esc(x)+'</span>').join(' ')}</div>`;
function genuineRow(a,h){const{esc,status}=h,primary=status(a);return `<article class="ae-row ae-real" id="record-${esc(a.id)}" aria-labelledby="record-heading-${esc(a.id)}"><h3 tabindex="-1" id="record-heading-${esc(a.id)}">${esc(a.vacancy.employer)}</h3>${signpost(primary,preparationCondition(a,primary),esc)}<p class="ae-role">${esc(a.vacancy.title)}</p>${conditions(vacancyConditions(a.vacancy),esc)}<a class="button secondary ae-action" href="#${recordArea(a)}/${encodeURIComponent(a.id)}/overview" data-open-application="${esc(a.id)}">Open application →</a></article>`;}
function illustrativeRow(x,h){const{esc}=h,control=x.id+'-toggle',content=x.id+'-content',note=x.id+'-attribution';return `<article class="ae-row ae-example" id="listing-${x.id}" data-listing-example="${x.id}" aria-labelledby="${x.id}-heading" aria-describedby="${note}"><h3 id="${x.id}-heading">${esc(x.employer)}</h3>${signpost(x.status,x.condition,esc)}<p class="ae-role">${esc(x.role)}</p>${conditions(x.conditions,esc,note)}<details id="${x.id}-details" class="ae-details" data-listing-disclosure="${x.id}"><summary id="${control}" aria-controls="${content}" aria-label="Example details · ${esc(x.employer)} · ${esc(x.role)}">Example details</summary><div id="${content}" class="ae-example-content"><p>${esc(x.explanation)}</p></div></details></article>`;}
export function applicationListView(state,h){if(h.area==='tracker')return existingList(state,h);const real=activeRecords(state);return h.title('Applications','Your active applications.','Prepare and review applications before external submission. Submitted records move to Tracker.')+`<div class="ae-listing" id="applications-list">${real.length?real.map(a=>genuineRow(a,h)).join(''):'<div class="ae-empty"><p class="note">No active applications. You can continue reviewing vacancies and choose Pursue for your next application.</p><a class="button secondary" href="#vacancies">Continue to vacancies →</a></div>'}${applicationsExamples.map(x=>illustrativeRow(x,h)).join('')}${real.length?'<div class="ae-continuation"><a class="button secondary" href="#vacancies">Continue to vacancies →</a></div>':''}</div>`;}
const expanded=new Map();let pendingFocus=null;
export const applicationsListingPresentation={
 beforeRender(){const root=document.querySelector('.ae-listing');if(!root)return;for(const el of root.querySelectorAll('[data-listing-disclosure]'))expanded.set(el.dataset.listingDisclosure,el.open);const active=document.activeElement?.closest('[data-listing-disclosure]');pendingFocus=active&&active.querySelector('summary')!==document.activeElement?active.dataset.listingDisclosure:null;},
 mount(){const root=document.querySelector('.ae-listing');if(!root){pendingFocus=null;return;}for(const el of root.querySelectorAll('[data-listing-disclosure]')){const summary=el.querySelector('summary');if(expanded.has(el.dataset.listingDisclosure))el.open=expanded.get(el.dataset.listingDisclosure);const recover=()=>{if(el.contains(document.activeElement)&&document.activeElement!==summary)summary.focus({preventScroll:true});};el.addEventListener('beforetoggle',event=>{if(event.newState==='closed')recover();});el.addEventListener('toggle',()=>{expanded.set(el.dataset.listingDisclosure,el.open);if(!el.open)recover();});if(pendingFocus===el.dataset.listingDisclosure)summary.focus({preventScroll:true});}pendingFocus=null;}
};

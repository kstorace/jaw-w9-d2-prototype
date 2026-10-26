// Ephemeral disclosure identity custody; no domain or persistence changes.
let vacancyId=null,lastFocus=null,bound=false;
const disclosures=new Map();
function capture(){for(const d of document.querySelectorAll('.c2-assessment details[id]'))disclosures.set(d.id,d.open);}
export const assessmentPresentation={
 beforeRender(state){
  if(vacancyId!==state.vacancy?.id){disclosures.clear();vacancyId=state.vacancy?.id||null;}
  else capture();
 },
 mount(){
  for(const d of document.querySelectorAll('.c2-assessment details[id]'))if(disclosures.has(d.id))d.open=disclosures.get(d.id);
  if(bound)return;bound=true;
  document.addEventListener('focusin',e=>{lastFocus=e.target;},true);
  document.addEventListener('toggle',e=>{
   const d=e.target;if(!d.isConnected||!d.matches?.('.c2-assessment details[id]'))return;
   disclosures.set(d.id,d.open);
   if(!d.open&&(d.contains(document.activeElement)&&document.activeElement!==d.querySelector('summary')||document.activeElement===document.body&&lastFocus?.isConnected&&d.contains(lastFocus)))d.querySelector('summary')?.focus({preventScroll:true});
  },true);
 }
};

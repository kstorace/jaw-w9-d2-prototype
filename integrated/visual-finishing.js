// Presentation-only wrap detection. The decorative separator has no layout width.
let observer;
export function mountVisualFinishing(){
 observer?.disconnect();
 const rows=[...document.querySelectorAll('.rb-text-group')];
 const measure=()=>{for(const row of rows){
  const items=[...row.children];
  items.forEach((item,index)=>{item.dataset.joined=String(index>0&&item.getBoundingClientRect().top<items[index-1].getBoundingClientRect().bottom-4);});
 }
 // Reserve only the action's actual width in the compatibility territory.
 // Measure actual text occupancy; full-width line boxes alone are not collisions.
 const entry=document.getElementById('overview-TAVERA-EK-2026-14');
 if(entry){
  const action=entry.querySelector('.rb-entry-action');
  entry.classList.remove('rb-action-anchored');
  if(window.matchMedia('(min-width:1200px)').matches&&action){
   entry.style.setProperty('--rb-action-width',action.getBoundingClientRect().width+'px');
   entry.classList.add('rb-action-anchored');
   const bounds=action.getBoundingClientRect();
   const occupied=[...entry.querySelectorAll('.rb-entry-heading,.rb-counts,.rb-entry-information,.rb-practical-summary')].some(root=>{
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let text;
    while(text=walker.nextNode()){
     if(!text.textContent.trim())continue;
     const range=document.createRange();range.selectNodeContents(text);
     if([...range.getClientRects()].some(r=>r.right>bounds.left-8&&r.left<bounds.right&&r.bottom>bounds.top-4&&r.top<bounds.bottom))return true;
    }
    return false;
   });
   if(occupied)entry.classList.remove('rb-action-anchored');
  }
 }
 positionIllustrativeActions();
 };
 observer=new ResizeObserver(measure);for(const row of rows)observer.observe(row);
 const entry=document.getElementById('overview-TAVERA-EK-2026-14');if(entry)observer.observe(entry);
 for(const item of document.querySelectorAll('.rb-opportunity[data-opportunity^="SOURCED-"]'))observer.observe(item);
 measure();document.fonts.ready.then(measure);
}

// R9: independent summary action; expanded detail never becomes its containing block.
function positionIllustrativeActions(){
 for(const entry of document.querySelectorAll('.rb-opportunity[data-opportunity^="SOURCED-"]')){
  const action=entry.querySelector('.rb-entry-action');
  entry.classList.remove('rb-illustrative-anchored');
  if(!window.matchMedia('(min-width:1200px)').matches||!action)continue;
  entry.style.setProperty('--rb-illustrative-action-width',action.getBoundingClientRect().width+'px');
  entry.classList.add('rb-illustrative-anchored');
  const bounds=action.getBoundingClientRect();
  const occupied=[...entry.querySelectorAll('.rb-entry-heading,.rb-counts,.rb-entry-information,.rb-practical-summary')].some(root=>{
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let text;
   while(text=walker.nextNode()){
    if(!text.textContent.trim())continue;
    const range=document.createRange();range.selectNodeContents(text);
    if([...range.getClientRects()].some(r=>r.right>bounds.left-8&&r.left<bounds.right&&r.bottom>bounds.top-4&&r.top<bounds.bottom))return true;
   }
   return false;
  });
  if(occupied)entry.classList.remove('rb-illustrative-anchored');
 }
}

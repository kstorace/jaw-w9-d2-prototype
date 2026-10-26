// One-shot navigation focus only. No language choice, persistence or workflow state.
const destination=new URL(location.href);
if(destination.searchParams.get('entry')==='illustrative'&&destination.hash==='#evidence'){
  destination.searchParams.delete('entry');
  history.replaceState(history.state,'',destination);
  // Await the existing module's render; the module cache prevents a second execution.
  await import('./app.js');
  await new Promise(requestAnimationFrame);
  const heading=document.querySelector('#main h1');
  if(heading){
    if(!heading.hasAttribute('tabindex'))heading.setAttribute('tabindex','-1');
    heading.scrollIntoView({block:'start',behavior:'instant'});
    heading.focus({preventScroll:true});
    const bottom=document.querySelector('#app>header')?.getBoundingClientRect().bottom||0;
    const top=heading.getBoundingClientRect().top;
    if(top<bottom+16)window.scrollBy({top:top-bottom-16,behavior:'instant'});
  }
}

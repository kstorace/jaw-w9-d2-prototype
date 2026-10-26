// Shared only by the two authorised practical-preference commands and their forms.
export const validPreferences=(minutes,tolerance)=>Number.isFinite(minutes)&&minutes>=1&&minutes<=180&&[0,5,10,15].includes(tolerance);
export const preferenceNumber=value=>typeof value==='string'&&value.trim()!==''?Number(value):NaN;
export function preferenceIssue(minutes,tolerance){
 if(!Number.isFinite(minutes)||minutes<1||minutes>180)return 'Enter a one-way commute from 1 to 180 minutes.';
 if(![0,5,10,15].includes(tolerance))return 'Choose an upward tolerance, including No additional tolerance (0) if appropriate.';
 return '';
}
export function preferenceError(form,message){
 let box=form.querySelector('.preference-error');
 if(!box){box=document.createElement('p');box.id=form.id+'-error';box.className='preference-error';box.tabIndex=-1;box.setAttribute('role','alert');form.prepend(box);}
 box.textContent=message;
 for(const el of form.querySelectorAll('[name=minutes],[name=tolerance]'))el.setAttribute('aria-describedby',box.id);
 box.scrollIntoView({block:'center',behavior:'instant'});box.focus({preventScroll:true});
}

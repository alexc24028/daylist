const $ = s => document.querySelector(s);
const key = 'daylist.tasks.v1';
let tasks = [];
try { const saved = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(saved)) tasks = saved.filter(t => t && typeof t.id === 'string' && typeof t.title === 'string' && (t.due === null || Number.isFinite(t.due))); } catch {}
let filter = 'active';
$('#today').textContent = new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(new Date());
function save(message) { try { localStorage.setItem(key,JSON.stringify(tasks)); } catch { $('.local-badge').textContent='Storage unavailable · this session only'; } $('#announcement').textContent=message; render(); }
function render() {
 const now=Date.now();
 const active=tasks.filter(t=>!t.completed).length;
 $('#active-count').textContent=active; $('#complete-count').textContent=tasks.length-active;
 $('#remaining').textContent=tasks.length ? `${active} task${active===1?'':'s'} left to do${active===0?' · Nicely done!':''}` : 'No tasks yet. A fresh page awaits.';
 $('#clear-completed').hidden=!tasks.some(t=>t.completed);
 const shown=tasks.filter(t=>filter==='active'?!t.completed:t.completed);
 shown.sort((a,b)=> { if($('#sort').value==='newest')return b.created-a.created; if(a.due===null)return b.due===null?b.created-a.created:1;if(b.due===null)return -1;return $('#sort').value==='latest'?b.due-a.due:a.due-b.due; });
 $('#task-list').replaceChildren(); $('#empty').hidden=shown.length>0;
 $('#empty h2').textContent=tasks.length ? (filter==='completed'?'Good things take a little time.':'All clear. Take a little breath.') : 'A little space for a fresh start.';
 $('#empty p').textContent=tasks.length ? (filter==='completed'?'Your completed tasks will appear here.':'There are no tasks in this view.') : 'Add your first task above. Good things start small.';
 for(const task of shown){
 const overdue=!task.completed&&task.due!==null&&task.due<now;
 const row=document.createElement('div');row.className='task'+(task.completed?' done':'')+(overdue?' overdue':'');
 const check=document.createElement('input');check.type='checkbox';check.className='check';check.checked=task.completed;check.setAttribute('aria-label',`Mark ${task.title} ${task.completed?'incomplete':'complete'}`);check.onchange=()=>{task.completed=check.checked;save(task.completed?'Task completed':'Task reopened');};
 const content=document.createElement('div');content.className='task-content';const title=document.createElement('div');title.className='task-title';title.textContent=task.title;content.append(title);
 if(task.due!==null){const due=document.createElement('div');due.className='due'+(overdue?' overdue':'');due.textContent='▦ '+new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:new Date(task.due).getFullYear()!==new Date().getFullYear()?'numeric':undefined,...(task.hasTime?{hour:'numeric',minute:'2-digit'}:{})}).format(new Date(task.due))+(overdue?' · Overdue':'');content.append(due);}
 const del=document.createElement('button');del.className='delete';del.setAttribute('aria-label',`Delete ${task.title}`);del.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/></svg>';del.onclick=()=>{tasks=tasks.filter(t=>t.id!==task.id);save('Task deleted');};row.append(check,content,del);$('#task-list').append(row);
 }
}
$('#task-form').onsubmit=e=>{e.preventDefault();const title=$('#task-input').value.trim();const date=$('#due-date').value,time=$('#due-time').value;const error=$('#form-error');error.hidden=true;if(!title){$('#task-input').focus();return;}if(time&&!date){error.textContent='Choose a date to go with your time.';error.hidden=false;$('#due-date').focus();return;}const due=date?new Date(`${date}T${time||'23:59:59'}`).getTime():null;if(date&&!Number.isFinite(due)){error.textContent='Please choose a valid date and time.';error.hidden=false;return;}tasks.push({id:crypto.randomUUID(),title,due,hasTime:!!time,completed:false,created:Date.now()});e.target.reset();save('Task added');$('#task-input').focus();};
document.querySelectorAll('.tab').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;document.querySelectorAll('.tab').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});render();});
$('#sort').onchange=render;$('#clear-completed').onclick=()=>{tasks=tasks.filter(t=>!t.completed);save('Completed tasks cleared');};render();setInterval(render,60000);

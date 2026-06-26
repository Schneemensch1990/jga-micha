const ADMIN_PIN='0404';
let admin=false;
let score=0;

const tasks=[
 {name:'Selfie mit Hund',points:1},
 {name:'Werder-Fan finden',points:1},
 {name:'Drei Hochzeitsglückwünsche sammeln',points:3},
 {name:'Barkeeper benennt Shot nach Micha',points:10}
];

function render(){
 const t=document.getElementById('tasks');
 t.innerHTML='';
 tasks.forEach((x,i)=>{
   const d=document.createElement('div');
   d.className='task';
   d.innerHTML=`<input type="checkbox" ${x.done?'checked':''} ${!admin?'disabled':''}
   onchange="toggleTask(${i})"> ${x.name} (+${x.points})`;
   t.appendChild(d);
 });
 document.getElementById('score').innerText=score+' / 100 Punkte';
 document.getElementById('bar').value=score;
}
function unlock(){
 admin=document.getElementById('pin').value===ADMIN_PIN;
 document.getElementById('adminState').innerText=admin?'Admin aktiv':'Falsche PIN';
 render();
}
function toggleTask(i){
 if(tasks[i].done){tasks[i].done=false;score-=tasks[i].points;}
 else {tasks[i].done=true;score+=tasks[i].points;}
 render();
}
render();
(() => {
  const canvas = document.querySelector('#mandala-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const paint = document.createElement('canvas'); paint.width = canvas.width; paint.height = canvas.height;
  const pctx = paint.getContext('2d', { willReadFrequently: true });
  const status = document.querySelector('#paint-status');
  const size = document.querySelector('#brush-size');
  const output = document.querySelector('#brush-output');
  const undo = document.querySelector('#undo-paint');
  let color = '#173a5e', tool = 'brush', design = 'seed', drawing = false, last = null, history = [];
  const names = { seed:'Semilla y sol', leaves:'Ronda de hojas', circles:'Círculos', forest:'Pequeño bosque' };

  function point(e){ const r=canvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}; }
  function polar(cx,cy,r,a){ return [cx+r*Math.cos(a),cy+r*Math.sin(a)]; }
  function circle(x,y,r,stroke='#78918d',w=2){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.stroke();}
  function rings(rs){rs.forEach((r,i)=>circle(450,450,r,['#173a5e','#6f9277','#dc7f58','#d6a72c'][i%4],2));}
  function petals(r,n,len,w,phase=0,stroke='#173a5e'){
    ctx.strokeStyle=stroke;ctx.lineWidth=2;
    for(let i=0;i<n;i++){const a=phase+Math.PI*2*i/n,[x,y]=polar(450,450,r,a);ctx.save();ctx.translate(x,y);ctx.rotate(a-Math.PI/2);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-w,len*.35,-w,len*.72,0,len);ctx.bezierCurveTo(w,len*.72,w,len*.35,0,0);ctx.stroke();ctx.restore();}
  }
  function leaves(r,n,s,phase=0,stroke='#6f9277'){
    ctx.strokeStyle=stroke;ctx.lineWidth=2;
    for(let i=0;i<n;i++){const a=phase+Math.PI*2*i/n,[x,y]=polar(450,450,r,a);ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(-s,0);ctx.bezierCurveTo(-s*.45,s*.58,s*.45,s*.58,s,0);ctx.bezierCurveTo(s*.45,-s*.58,-s*.45,-s*.58,-s,0);ctx.stroke();ctx.beginPath();ctx.moveTo(-s,0);ctx.lineTo(s,0);ctx.stroke();ctx.restore();}
  }
  function dots(r,n,rad=6,stroke='#dc7f58'){for(let i=0;i<n;i++){const [x,y]=polar(450,450,r,Math.PI*2*i/n);circle(x,y,rad,stroke,2);}}
  function template(){
    ctx.save();ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,900,900);ctx.drawImage(paint,0,0);ctx.globalAlpha=.95;
    if(design==='seed'){rings([55,145,250,350]);petals(68,8,78,25);dots(200,12,7);petals(265,16,72,19,Math.PI/16,'#6f9277');dots(358,24,5,'#dc7f58');}
    if(design==='leaves'){rings([60,165,280,360]);leaves(115,6,34,Math.PI/6,'#173a5e');leaves(215,10,32,0,'#6f9277');leaves(315,14,28,Math.PI/14,'#dc7f58');dots(365,28,4,'#d6a72c');}
    if(design==='circles'){rings([60,185,300,365]);dots(120,8,22,'#4b91b5');dots(230,12,19,'#6f9277');dots(330,16,15,'#dc7f58');dots(370,32,4,'#d6a72c');}
    if(design==='forest'){rings([50,130,215,300,370]);leaves(95,5,30,Math.PI/10,'#6f9277');leaves(175,8,30,0,'#173a5e');leaves(255,12,28,Math.PI/12,'#dc7f58');leaves(335,16,24,0,'#d6a72c');dots(375,32,4,'#173a5e');}
    ctx.restore();
  }
  function saveState(){history.push(pctx.getImageData(0,0,paint.width,paint.height));if(history.length>18)history.shift();undo.disabled=false;}
  function begin(e){e.preventDefault();saveState();drawing=true;last=point(e);canvas.setPointerCapture?.(e.pointerId);}
  function draw(e){if(!drawing)return;e.preventDefault();const now=point(e);pctx.save();pctx.lineCap='round';pctx.lineJoin='round';pctx.lineWidth=Number(size.value);if(tool==='eraser'){pctx.globalCompositeOperation='destination-out';pctx.strokeStyle='rgba(0,0,0,1)';}else{pctx.globalCompositeOperation='source-over';pctx.strokeStyle=color;}pctx.beginPath();pctx.moveTo(last.x,last.y);pctx.lineTo(now.x,now.y);pctx.stroke();pctx.restore();last=now;template();}
  function end(){drawing=false;last=null;}
  canvas.addEventListener('pointerdown',begin);canvas.addEventListener('pointermove',draw);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('contextmenu',e=>e.preventDefault());
  document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{color=b.dataset.color;tool='brush';document.querySelectorAll('[data-color],[data-tool]').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');document.querySelector('[data-tool="brush"]').classList.add('is-active');}));
  document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>{tool=b.dataset.tool;document.querySelectorAll('[data-tool]').forEach(x=>x.classList.toggle('is-active',x===b));}));
  document.querySelectorAll('[data-mandala]').forEach(b=>b.addEventListener('click',()=>{if(history.length||pctx.getImageData(0,0,1,1).data[3]){if(!confirm('¿Cambiar de diseño y comenzar con el lienzo limpio?'))return;}design=b.dataset.mandala;pctx.clearRect(0,0,900,900);history=[];undo.disabled=true;document.querySelectorAll('[data-mandala]').forEach(x=>x.classList.toggle('is-active',x===b));status.textContent=`Diseño ${names[design]} listo para pintar.`;template();}));
  size.addEventListener('input',()=>output.textContent=size.value);
  undo.addEventListener('click',()=>{const state=history.pop();if(state)pctx.putImageData(state,0,0);undo.disabled=!history.length;template();status.textContent='Último trazo deshecho.';});
  document.querySelector('#clear-paint').addEventListener('click',()=>{if(!confirm('¿Reiniciar la pintura de este mandala?'))return;saveState();pctx.clearRect(0,0,900,900);template();status.textContent='Lienzo reiniciado. Puedes volver a empezar.';});
  template();
})();

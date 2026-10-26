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
  let color = '#173a5e', tool = 'bucket', design = 'quenual', drawing = false, last = null, history = [];
  const boundaryCache = {};
  const names = { quenual:'Queñal y el queñual', llama:'Caminata con llama', condor:'El cóndor curioso', calma:'Noche de calma' };
  const templates = {
    quenual: 'assets/mandalas/quenal-quenual-coloring-overlay.png',
    llama: 'assets/mandalas/quenal-llama-coloring-overlay.png',
    condor: 'assets/mandalas/quenal-condor-coloring-overlay.png',
    calma: 'assets/mandalas/quenal-calma-coloring-overlay.png'
  };
  const drawings = Object.fromEntries(Object.entries(templates).map(([key, src]) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    image.addEventListener('load', () => { if (key === design) template(); });
    return [key, image];
  }));

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
    ctx.save();ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,900,900);ctx.drawImage(paint,0,0);ctx.globalAlpha=.98;
    const drawing = drawings[design];
    if(drawing?.complete && drawing.naturalWidth) ctx.drawImage(drawing,0,0,900,900);
    ctx.restore();
  }
  function saveState(){history.push(pctx.getImageData(0,0,paint.width,paint.height));if(history.length>18)history.shift();undo.disabled=false;}
  function boundaryForCurrentDesign(){
    if(boundaryCache[design]) return boundaryCache[design];
    const image=drawings[design]; if(!image?.complete||!image.naturalWidth)return null;
    const mask=document.createElement('canvas');mask.width=canvas.width;mask.height=canvas.height;
    const mctx=mask.getContext('2d',{willReadFrequently:true});mctx.drawImage(image,0,0,canvas.width,canvas.height);
    const pixels=mctx.getImageData(0,0,canvas.width,canvas.height).data;
    const raw=new Uint8Array(canvas.width*canvas.height),blocked=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)if(pixels[i*4+3]>28)raw[i]=1;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const i=y*canvas.width+x;if(!raw[i])continue;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<canvas.width&&ny<canvas.height)blocked[ny*canvas.width+nx]=1;}}
    boundaryCache[design]=blocked;return blocked;
  }
  function rgb(hex){const n=parseInt(hex.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];}
  function fillRegion(start){
    const boundary=boundaryForCurrentDesign();if(!boundary){status.textContent='La escena todavía está cargando. Prueba otra vez en un momento.';return;}
    const sx=Math.max(0,Math.min(canvas.width-1,Math.floor(start.x))),sy=Math.max(0,Math.min(canvas.height-1,Math.floor(start.y))),first=sy*canvas.width+sx;
    if(boundary[first]){status.textContent='Tocaste una línea. Elige el espacio de adentro.';return;}
    saveState();const image=pctx.getImageData(0,0,paint.width,paint.height),data=image.data,visited=new Uint8Array(boundary.length),stack=[first];let count=0;visited[first]=1;const [r,g,b]=rgb(color),w=canvas.width,h=canvas.height;
    while(stack.length){const i=stack.pop();if(boundary[i])continue;data[i*4]=r;data[i*4+1]=g;data[i*4+2]=b;data[i*4+3]=255;count++;const x=i%w,y=(i/w)|0;const neighbors=[];if(x>0)neighbors.push(i-1);if(x<w-1)neighbors.push(i+1);if(y>0)neighbors.push(i-w);if(y<h-1)neighbors.push(i+w);neighbors.forEach(n=>{if(!visited[n]&&!boundary[n]){visited[n]=1;stack.push(n);}});}
    if(count<8){history.pop();undo.disabled=!history.length;status.textContent='Ese espacio es muy pequeño. Prueba en el centro de la zona.';return;}
    pctx.putImageData(image,0,0);template();status.textContent='Zona rellenada. Puedes elegir otro color o tocar otra parte.';
  }
  function begin(e){e.preventDefault();const pt=point(e);if(tool==='bucket'){fillRegion(pt);return;}saveState();drawing=true;last=pt;canvas.setPointerCapture?.(e.pointerId);}
  function draw(e){if(!drawing)return;e.preventDefault();const now=point(e);pctx.save();pctx.lineCap='round';pctx.lineJoin='round';pctx.lineWidth=Number(size.value);if(tool==='eraser'){pctx.globalCompositeOperation='destination-out';pctx.strokeStyle='rgba(0,0,0,1)';}else{pctx.globalCompositeOperation='source-over';pctx.strokeStyle=color;}pctx.beginPath();pctx.moveTo(last.x,last.y);pctx.lineTo(now.x,now.y);pctx.stroke();pctx.restore();last=now;template();}
  function end(){drawing=false;last=null;}
  canvas.addEventListener('pointerdown',begin);canvas.addEventListener('pointermove',draw);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('contextmenu',e=>e.preventDefault());
  document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{color=b.dataset.color;document.querySelectorAll('[data-color]').forEach(x=>x.classList.toggle('is-active',x===b));status.textContent=tool==='bucket'?'Color elegido. Toca dentro del espacio que quieres rellenar.':'Color elegido. Ya puedes seguir pintando.';}));
  document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>{tool=b.dataset.tool;document.querySelectorAll('[data-tool]').forEach(x=>x.classList.toggle('is-active',x===b));document.querySelector('[data-brush-settings]').hidden=tool!=='brush';canvas.dataset.tool=tool;status.textContent=tool==='bucket'?'Balde listo. Toca dentro de una zona cerrada.':tool==='brush'?'Pincel listo. Dibuja con el dedo, lápiz o mouse.':'Borrador listo. Pasa por el color que quieras quitar.';}));
  document.querySelectorAll('[data-mandala]').forEach(b=>b.addEventListener('click',()=>{if(history.length||pctx.getImageData(0,0,1,1).data[3]){if(!confirm('¿Cambiar de diseño y comenzar con el lienzo limpio?'))return;}design=b.dataset.mandala;pctx.clearRect(0,0,900,900);history=[];undo.disabled=true;document.querySelectorAll('[data-mandala]').forEach(x=>x.classList.toggle('is-active',x===b));status.textContent=`Diseño ${names[design]} listo para pintar.`;template();}));
  size.addEventListener('input',()=>output.textContent=size.value);
  undo.addEventListener('click',()=>{const state=history.pop();if(state)pctx.putImageData(state,0,0);undo.disabled=!history.length;template();status.textContent='Último trazo deshecho.';});
  document.querySelector('#clear-paint').addEventListener('click',()=>{if(!confirm('¿Reiniciar la pintura de este mandala?'))return;saveState();pctx.clearRect(0,0,900,900);template();status.textContent='Lienzo reiniciado. Puedes volver a empezar.';});
  document.querySelector('[data-brush-settings]').hidden=true;canvas.dataset.tool=tool;template();
})();

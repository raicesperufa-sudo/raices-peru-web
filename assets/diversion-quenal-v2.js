(()=>{
  const jokes=[
    ['🐝','Abeja en la escuela','¿Qué hace una abeja en la escuela?','Da clase de miel-temática.'],
    ['📓','Cuaderno contento','¿Por qué el cuaderno estaba contento?','Porque lo estaban llenando de ideas.'],
    ['🧱','Dos paredes','¿Qué le dijo una pared a la otra?','Nos vemos en la esquina.'],
    ['🖱️','Animal con computadora','¿Qué animal usa computadora?','El que mouse mucho.'],
    ['🪑','La silla tranquila','¿Por qué la silla no se enoja?','Porque siempre está sentada.'],
    ['🔬','Microscopio detective','¿Para qué sirve el microscopio?','Para investigar secretos chiquititos antes de que se escondan.'],
    ['🧲','El imán','¿Por qué el imán nunca se pierde?','Porque siempre encuentra el camino de la atracción.'],
    ['🌙','La luna aburrida','¿Qué hace la luna cuando se aburre?','Da vueltas y mira películas de noche.'],
    ['📕','El libro valiente','¿Por qué el libro no tiene miedo?','Porque siempre está bien cubierto.'],
    ['🚦','El semáforo','¿Qué dijo el semáforo al llegar a casa?','Ya cumplí mi turno: ahora descanso en rojo.'],
    ['🐟','El pez','¿Qué hace un pez en el recreo?','Tira burbujas de risa.'],
    ['🎩','Sombrero al viento','¿Qué le dijo el sombrero al viento?','Anda con cuidado, que soy una cabeza con estilo.']
  ];
  const grid=document.querySelector('#joke-grid');
  const speak=(question,punchline)=>{
    const text=`${question} ... ${punchline}`;
    if(window.RaicesVoice?.speak){window.RaicesVoice.speak(text,{force:true,rate:.78});return}
    speechSynthesis.cancel();speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(text),{lang:'es-PE',rate:.78}));
  };
  grid.innerHTML=jokes.map((j,i)=>`<article class="joke-card"><span>${j[0]}</span><small>${i<5?'Libre':'Familia Plus'}</small><h3>${j[1]}</h3><p><strong>${j[2]}</strong><br><span>${j[3]}</span></p><button type="button" data-joke="${i}">🔊 Escuchar el chiste completo</button></article>`).join('');
  grid.querySelectorAll('[data-joke]').forEach(button=>button.addEventListener('click',()=>{const i=Number(button.dataset.joke);if(i>=5&&!(window.RaicesAccess?.require('plus','Risas con Queñal')??false))return;const joke=jokes[i];speak(joke[2],joke[3])}));
})();

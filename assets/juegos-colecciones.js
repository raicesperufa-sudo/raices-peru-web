(() => {
  'use strict';

  const choice = (prompt, visual, options, answer, cue = 'Observa la pista y elige una respuesta.') => ({type:'choice', prompt, visual, options, answer, cue});
  const order = (prompt, items, answer, cue = 'Toca las tarjetas en el orden correcto.') => ({type:'order', prompt, items, answer, cue});
  const memory = (prompt, items, question, options, answer, cue = 'Mira, recuerda y responde cuando se cubran las tarjetas.') => ({type:'memory', prompt, items, question, options, answer, cue});
  const tap = (prompt, cells, targets, cue = 'Toca únicamente los elementos indicados.') => ({type:'tap', prompt, cells, targets, cue});
  const typing = (prompt, visual, answers, cue = 'Escribe la respuesta y luego comprueba.') => ({type:'typing', prompt, visual, answers, cue});
  const game = (id, title, icon, group, description, rounds) => ({id, title, icon, group, description, rounds});

  const collections = {
    ludicas: {
      label: 'Lúdicas interactivas',
      storage: 'raices-juegos-ludicos-progreso',
      groups: {visual:'Atención visual', patrones:'Patrones', lenguaje:'Lenguaje', comprension:'Comprensión'},
      games: [
        game('l1','Detective de colores','🎨','visual','Sigue claves de color y descubre la respuesta.',[
          choice('¿Qué color resulta al mezclar azul y amarillo?','<span class="tile" style="background:#4b8fcb">🔵</span><b>+</b><span class="tile" style="background:#f3ca52">🟡</span>',['Verde','Naranja','Morado'],0),
          choice('Encuentra el color que no pertenece al grupo frío.','<span class="tile" style="background:#4b8fcb"></span><span class="tile" style="background:#60b7a7"></span><span class="tile" style="background:#ef8b55"></span><span class="tile" style="background:#8666b4"></span>',['Azul','Naranja','Morado'],1),
          choice('La clave dice: hoja = verde. ¿Qué opción completa la serie?','<span class="word">🍃</span><span class="word">🌿</span><span class="word">?</span>',['Verde','Rojo','Azul'],0),
          choice('Elige el color complementario del naranja.','<span class="big">🟠 ↔ ?</span>',['Azul','Verde','Amarillo'],0),
          choice('Si rojo vale 2 y azul vale 3, ¿cuánto suman?','<span class="tile" style="background:#dd665b">2</span><b>+</b><span class="tile" style="background:#4b8fcb">3</span>',['4','5','6'],1)
        ]),
        game('l2','Encuentra las figuras','🔎','visual','Busca objetivos entre distractores cada vez más parecidos.',[
          tap('Toca las tres estrellas.',['★','●','▲','★','◆','●','★','▲'],[0,3,6]),
          tap('Toca todos los círculos.',['●','◆','●','▲','■','●','◆','●','▲','■'],[0,2,5,7]),
          tap('Encuentra los triángulos que miran hacia arriba.',['▲','▼','◆','▲','◀','▼','▲','▶','◆','▲','▼','●'],[0,3,6,9]),
          tap('Toca solo las hojas.',['🍃','🌼','🍂','🍃','🌿','🌼','🍃','🍂','🌼','🍃','🌿','🍂'],[0,3,6,9]),
          tap('Encuentra las cinco lupas.',['🔍','🔎','🧭','🔍','🗝️','🔎','🔍','🧭','🔍','🔎','🗝️','🔍'],[0,3,6,8,11])
        ]),
        game('l3','Patrones que crecen','🧩','patrones','Completa secuencias de figuras, colores y cantidades.',[
          choice('¿Qué sigue?','<span class="tile">●</span><span class="tile">▲</span><span class="tile">●</span><span class="tile">▲</span><span class="tile">?</span>',['●','▲','■'],0),
          choice('¿Qué sigue?','<span class="tile">🔴</span><span class="tile">🔴</span><span class="tile">🔵</span><span class="tile">🔴</span><span class="tile">🔴</span><span class="tile">?</span>',['🔵','🔴','🟢'],0),
          choice('La cantidad aumenta de uno en uno.','<span class="tile">★</span><span class="tile">★★</span><span class="tile">★★★</span><span class="tile">?</span>',['★★★★','★★','★★★★★'],0),
          choice('Observa el giro. ¿Qué posición sigue?','<span class="tile">↑</span><span class="tile">→</span><span class="tile">↓</span><span class="tile">?</span>',['←','↑','↗'],0),
          choice('Combina color y forma.','<span class="tile">🔵</span><span class="tile">🔺</span><span class="tile">🟢</span><span class="tile">🔵</span><span class="tile">🔺</span><span class="tile">?</span>',['🟢','🔵','🔺'],0)
        ]),
        game('l4','Reto visual relámpago','👀','visual','Mira unos segundos y recupera la información.',[
          memory('Recuerda los tres objetos.',['🍎','🔑','🌙'],'¿Cuál estaba en el centro?',['🍎','🔑','🌙'],1),
          memory('Recuerda el orden.',['🐟','🌼','🚲','☂️'],'¿Qué apareció después de la flor?',['🐟','🚲','☂️'],1),
          memory('Observa los colores.',['🔴','🟡','🟢','🔵'],'¿Cuál fue el último color?',['Verde','Azul','Rojo'],1),
          memory('Recuerda cinco elementos.',['📘','🍃','⭐','🥁','🪁'],'¿Qué estaba entre la hoja y el tambor?',['Libro','Estrella','Cometa'],1),
          memory('Mira la secuencia completa.',['3','7','2','9','5','1'],'¿Qué número apareció antes del 5?',['2','9','1'],1)
        ]),
        game('l5','Caras que cuentan','🙂','lenguaje','Reconoce emociones y elige palabras respetuosas.',[
          choice('¿Qué emoción muestra esta cara?','<span class="big">😊</span>',['Alegría','Enojo','Miedo'],0),
          choice('¿Qué emoción puede acompañar lágrimas y hombros bajos?','<span class="big">😢</span>',['Sorpresa','Tristeza','Calma'],1),
          choice('Alguien aprieta los dientes y frunce el ceño.','<span class="big">😠</span>',['Enojo','Alegría','Sueño'],0),
          choice('¿Qué frase acompaña mejor a una persona preocupada?','<span class="big">😟</span>',['¿Quieres que me quede contigo?','No pasa nada','Apúrate'],0),
          choice('¿Qué podemos decir si no sabemos cómo se siente alguien?','<span class="big">🤔</span>',['¿Cómo te sientes?','Ya sé qué te pasa','No llores'],0)
        ]),
        game('l6','Se buscan monstruos','👾','visual','Encuentra el monstruo que cambia una característica.',[
          choice('¿Cuál monstruo es diferente?','<span class="tile">👾</span><span class="tile">👾</span><span class="tile">👻</span><span class="tile">👾</span>',['El 1','El 3','El 4'],1),
          choice('Busca el que mira hacia otro lado.','<span class="tile">➡️</span><span class="tile">➡️</span><span class="tile">⬅️</span><span class="tile">➡️</span>',['El 2','El 3','El 4'],1),
          choice('Uno tiene un ojo menos.','<span class="tile">😃</span><span class="tile">😃</span><span class="tile">😉</span><span class="tile">😃</span>',['El 1','El 3','El 4'],1),
          choice('Uno cambia de color.','<span class="tile" style="background:#c9e5df">👾</span><span class="tile" style="background:#c9e5df">👾</span><span class="tile" style="background:#f7d2b9">👾</span><span class="tile" style="background:#c9e5df">👾</span>',['El 2','El 3','El 4'],1),
          choice('Uno combina dos diferencias.','<span class="tile">👾</span><span class="tile">👾</span><span class="tile">👿</span><span class="tile">👾</span><span class="tile">👾</span>',['El 1','El 3','El 5'],1)
        ]),
        game('l7','La abeja de palabras','🐝','lenguaje','Ayuda a la abeja a encontrar la sílaba correcta.',[
          choice('Completa: CA + ___ = CASA','<span class="big">🏠</span>',['SA','PA','MA'],0),
          choice('Completa: ME + ___ = MESA','<span class="big">🪑</span>',['TA','SA','LA'],1),
          choice('Completa: LU + ___ = LUNA','<span class="big">🌙</span>',['NA','PA','MA'],0),
          choice('Completa: PE + ___ = PELOTA','<span class="big">⚽</span>',['LOTA','RRO','Z'],0),
          choice('Completa: MA + ___ + SA = MARIPOSA','<span class="big">🦋</span>',['RI-PO','RA-PO','RI-PA'],0)
        ]),
        game('l8','Rosco de sílabas trabadas','⭕','lenguaje','Reconoce combinaciones como br, pl, tr y gr.',[
          choice('¿Con qué sílaba empieza BRAZO?','<span class="big">💪</span>',['BRA','BA','PRA'],0),
          choice('¿Con qué sílaba empieza PLATO?','<span class="big">🍽️</span>',['PA','PLA','PRA'],1),
          choice('¿Con qué sílaba empieza TREN?','<span class="big">🚂</span>',['TER','TEN','TRE'],2),
          choice('¿Qué palabra empieza con GRA?','<span class="big">🌾</span>',['Grano','Plano','Brazo'],0),
          choice('Completa: ___ + MA = PLUMA','<span class="big">🪶</span>',['PLU','PU','PUL'],0)
        ]),
        game('l9','Tarros de sílabas','🫙','lenguaje','Clasifica palabras por su sílaba inicial.',[
          choice('¿En qué tarro va MESA?','<span class="big">🪑</span>',['MA','ME','MI'],1),
          choice('¿En qué tarro va SAPO?','<span class="big">🐸</span>',['SA','SO','SE'],0),
          choice('¿En qué tarro va LUNA?','<span class="big">🌙</span>',['LA','LE','LU'],2),
          choice('¿En qué tarro va PELOTA?','<span class="big">⚽</span>',['PA','PE','PI'],1),
          choice('¿Qué palabra pertenece al tarro TRA?','<span class="big">TRA</span>',['Trapo','Taza','Rana'],0)
        ]),
        game('l10','Canasta de vocales','🧺','lenguaje','Encuentra vocales iniciales y sonidos dentro de palabras.',[
          tap('Toca las vocales.',['A','M','E','S','I','P','O','L','U'],[0,2,4,6,8]),
          choice('¿Con qué vocal empieza AVIÓN?','<span class="big">✈️</span>',['A','E','I'],0),
          choice('¿Con qué vocal empieza ELEFANTE?','<span class="big">🐘</span>',['A','E','O'],1),
          choice('¿Qué vocal escuchas dos veces en OSO?','<span class="big">🐻</span>',['A','O','U'],1),
          choice('Completa: M _ R I P O S A','<span class="big">🦋</span>',['A','E','I'],0)
        ]),
        game('l11','Palabras dulces','🍬','lenguaje','Ordena sílabas para formar palabras.',[
          order('Forma CASA.',['SA','CA'],['CA','SA']),
          order('Forma MESA.',['SA','ME'],['ME','SA']),
          order('Forma PELOTA.',['TA','PE','LO'],['PE','LO','TA']),
          order('Forma MARIPOSA.',['PO','MA','SA','RI'],['MA','RI','PO','SA']),
          order('Forma CHOCOLATE.',['LA','CHO','TE','CO'],['CHO','CO','LA','TE'])
        ]),
        game('l12','Tarjetas de comprensión','📚','comprension','Lee pistas breves y encuentra la evidencia.',[
          choice('Lina llevó paraguas porque vio nubes oscuras. ¿Por qué lo llevó?','<span class="big">☁️ ☂️</span>',['Pensó que llovería','Quería jugar','Tenía calor'],0),
          choice('Tomás dejó agua para el perro antes de salir. ¿Qué muestra su acción?','<span class="big">🐕 💧</span>',['Cuidado','Prisa','Olvido'],0),
          choice('La planta se inclinó hacia la ventana. ¿Qué buscaba?','<span class="big">🌱 ☀️</span>',['Luz','Ruido','Frío'],0),
          choice('Ana guardó silencio mientras su amiga hablaba. ¿Qué hizo?','<span class="big">👂</span>',['Escuchó','Interrumpió','Se fue'],0),
          choice('El camino estaba mojado y había charcos. ¿Qué ocurrió antes?','<span class="big">💧</span>',['Llovió','Nevó','Hubo viento'],0)
        ]),
        game('l13','Busca y encuentra','🔭','visual','Explora escenas originales y toca solamente los objetivos.',[
          tap('Encuentra los cinco limones entre los pollitos.',['🐥','🍋','🐤','🐥','🎀','🐤','🍋','🐥','🧢','🐤','🍋','🐥','🐤','🍋','🐥','👓','🐤','🍋'],[1,6,10,13,17]),
          tap('Encuentra al pollito perdido entre los patos.',['🦆','🦆','🦆','🐤','🦆','🦆','🦆','🦆','🦆','🦆','🦆','🦆'],[3]),
          tap('Encuentra los tres cocos entre los osos.',['🧸','🥥','🧸','🧸','🧸','🥥','🧸','🧸','🥥','🧸','🧸','🧸','🧸','🧸','🧸'],[1,5,8]),
          tap('Busca: llama, cangrejo, colibrí, delfín y caracol.',['🦙','🦀','🐕','🐬','🦅','🐌','🐸','🐟','🐦','🦋','🦔','🦜','🐋','🐈','🐿️'],[0,1,3,5,8]),
          tap('Encuentra los seis animales marinos.',['🐠','🌿','🐙','🪨','🐬','⭐','🦀','🐚','🐢','🌊','🐳','☀️'],[0,2,4,6,8,10])
        ]),
        game('l14','Sombras que encajan','🌘','visual','Compara contornos, orientación y detalles.',[
          choice('¿Qué sombra corresponde a la palmera?','<span class="big">🌴</span>',['<span class="shadow-option">☂️</span>','<span class="shadow-option">🌴</span>','<span class="shadow-option">🌵</span>'],1),
          choice('¿Qué sombra corresponde al balde?','<span class="big">🪣</span>',['<span class="shadow-option">🪣</span>','<span class="shadow-option">🧺</span>','<span class="shadow-option">🥁</span>'],0),
          choice('Observa las orejas y elige la sombra del conejo.','<span class="big">🐇</span>',['<span class="shadow-option">🐈</span>','<span class="shadow-option">🐇</span>','<span class="shadow-option">🐿️</span>'],1),
          choice('¿Qué sombra tiene la misma cola que el pez?','<span class="big">🐟</span>',['<span class="shadow-option">🐟</span>','<span class="shadow-option">🐬</span>','<span class="shadow-option">🦭</span>'],0),
          choice('Nivel final: busca el mismo contorno del colibrí.','<span class="big">🐦</span>',['<span class="shadow-option">🦋</span>','<span class="shadow-option">🐦</span>','<span class="shadow-option">🦅</span>'],1)
        ]),
        game('l15','Cinco diferencias','🕵️','visual','Compara dos escenas y descubre qué cambió.',[
          choice('Escena A: 🐸🌼☀️ · Escena B: 🐸🌸☀️. ¿Qué cambió?','<span class="big">🐸 🌼 ☀️ &nbsp; | &nbsp; 🐸 🌸 ☀️</span>',['La flor','El sol','La rana'],0),
          choice('Escena A: 🏠🌳🐕 · Escena B: 🏠🌲🐕. ¿Qué cambió?','<span class="big">🏠 🌳 🐕 &nbsp; | &nbsp; 🏠 🌲 🐕</span>',['El perro','El árbol','La casa'],1),
          choice('Escena A: 🚲🎈☁️ · Escena B: 🛴🎈☁️. ¿Qué cambió?','<span class="big">🚲 🎈 ☁️ &nbsp; | &nbsp; 🛴 🎈 ☁️</span>',['El vehículo','El globo','La nube'],0),
          tap('Toca las cinco parejas diferentes.',['🍎🍎','🌙⭐','🐟🐟','🌼🌻','🔑🔑','🏠🏡','🦋🦋','⚽🏀','📘📘','🐈🐕'],[1,3,5,7,9]),
          tap('Reto final: encuentra seis cambios.',['🔴🔴','▲▼','🌿🌿','12·21','🐦🐦','AB·BA','☀️🌙','□□','🎵🎶','LR·RL'],[1,3,5,6,8,9])
        ]),
        game('l16','Rastros y caminos','🧭','patrones','Sigue pistas visuales y elige la ruta que conserva la regla.',[
          choice('La abeja avanza hacia la flor sin tocar la nube.','<span class="big">🐝 · ☁️ · 🌼</span>',['Por arriba','Atravesando la nube','Hacia atrás'],0),
          order('Repite el camino corto.',['Derecha','Arriba','Derecha'],['Derecha','Arriba','Derecha']),
          memory('Mira la ruta.',['↑','→','→','↓'],'¿Qué movimiento fue tercero?',['Arriba','Derecha','Abajo'],1),
          order('Ordena el rastro que lleva del nido al árbol.',['Abajo','Derecha','Arriba','Derecha'],['Derecha','Arriba','Derecha','Abajo']),
          memory('Recuerda la ruta larga.',['↑','→','↓','→','↑','↑'],'¿Qué dos movimientos cerraron la ruta?',['Arriba y arriba','Derecha y arriba','Abajo y derecha'],0)
        ]),
        game('l17','Parejas escondidas','🪄','visual','Recuerda asociaciones de imágenes y recupera la pareja correcta.',[
          memory('Relaciona cada animal con su lugar.',['🐟=🌊','🐦=🌳','🦙=⛰️'],'¿Dónde estaba la llama?',['Mar','Montaña','Árbol'],1),
          memory('Relaciona objeto y uso.',['🔑=🚪','✏️=📄','🥄=🥣'],'¿Qué acompañaba al lápiz?',['Puerta','Papel','Tazón'],1),
          memory('Relaciona color y figura.',['🔵=●','🟡=▲','🟢=■'],'¿Qué forma tenía el verde?',['Círculo','Triángulo','Cuadrado'],2),
          memory('Recuerda cuatro parejas.',['🌙=noche','☀️=día','🌧️=paraguas','❄️=abrigo'],'¿Qué se relacionaba con el paraguas?',['Lluvia','Nieve','Sol'],0),
          memory('Reto final de cinco parejas.',['1=🐝','2=🐢','3=🦊','4=🦉','5=🐬'],'¿Qué animal tenía el número 4?',['Zorro','Búho','Delfín'],1)
        ])
      ]
    },
    activacion: {
      label: 'Activación mental', storage: 'raices-activacion-mental-progreso',
      groups: {coordinacion:'Coordinación', atencion:'Atención', memoria:'Memoria', codigos:'Códigos y lógica'},
      games: [
        game('a1','Manos espejo','👐','coordinacion','Imita posiciones y reconoce secuencias bimanuales.',[
          choice('Imita las manos. ¿Cuál gesto viste a la derecha?','<span class="big">✊ + ✌️</span>',['Puño','Dos dedos','Pulgar'],1),
          choice('Haz ambos gestos. ¿Cuál corresponde a la izquierda?','<span class="big">👍 + ✋</span>',['Palma','Pulgar','Índice'],1),
          choice('Observa y repite. ¿Qué gesto va primero?','<span class="big">☝️ → 🤙</span>',['Meñique y pulgar','Índice','Palma'],1),
          choice('Cruza las manos e imita. ¿Qué pareja coincide?','<span class="big">✌️ + ✊</span>',['Dos dedos y puño','Palma y pulgar','Índice y palma'],0),
          memory('Recuerda la serie de manos.',['✊','✌️','👍','✋'],'¿Qué gesto apareció tercero?',['✌️','👍','✋'],1)
        ]),
        game('a2','Dedos de colores','🖐️','coordinacion','Relaciona cada dedo con una clave de color.',[
          choice('Clave: pulgar = rojo. ¿Qué dedo toca el rojo?','<span class="tile" style="background:#dd665b">🔴</span>',['Pulgar','Índice','Meñique'],0),
          choice('Clave: índice = verde.','<span class="tile" style="background:#6fa678">🟢</span>',['Medio','Índice','Anular'],1),
          choice('Clave: medio = azul.','<span class="tile" style="background:#4b8fcb">🔵</span>',['Medio','Pulgar','Meñique'],0),
          choice('Clave: anular = amarillo.','<span class="tile" style="background:#f0c94f">🟡</span>',['Índice','Anular','Medio'],1),
          memory('Recuerda las claves.',['🔴 Pulgar','🟢 Índice','🔵 Medio','🟡 Anular','🟣 Meñique'],'¿Qué color correspondía al meñique?',['Azul','Morado','Rojo'],1)
        ]),
        game('a3','Doble ruta','♾️','coordinacion','Sigue dos caminos al mismo tiempo y detecta el paso siguiente.',[
          choice('Sigue el ritmo con ambas manos. ¿Qué sigue?','<span class="tile">I</span><span class="tile">D</span><span class="tile">I</span><span class="tile">D</span><span class="tile">?</span>',['I','D','Ambas'],0),
          choice('Una mano toca color y la otra hace gesto.','<span class="tile">🔵✊</span><span class="tile">🟡✋</span><span class="tile">🔵✊</span><span class="tile">?</span>',['🟡✋','🔵✋','🟡✊'],0),
          choice('Sigue el cambio de dirección.','<span class="tile">↗</span><span class="tile">↘</span><span class="tile">↗</span><span class="tile">?</span>',['↘','↗','←'],0),
          memory('Recuerda el camino doble.',['🔴☝️','🟢✌️','🔵✊','🟡✋'],'¿Qué combinación fue segunda?',['🟢✌️','🔵✊','🟡✋'],0),
          choice('Combina dos reglas: color alterno y gesto creciente.','<span class="tile">🔴☝️</span><span class="tile">🔵✌️</span><span class="tile">🔴🤟</span><span class="tile">?</span>',['🔵✋','🔴✋','🔵☝️'],0)
        ]),
        game('a4','Ruleta forma-color','🎡','codigos','Cruza dos claves para encontrar una respuesta.',[
          choice('Clave: círculo = azul.','<span class="big">● = ?</span>',['Azul','Rojo','Verde'],0),
          choice('Clave: triángulo = amarillo.','<span class="big">▲ = ?</span>',['Verde','Amarillo','Azul'],1),
          choice('Círculo azul vale 2. ¿Cuánto valen dos círculos?','<span class="big">🔵 + 🔵</span>',['2','4','6'],1),
          choice('Triángulo amarillo vale 3 y cuadrado verde vale 4.','<span class="big">🟡▲ + 🟢■</span>',['6','7','8'],1),
          choice('¿Qué opción cumple: figura redonda y color frío?','<span class="big">?</span>',['🔵','🟥','🟡▲'],0)
        ]),
        game('a5','Coordenadas secretas','🗺️','codigos','Busca una casilla usando fila y columna.',[
          choice('En una cuadrícula, A2 significa…','<span class="big">A2</span>',['Fila A, columna 2','Fila 2, columna A','Dos filas'],0),
          choice('¿Qué coordenada marca fila B y columna 3?','<span class="big">B · 3</span>',['3B','B3','B2'],1),
          choice('La clave dice C1 = verde. ¿Qué color buscas?','<span class="big">C1</span>',['Verde','Azul','Rojo'],0),
          memory('Memoriza tres coordenadas.',['A2=🔴','B1=🟢','C3=🔵'],'¿Qué había en B1?',['Rojo','Verde','Azul'],1),
          choice('Si A1 vale 2 y B2 vale 5, ¿cuánto suman?','<span class="big">A1 + B2</span>',['6','7','8'],1)
        ]),
        game('a6','Espiral numérica','🌀','codigos','Sigue números y colores sin perder la ruta.',[
          choice('¿Qué número sigue?','<span class="tile">1</span><span class="tile">2</span><span class="tile">3</span><span class="tile">?</span>',['4','5','6'],0),
          choice('Avanza de dos en dos.','<span class="tile">2</span><span class="tile">4</span><span class="tile">6</span><span class="tile">?</span>',['7','8','10'],1),
          choice('Retrocede uno cada vez.','<span class="tile">9</span><span class="tile">8</span><span class="tile">7</span><span class="tile">?</span>',['5','6','8'],1),
          choice('Alterna +2 y +1.','<span class="tile">1</span><span class="tile">3</span><span class="tile">4</span><span class="tile">6</span><span class="tile">?</span>',['7','8','9'],0),
          choice('Duplica cada número.','<span class="tile">1</span><span class="tile">2</span><span class="tile">4</span><span class="tile">8</span><span class="tile">?</span>',['10','12','16'],2)
        ]),
        game('a7','Matrices en memoria','▦','memoria','Recuerda posiciones, colores y cantidades.',[
          memory('Mira la matriz.',['🔴','⚪','⚪','🔵'],'¿Qué color estaba abajo a la derecha?',['Rojo','Azul','Blanco'],1),
          memory('Mira las posiciones.',['★','●','▲','■'],'¿Qué figura apareció tercera?',['Círculo','Triángulo','Cuadrado'],1),
          memory('Recuerda la fila.',['2','5','1','4','3'],'¿Qué número estaba entre 5 y 4?',['1','2','3'],0),
          memory('Observa seis símbolos.',['🌙','☀️','🍃','⭐','💧','🔥'],'¿Qué apareció después de la estrella?',['Agua','Fuego','Hoja'],0),
          memory('Recuerda la matriz larga.',['A','3','🔵','B','7','🟢'],'¿Qué color acompañaba al 7?',['Azul','Verde','Rojo'],1)
        ]),
        game('a8','Planetas y colores','🪐','memoria','Relaciona imágenes con claves cromáticas.',[
          memory('Recuerda dos planetas.',['🌍=Azul','🪐=Amarillo'],'¿Qué color tenía Saturno?',['Azul','Amarillo','Verde'],1),
          choice('La Tierra se relaciona con…','<span class="big">🌍</span>',['Azul y verde','Rojo y negro','Morado y rosa'],0),
          memory('Observa la clave.',['☀️=Naranja','🌙=Gris','⭐=Amarillo'],'¿Qué color tenía la luna?',['Gris','Naranja','Amarillo'],0),
          choice('Si planeta rojo vale 4 y estrella vale 2.','<span class="big">🔴 + ⭐</span>',['5','6','7'],1),
          memory('Recuerda cuatro claves.',['🌍=3','🪐=5','🌙=2','☀️=6'],'¿Cuánto suman luna y Tierra?',['4','5','6'],1)
        ]),
        game('a9','Pieza de tangram','🟪','codigos','Descubre qué pieza completa la silueta.',[
          choice('¿Qué figura completa un cuadrado al lado de otro cuadrado?','<span class="big">■ + ?</span>',['■','▲','●'],0),
          choice('Dos triángulos iguales pueden formar…','<span class="big">▲ + ▲</span>',['Un cuadrado','Un círculo','Una estrella'],0),
          choice('¿Qué pieza tiene tres lados?','<span class="big">?</span>',['Triángulo','Rectángulo','Círculo'],0),
          choice('¿Qué pieza puede ser techo de una casa?','<span class="big">🏠</span>',['Triángulo','Círculo','Óvalo'],0),
          choice('¿Qué pieza encaja en un hueco con cuatro lados iguales?','<span class="big">□</span>',['Cuadrado','Triángulo','Círculo'],0)
        ]),
        game('a10','Números que faltan','🔢','atencion','Encuentra ausencias en secuencias y tablas.',[
          choice('¿Qué número falta?','<span class="tile">1</span><span class="tile">2</span><span class="tile">?</span><span class="tile">4</span>',['3','5','6'],0),
          choice('¿Qué número falta?','<span class="tile">5</span><span class="tile">10</span><span class="tile">?</span><span class="tile">20</span>',['12','15','18'],1),
          choice('¿Qué número falta entre 18 y 20?','<span class="big">18 · ? · 20</span>',['17','19','21'],1),
          choice('Secuencia descendente.','<span class="big">30 · 27 · 24 · ?</span>',['20','21','22'],1),
          choice('Encuentra el salto de cuatro.','<span class="big">4 · 8 · 12 · 16 · ?</span>',['18','20','22'],1)
        ]),
        game('a11','Dentro o fuera','📦','atencion','Ubica elementos según límites y posiciones.',[
          choice('¿Dónde está la estrella?','<span class="tile">□⭐</span>',['Dentro','Fuera','Encima'],0),
          choice('¿Dónde está el círculo?','<span class="big">□ &nbsp; ●</span>',['Dentro','Fuera','Debajo'],1),
          choice('El punto está bajo la línea.','<span class="big">────<br>●</span>',['Arriba','Abajo','Dentro'],1),
          choice('La hoja está entre dos flores.','<span class="big">🌼 🍃 🌼</span>',['Entre','Fuera','Sobre'],0),
          choice('¿Qué objeto está fuera del marco?','<span class="visual-frame">[ 🔑 🌙 ] &nbsp; ⭐</span>',['Llave','Luna','Estrella'],2)
        ]),
        game('a12','Cuenta estímulos','🧮','atencion','Cuenta objetivos entre elementos parecidos.',[
          choice('¿Cuántas estrellas hay?','<span class="big">★ ● ★ ▲ ★</span>',['2','3','4'],1),
          choice('¿Cuántas hojas hay?','<span class="big">🍃 🌼 🍃 🍂 🍃 🌼</span>',['2','3','4'],1),
          choice('¿Cuántos círculos azules hay?','<span class="big">🔵 🔴 🔵 🟢 🔵 🔴 🔵</span>',['3','4','5'],1),
          choice('Cuenta los triángulos.','<span class="big">▲ ■ ▲ ● ▲ ◆ ▲ ■ ▲</span>',['4','5','6'],1),
          choice('Cuenta solo los animales.','<span class="big">🐟 🌿 🐕 ☀️ 🦋 🪨 🐈 🌼 🐦</span>',['4','5','6'],1)
        ]),
        game('a13','Palabra o color','🌈','atencion','Inhibe la lectura automática y elige el color de la tinta.',[
          choice('Elige el color de la tinta, no la palabra.','<span class="word" style="color:#d9534f">AZUL</span>',['Rojo','Azul','Verde'],0),
          choice('Elige el color de la tinta.','<span class="word" style="color:#4684c1">VERDE</span>',['Verde','Azul','Amarillo'],1),
          choice('Elige el color de la tinta.','<span class="word" style="color:#6ca66f">ROJO</span>',['Rojo','Verde','Azul'],1),
          choice('Elige el color de la tinta.','<span class="word" style="color:#e0ae31">MORADO</span>',['Amarillo','Morado','Naranja'],0),
          choice('Ahora elige la palabra escrita, no el color.','<span class="word" style="color:#d9534f">VERDE</span>',['Rojo','Verde','Azul'],1)
        ]),
        game('a14','Ruta rápida','🌳','atencion','Elige movimientos para llegar a la meta sin chocar.',[
          order('Llega a la hoja: dos pasos a la derecha.',['Derecha','Derecha'],['Derecha','Derecha']),
          order('Llega a la estrella: arriba, derecha, derecha.',['Derecha','Arriba','Derecha'],['Arriba','Derecha','Derecha']),
          order('Cruza el puente: abajo, derecha, arriba.',['Arriba','Abajo','Derecha'],['Abajo','Derecha','Arriba']),
          order('Rodea la roca: derecha, arriba, derecha, abajo.',['Abajo','Derecha','Arriba','Derecha'],['Derecha','Arriba','Derecha','Abajo']),
          order('Ruta final: arriba, derecha, abajo, derecha, arriba.',['Derecha','Arriba','Arriba','Abajo','Derecha'],['Arriba','Derecha','Abajo','Derecha','Arriba'])
        ]),
        game('a15','Microdesafíos','💡','codigos','Resuelve adivinanzas y pequeños problemas.',[
          choice('Tiene pétalos y gira buscando el sol.','<span class="big">🌻</span>',['Girasol','Reloj','Nube'],0),
          choice('Tiene dientes, pero no puede comer.','<span class="big">?</span>',['Peine','Silla','Vaso'],0),
          choice('Sube llena y baja vacía; si se demora, la sopa se enfría.','<span class="big">?</span>',['Cuchara','Escalera','Puerta'],0),
          choice('Me hago más pequeño cada vez que me baño.','<span class="big">🧼</span>',['Jabón','Toalla','Agua'],0),
          choice('Cuanto más seca, más mojada queda.','<span class="big">?</span>',['Toalla','Arena','Luz'],0)
        ]),
        game('a16','Atención alternante','🚦','atencion','Cambia de regla con calma y conserva la consigna actual.',[
          tap('Regla 1: toca solamente los elementos rojos.',['🔴','🔵','🟥','🟢','🍎','🟡','🔺','🔵'],[0,2,4,6]),
          tap('Regla 2: ahora toca solamente los círculos.',['🔴','🟦','🟢','🟥','🔵','🟨','🟣','🔶'],[0,2,4,6]),
          tap('Regla 3: toca animales, no plantas.',['🐕','🌿','🐈','🌼','🦋','🍃','🐦','🌵'],[0,2,4,6]),
          tap('Regla 4: toca números pares.',['1','2','3','4','5','6','7','8'],[1,3,5,7]),
          tap('Regla final: toca figuras azules o estrellas amarillas.',['🔵','🟡','💙','⭐','🟦','🌟','🔷','☀️'],[0,3,4,5,6])
        ]),
        game('a17','Copia la matriz','▦','memoria','Mira posiciones, cubre la matriz y recupera el patrón.',[
          memory('Observa la matriz 2 por 2.',['🔴','⚪','⚪','🔵'],'¿Qué color estaba abajo a la derecha?',['Rojo','Azul','Blanco'],1),
          memory('Observa la fila.',['⭐','●','▲','■'],'¿Qué figura estaba entre la estrella y el triángulo?',['Círculo','Cuadrado','Estrella'],0),
          memory('Mira seis posiciones.',['🟢','⚪','🟡','⚪','🔵','⚪'],'¿Qué color estaba en la quinta posición?',['Azul','Verde','Amarillo'],0),
          memory('Recuerda la matriz 3 por 3.',['⭐','○','○','○','▲','○','○','○','■'],'¿Qué figura estaba en el centro?',['Estrella','Triángulo','Cuadrado'],1),
          memory('Reto final de nueve posiciones.',['A','2','🔵','B','5','🟢','C','8','🟡'],'¿Qué color acompañaba al 8?',['Azul','Verde','Amarillo'],2)
        ]),
        game('a18','Cuenta y cambia','🔁','atencion','Alterna entre cantidad, color y forma sin perder la consigna.',[
          choice('Cuenta solo las estrellas.','<span class="big">⭐ ● ⭐ ▲ ⭐</span>',['2','3','4'],1),
          choice('Ahora ignora la cantidad y elige el color.','<span class="word" style="color:#4b8fcb">ROJO</span>',['Rojo','Azul','Verde'],1),
          choice('Vuelve a contar: ¿cuántos animales hay?','<span class="big">🐟 🌿 🐕 ☀️ 🦋</span>',['2','3','4'],1),
          choice('Ahora elige la forma, no el color.','<span class="big" style="color:#dc7f58">▲</span>',['Triángulo','Naranja','Círculo'],0),
          memory('Cambia una vez más.',['2=🔵','4=⭐','6=🌿','8=🐦'],'¿Qué imagen acompañaba al 6?',['Hoja','Ave','Estrella'],0)
        ]),
        game('a19','Ritmo visual','🥁','coordinacion','Observa pulsos, repite secuencias y aumenta su longitud.',[
          order('Repite el ritmo de dos golpes.',['Palma','Mesa'],['Palma','Mesa']),
          order('Repite el ritmo de tres golpes.',['Palma','Palma','Mesa'],['Palma','Mesa','Palma']),
          memory('Mira el ritmo.',['👏','🫳','👏','🫳'],'¿Qué gesto fue tercero?',['Palma','Mesa','Pausa'],0),
          order('Ordena el ritmo de cinco pasos.',['Pausa','Palma','Mesa','Palma','Mesa'],['Palma','Mesa','Palma','Pausa','Mesa']),
          memory('Ritmo final de seis pulsos.',['👏','🫳','🤫','👏','🫳','👏'],'¿Cuáles fueron los dos últimos?',['Mesa y palma','Palma y mesa','Pausa y palma'],0)
        ])
      ]
    },
    lectoescritura: {
      label: 'Lectoescritura', storage: 'raices-lectoescritura-progreso',
      groups: {vocales:'Vocales y sonidos', silabas:'Sílabas', palabras:'Palabras', lectura:'Lectura y comprensión'},
      games: [
        game('e1','Vocales viajeras','🔤','vocales','Reconoce vocales por sonido, forma y posición.',[
          choice('¿Con qué vocal empieza ÁRBOL?','<span class="big">🌳</span>',['A','E','O'],0),
          choice('¿Con qué vocal empieza IGLESIA?','<span class="big">⛪</span>',['E','I','U'],1),
          choice('¿Qué vocal falta en OSO?','<span class="big">_ S O</span>',['A','O','U'],1),
          tap('Toca solo las vocales.',['A','T','E','R','I','P','O','M','U','S'],[0,2,4,6,8]),
          typing('Escribe las cinco vocales en orden.','<span class="big">A E I O U</span>',['aeiou','a e i o u'])
        ]),
        game('e2','Sonido inicial','👂','vocales','Escucha el inicio y relaciónalo con una letra.',[
          choice('¿Qué sonido inicia MESA?','<span class="big">🪑</span>',['M','S','P'],0),
          choice('¿Qué sonido inicia SAPO?','<span class="big">🐸</span>',['L','S','T'],1),
          choice('¿Qué sonido inicia LUNA?','<span class="big">🌙</span>',['N','L','M'],1),
          choice('¿Qué dos palabras empiezan igual?','<span class="big">🍅 🐢 🌙</span>',['Tomate y tortuga','Tortuga y luna','Tomate y luna'],0),
          choice('¿Cuál empieza con el sonido /p/?','<span class="big">⚽ 🏠 🌼</span>',['Pelota','Casa','Flor'],0)
        ]),
        game('e3','Reloj del alfabeto','🕐','palabras','Ordena letras y encuentra vecinas.',[
          choice('¿Qué letra sigue después de A?','<span class="big">A → ?</span>',['B','C','D'],0),
          choice('¿Qué letra está antes de D?','<span class="big">? → D</span>',['A','B','C'],2),
          order('Ordena estas letras.',['C','A','B'],['A','B','C']),
          order('Ordena estas letras.',['G','E','F','D'],['D','E','F','G']),
          choice('¿Qué letra completa la serie?','<span class="big">M · N · ? · P</span>',['Ñ','O','Q'],1)
        ]),
        game('e4','Sílabas simples','🧱','silabas','Combina consonante y vocal para formar sílabas.',[
          choice('M + A forma…','<span class="big">M + A</span>',['MA','AM','ME'],0),
          choice('P + E forma…','<span class="big">P + E</span>',['PE','EP','PI'],0),
          choice('¿Qué sílaba inicia LUNA?','<span class="big">🌙</span>',['LA','LE','LU'],2),
          order('Forma MESA.',['SA','ME'],['ME','SA']),
          typing('Escribe la primera sílaba de PELOTA.','<span class="big">⚽</span>',['pe'])
        ]),
        game('e5','Sílabas trabadas','🚂','silabas','Practica br, bl, tr, pl, gr y otras combinaciones.',[
          choice('¿Qué sílaba inicia BRAZO?','<span class="big">💪</span>',['BRA','BA','BAR'],0),
          choice('¿Qué sílaba inicia PLUMA?','<span class="big">🪶</span>',['PU','PLU','PUL'],1),
          choice('¿Qué sílaba inicia TREN?','<span class="big">🚂</span>',['TER','TRE','TE'],1),
          choice('¿Qué palabra comienza con GLO?','<span class="big">?</span>',['Globo','Gorro','Lobo'],0),
          typing('Completa la palabra: ___SA','<span class="big">🍓 FRESA</span>',['fre'])
        ]),
        game('e6','Palmas y sílabas','👏','silabas','Cuenta golpes de voz en cada palabra.',[
          choice('¿Cuántas sílabas tiene SOL?','<span class="big">☀️ SOL</span>',['1','2','3'],0),
          choice('¿Cuántas sílabas tiene CASA?','<span class="big">🏠 CA-SA</span>',['1','2','3'],1),
          choice('¿Cuántas sílabas tiene PELOTA?','<span class="big">⚽ PE-LO-TA</span>',['2','3','4'],1),
          choice('¿Cuántas sílabas tiene MARIPOSA?','<span class="big">🦋 MA-RI-PO-SA</span>',['3','4','5'],1),
          choice('¿Qué palabra tiene cuatro sílabas?','<span class="big">?</span>',['Sol','Camino','Chocolate'],2)
        ]),
        game('e7','Rompecabezas de palabras','🧩','palabras','Ordena sílabas y construye palabras completas.',[
          order('Forma LUNA.',['NA','LU'],['LU','NA']),
          order('Forma CAMINO.',['NO','CA','MI'],['CA','MI','NO']),
          order('Forma PELOTA.',['LO','TA','PE'],['PE','LO','TA']),
          order('Forma MARIPOSA.',['RI','SA','MA','PO'],['MA','RI','PO','SA']),
          order('Forma COMPUTADORA.',['DO','COM','RA','PU','TA'],['COM','PU','TA','DO','RA'])
        ]),
        game('e8','Letra e imagen','🖼️','palabras','Relaciona letras, sonidos e imágenes.',[
          choice('¿Qué imagen empieza con A?','<span class="big">?</span>',['✈️ Avión','🌙 Luna','🐟 Pez'],0),
          choice('¿Qué imagen empieza con F?','<span class="big">?</span>',['🏠 Casa','🌼 Flor','☀️ Sol'],1),
          choice('¿Qué imagen termina con O?','<span class="big">?</span>',['🐸 Sapo','🌙 Luna','🌼 Flor'],0),
          choice('¿Qué palabra contiene la letra R?','<span class="big">?</span>',['Mesa','Rana','Luna'],1),
          choice('¿Qué palabra empieza y termina con A?','<span class="big">?</span>',['Ala','Oso','Sol'],0)
        ]),
        game('e9','Boca y sonido','👄','vocales','Observa cómo se articula y elige el sonido.',[
          choice('Labios juntos y luego se abren: /m/. ¿Qué letra?','<span class="big">👄 mmm</span>',['M','S','L'],0),
          choice('El aire sale suave entre los dientes: /s/.','<span class="big">👄 sss</span>',['F','S','P'],1),
          choice('La lengua toca detrás de los dientes: /l/.','<span class="big">👅 lll</span>',['L','M','T'],0),
          choice('Los labios explotan suavemente: /p/.','<span class="big">👄 p</span>',['B','P','D'],1),
          choice('¿Qué sonido escuchas al inicio de RANA?','<span class="big">🐸 rrr</span>',['R','L','N'],0)
        ]),
        game('e10','Grafismo fonético','✍️','palabras','Une sonido, gesto gráfico y palabra.',[
          choice('¿Qué trazo se parece al camino de una ola?','<span class="big">〰️</span>',['Curvo','Recto','Punteado'],0),
          choice('La letra I mayúscula usa principalmente…','<span class="big">I</span>',['Línea recta','Círculo','Espiral'],0),
          choice('La letra O se forma con un trazo…','<span class="big">O</span>',['Cerrado y curvo','Recto','En zigzag'],0),
          choice('¿Qué letra tiene dos montañas?','<span class="big">M</span>',['M','O','L'],0),
          choice('¿Qué palabra combina tres sílabas y empieza con P?','<span class="big">?</span>',['Pelota','Sol','Mesa'],0)
        ]),
        game('e11','Lectura con ritmo','🎵','lectura','Lee de palabras a frases con pausas claras.',[
          choice('Lee: “La luna brilla”. ¿Qué brilla?','<span class="word">La luna brilla.</span>',['La luna','La casa','La flor'],0),
          choice('Lee: “El perro corre rápido”. ¿Cómo corre?','<span class="word">El perro corre rápido.</span>',['Lento','Rápido','Dormido'],1),
          choice('Lee: “Ana guarda dos semillas”. ¿Cuántas guarda?','<span class="word">Ana guarda dos semillas.</span>',['Una','Dos','Tres'],1),
          choice('Lee: “Después de llover, salió el sol”. ¿Qué pasó primero?','<span class="word">Después de llover, salió el sol.</span>',['Llovió','Salió el sol','Anocheció'],0),
          choice('Lee: “Aunque estaba cansado, Leo terminó su dibujo”. ¿Qué hizo Leo?','<span class="word">Aunque estaba cansado, Leo terminó su dibujo.</span>',['Lo terminó','Lo perdió','No empezó'],0)
        ]),
        game('e12','Comprendo y explico','📖','lectura','Encuentra información, causas e ideas principales.',[
          choice('Mila regó la planta porque la tierra estaba seca. ¿Cuál fue la causa?','<span class="big">🌱💧</span>',['La tierra estaba seca','La planta era alta','Había viento'],0),
          choice('El gato se escondió bajo la cama al escuchar un trueno. ¿Por qué se escondió?','<span class="big">🐈⚡</span>',['Tuvo miedo','Tenía hambre','Quería jugar'],0),
          choice('Pedro llevó una botella reutilizable para evitar plástico. ¿Qué quería cuidar?','<span class="big">🌎</span>',['El ambiente','Su mochila','La mesa'],0),
          choice('“Primero mezcló la harina; luego añadió agua”. ¿Qué hizo después de mezclar?','<span class="big">🥣</span>',['Añadió agua','Encendió una luz','Guardó la harina'],0),
          choice('Luz pidió ayuda, probó otra estrategia y terminó el reto. ¿Cuál es la idea principal?','<span class="big">💡</span>',['Persistió usando apoyo','Ganó una carrera','Trabajó sola'],0)
        ]),
        game('e13','¿Dónde suena?','📍','vocales','Ubica un sonido al inicio, en medio o al final de la palabra.',[
          choice('¿Dónde suena /m/ en MESA?','<span class="big">🪑 MESA</span>',['Al inicio','En medio','Al final'],0),
          choice('¿Dónde suena /s/ en CASA?','<span class="big">🏠 CASA</span>',['Al inicio','En medio','Al final'],1),
          choice('¿Dónde suena /l/ en SOL?','<span class="big">☀️ SOL</span>',['Al inicio','En medio','Al final'],2),
          choice('¿Dónde aparece el sonido /r/ en CARA?','<span class="big">🙂 CARA</span>',['Al inicio','En medio','Al final'],1),
          choice('¿En qué palabra /n/ aparece al inicio y al final?','<span class="big">?</span>',['Nube','Nadan','Luna'],1)
        ]),
        game('e14','Sonidos cercanos','👂','vocales','Escucha y diferencia palabras que cambian por un solo sonido.',[
          choice('Queñal dice PALA. ¿Qué imagen corresponde?','<span class="big">PALA</span>',['🪏 Pala','⚽ Bala','🪽 Ala'],0),
          choice('Queñal dice TAZA. ¿Qué palabra escuchaste?','<span class="big">☕</span>',['Casa','Taza','Masa'],1),
          choice('¿Qué palabra cambia L por S en LANA?','<span class="big">LANA → ?</span>',['Sana','Lata','Luna'],0),
          choice('¿Qué par empieza con sonidos diferentes?','<span class="big">🐱 GATO · 🦆 PATO</span>',['Gato y pato','Gato y gorro','Pato y pala'],0),
          choice('Nivel final: ¿qué palabra oyes al cambiar /p/ por /m/ en PESA?','<span class="big">PESA → M...</span>',['Mesa','Misa','Masa'],0)
        ]),
        game('e15','Familias de sonidos','🗂️','palabras','Agrupa palabras por el sonido que comparten.',[
          tap('Toca las palabras que empiezan con M.',['Mesa','Sapo','Mano','Luna','Mapa','Pato','Mono','Casa'],[0,2,4,6]),
          tap('Toca las palabras que empiezan con P.',['Pera','Mala','Pino','Silla','Puma','Lata','Pato','Nube'],[0,2,4,6]),
          tap('Toca las palabras que contienen L.',['Sol','Mesa','Luna','Pato','Ala','Nube','Pelo','Casa'],[0,2,4,6]),
          tap('Toca las palabras que terminan en A.',['Casa','Sol','Luna','Pan','Mesa','Tren','Pera','Mar'],[0,2,4,6]),
          tap('Reto final: toca palabras con R fuerte al inicio.',['Rana','Cara','Roca','Pera','Río','Loro','Rueda','Mar'],[0,2,4,6])
        ]),
        game('e16','Frases que crecen','🌱','lectura','Ordena palabras para construir frases cada vez más largas.',[
          order('Forma una frase de dos palabras.',['corre','Lola'],['Lola','corre']),
          order('Forma una frase de tres palabras.',['salta','alto','Kantu'],['Kantu','salta','alto']),
          order('Forma una frase de cinco palabras.',['El','niño','riega','el','huerto'],['El','niño','riega','el','huerto']),
          order('Forma la frase completa.',['libro','lee','un','interesante','Mila'],['Mila','lee','un','libro','interesante']),
          order('Reto final con causa.',['llovía','porque','Lina','paraguas','llevó'],['Lina','llevó','paraguas','porque','llovía'])
        ]),
        game('e17','Pistas de letras','🔎','palabras','Busca letras dentro de palabras y resuelve pistas visuales.',[
          tap('Encuentra todas las A.',['A','M','E','A','I','P','A','O','U','A'],[0,3,6,9]),
          tap('Encuentra las letras de SOL en cualquier orden.',['S','A','O','M','L','P','E','R'],[0,2,4]),
          choice('Empieza con C, termina con A y sirve para vivir.','<span class="big">C _ _ A</span>',['Casa','Cama','Copa'],0),
          choice('Tiene dos sílabas, empieza con LU y aparece de noche.','<span class="big">LU _ _</span>',['Luna','Lupa','Luz'],0),
          typing('Completa la palabra del dibujo.','<span class="big">🦙 LLA _ A</span>',['llama','ma'])
        ])
      ]
    }
  };

  const collectionKey = document.body.dataset.collection;
  const config = collections[collectionKey];
  if (!config) return;

  const $ = selector => document.querySelector(selector);
  const dialog = $('#collection-dialog');
  const dialogBody = $('#collection-dialog-body');
  const completeButton = $('#collection-complete');
  const saved = new Set(JSON.parse(localStorage.getItem(config.storage) || '[]'));
  const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let activeFilter = 'all';
  let currentGame = null;
  let currentRound = 0;
  let cleanRound = () => {};
  let audioContext = null;

  const strip = html => {
    const holder = document.createElement('div'); holder.innerHTML = html || ''; return holder.textContent.replace(/\s+/g,' ').trim();
  };
  const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const shuffle = items => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [copy[i],copy[j]] = [copy[j],copy[i]]; }
    return copy;
  };
  function speak(text) {
    if (!canSpeak || !text) return;
    if (window.RaicesVoice) { window.RaicesVoice.speak(strip(text)); return; }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(strip(text)); utterance.lang = 'es-PE'; utterance.rate = .76; utterance.pitch = .98; utterance.volume = .88;
    const voices = speechSynthesis.getVoices(); utterance.voice = voices.find(v => /^es-PE/i.test(v.lang)) || voices.find(v => /^es/i.test(v.lang)) || null;
    speechSynthesis.speak(utterance);
  }
  function tone(frequency, duration=.14, type='sine', volume=.055, delay=0) {
    try {
      if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const start=audioContext.currentTime+delay, oscillator=audioContext.createOscillator(), gain=audioContext.createGain();
      oscillator.type=type; oscillator.frequency.value=frequency; gain.gain.setValueAtTime(.0001,start); gain.gain.exponentialRampToValueAtTime(volume,start+.015); gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
      oscillator.connect(gain).connect(audioContext.destination); oscillator.start(start); oscillator.stop(start+duration+.03);
    } catch (_) { /* La actividad continúa si el navegador bloquea el audio. */ }
  }
  function successSound(){tone(523,.12);tone(659,.12,'sine',.06,.12);tone(784,.2,'sine',.065,.24)}
  function gentleSound(){tone(230,.12,'triangle',.035);tone(205,.16,'triangle',.035,.12)}
  function confetti(){
    const layer=document.createElement('div'); layer.className='collection-confetti'; const colors=['#dc7f58','#e2b954','#4b7790','#6f9277','#ef8c8c','#8f6bb3'];
    for(let i=0;i<48;i+=1){const bit=document.createElement('i');bit.style.setProperty('--x',`${Math.random()*100}%`);bit.style.setProperty('--dx',`${-100+Math.random()*200}px`);bit.style.setProperty('--delay',`${Math.random()*.18}s`);bit.style.setProperty('--spin',`${240+Math.random()*760}deg`);bit.style.background=colors[i%colors.length];layer.append(bit)}
    dialog.querySelector('.mind-dialog-card').append(layer); setTimeout(()=>layer.remove(),1500);
  }
  function guide(text){
    return `<div class="collection-guide"><img src="assets/personaje-quenal-v2.webp" alt="Queñal"><p><b>Queñal te acompaña</b>${text}</p><button type="button" data-listen>🔊 Escuchar</button><button type="button" data-stop>Detener</button></div>`;
  }
  function bindGuide(round){
    const listen=dialogBody.querySelector('[data-listen]'), stop=dialogBody.querySelector('[data-stop]');
    if(listen) listen.onclick=()=>speak(`${currentGame.title}. ${round.cue} ${round.prompt}`);
    if(stop) stop.onclick=()=>window.RaicesVoice?window.RaicesVoice.stop():(canSpeak&&speechSynthesis.cancel());
  }
  function levelBar(){
    const total=currentGame.rounds.length, step=currentRound+1, level=Math.min(5,Math.ceil(step/Math.max(1,total/5)));
    return `<div class="collection-level"><b>Nivel ${level}</b><span>Reto ${step} de ${total}</span><em>${Math.round(step/total*100)}%</em></div><div class="collection-level-track"><i style="width:${step/total*100}%"></i></div>`;
  }
  function feedback(){return '<p class="collection-feedback" aria-live="polite"><span class="collection-light" aria-hidden="true"></span><strong>Queñal espera tu respuesta.</strong></p>'}
  function setFeedback(message,kind){const box=dialogBody.querySelector('.collection-feedback');if(!box)return;box.className=`collection-feedback ${kind||''}`;box.innerHTML=`<span class="collection-light" aria-hidden="true"></span><strong>${message}</strong>`}
  function coach(message='Mira con calma y prueba otra vez.'){
    gentleSound(); dialogBody.classList.remove('collection-success-flash'); void dialogBody.offsetWidth; dialogBody.classList.add('collection-warm-flash'); setFeedback(message,'coach'); speak(message);
  }
  function success(message='¡Muy bien! Encontraste la respuesta.'){
    successSound(); confetti(); dialogBody.classList.remove('collection-warm-flash'); void dialogBody.offsetWidth; dialogBody.classList.add('collection-success-flash'); setFeedback(message,'success'); speak(message);
    const next=document.createElement('button'); next.type='button'; next.className='collection-next'; next.textContent=currentRound===currentGame.rounds.length-1?'Ver mi logro':'Siguiente reto'; next.onclick=nextRound; dialogBody.append(next); setTimeout(()=>next.focus(),220);
  }
  function nextRound(){cleanRound();cleanRound=()=>{};currentRound+=1;if(currentRound>=currentGame.rounds.length)finishGame();else renderRound()}
  function finishGame(){
    saved.add(currentGame.id);localStorage.setItem(config.storage,JSON.stringify([...saved]));updateProgress();renderCards(activeFilter);
    completeButton.disabled=false;completeButton.textContent='Cerrar y conservar mi progreso';
    dialogBody.innerHTML=`${guide('Terminaste todos los retos de esta actividad.')}<div class="collection-visual"><span class="big">🏆</span><div><h3>¡Actividad completada!</h3><p>Tu esfuerzo encendió una nueva luz en el recorrido.</p></div></div><p class="collection-feedback success"><span class="collection-light"></span><strong>¡Queñal celebra contigo!</strong></p>`;bindGuide({cue:'Actividad completada.',prompt:'Queñal celebra contigo.'});confetti();successSound();speak('¡Actividad completada! Queñal celebra contigo.');
  }
  function renderRound(){
    cleanRound(); cleanRound=()=>{}; const round=currentGame.rounds[currentRound]; completeButton.disabled=true; completeButton.textContent='Completa los retos';
    if(round.type==='choice') renderChoice(round); else if(round.type==='order') renderOrder(round); else if(round.type==='memory') renderMemory(round); else if(round.type==='tap') renderTap(round); else renderTyping(round);
  }
  function base(round,inside){return `${guide(round.cue)}${levelBar()}<p class="collection-prompt">${round.prompt}</p>${round.visual?`<div class="collection-visual">${round.visual}</div>`:''}${inside}${feedback()}`}
  function renderChoice(round){
    dialogBody.innerHTML=base(round,`<div class="collection-options">${round.options.map((item,index)=>`<button type="button" data-answer="${index}">${item}</button>`).join('')}</div>`);bindGuide(round);
    dialogBody.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{
      if(dialogBody.querySelector('.collection-next'))return; const index=Number(button.dataset.answer);
      if(index===round.answer){button.classList.add('correct');dialogBody.querySelectorAll('[data-answer]').forEach(option=>option.disabled=true);success()}else{button.classList.add('try');setTimeout(()=>button.classList.remove('try'),500);coach('Casi. Observa otra vez la pista y elige una opción diferente.')}
    });
  }
  function renderOrder(round){
    const mixed=shuffle(round.items);dialogBody.innerHTML=base(round,`<div class="collection-order">${mixed.map(item=>`<button type="button" data-item="${item}">${item}</button>`).join('')}</div><div class="collection-actions"><button type="button" class="collection-action" data-clear>Limpiar orden</button></div>`);bindGuide(round);let selected=[];
    const clear=()=>{selected=[];dialogBody.querySelectorAll('[data-item]').forEach(button=>{button.disabled=false;button.removeAttribute('data-step')})};dialogBody.querySelector('[data-clear]').onclick=clear;
    dialogBody.querySelectorAll('[data-item]').forEach(button=>button.onclick=()=>{button.disabled=true;selected.push(button.dataset.item);button.dataset.step=selected.length;if(selected.length===round.answer.length){if(selected.every((item,index)=>item===round.answer[index])){success('¡El orden tiene sentido!')}else{coach('La ruta todavía puede mejorar. Limpia y prueba otro orden.');setTimeout(clear,700)}}});
  }
  function renderMemory(round){
    dialogBody.innerHTML=base(round,`<div class="collection-memory" style="--memory-cols:${Math.min(6,round.items.length)};--memory-mobile-cols:${Math.min(3,round.items.length)}">${round.items.map(item=>`<span>${item}</span>`).join('')}</div><div class="collection-options" data-memory-options hidden>${round.options.map((item,index)=>`<button type="button" data-answer="${index}">${item}</button>`).join('')}</div>`);bindGuide(round);const tray=dialogBody.querySelector('.collection-memory'),options=dialogBody.querySelector('[data-memory-options]');let timer=setTimeout(()=>{tray.classList.add('covered');dialogBody.querySelector('.collection-prompt').textContent=round.question;options.hidden=false;speak(round.question)},2600);cleanRound=()=>clearTimeout(timer);
    dialogBody.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{if(dialogBody.querySelector('.collection-next'))return;if(Number(button.dataset.answer)===round.answer){button.classList.add('correct');tray.classList.remove('covered');dialogBody.querySelectorAll('[data-answer]').forEach(option=>option.disabled=true);success('¡Tu memoria encontró la pista!')}else{button.classList.add('try');setTimeout(()=>button.classList.remove('try'),500);coach('Todavía hay otra posibilidad. Respira y recuerda la imagen.')}});
  }
  function renderTap(round){
    dialogBody.innerHTML=base(round,`<div class="collection-tap-grid" style="--tap-cols:${Math.min(8,round.cells.length)};--tap-mobile-cols:${Math.min(5,round.cells.length)}">${round.cells.map((item,index)=>`<button type="button" data-cell="${index}">${item}</button>`).join('')}</div>`);bindGuide(round);const found=new Set();
    dialogBody.querySelectorAll('[data-cell]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.cell);if(round.targets.includes(index)){button.disabled=true;button.classList.add('selected');found.add(index);tone(420+found.size*40,.09);setFeedback(`Encontraste ${found.size} de ${round.targets.length}.`,found.size===round.targets.length?'success':'');if(found.size===round.targets.length)success('¡Los encontraste todos!')}else{button.classList.add('wrong');setTimeout(()=>button.classList.remove('wrong'),450);coach('Ese elemento no es el objetivo. Mira la consigna y continúa.')}});
  }
  function renderTyping(round){
    dialogBody.innerHTML=base(round,`<label class="collection-input"><span>Tu respuesta</span><input type="text" autocomplete="off" placeholder="Escribe aquí"></label><div class="collection-actions"><button type="button" class="collection-action primary" data-check>Comprobar</button></div>`);bindGuide(round);const input=dialogBody.querySelector('input'),check=dialogBody.querySelector('[data-check]');const verify=()=>{if(round.answers.map(normalize).includes(normalize(input.value))){input.disabled=true;check.disabled=true;success('¡La palabra quedó completa!')}else{input.focus();coach('Revisa el sonido o el orden de las letras y vuelve a intentar.')}};check.onclick=verify;input.onkeydown=event=>{if(event.key==='Enter')verify()};
  }
  function openGame(item){
    currentGame=item;currentRound=0;$('#collection-dialog-title').textContent=item.title;$('#collection-dialog-meta').textContent=`${config.label} · ${config.groups[item.group]}`;dialog.hidden=false;document.body.classList.add('mind-dialog-open');renderRound();setTimeout(()=>$('#collection-close').focus(),20);
  }
  function closeDialog(){cleanRound();cleanRound=()=>{};if(window.RaicesVoice)window.RaicesVoice.stop();else if(canSpeak)speechSynthesis.cancel();dialog.hidden=true;document.body.classList.remove('mind-dialog-open')}
  function renderFilters(){
    const holder=$('#collection-filters');holder.innerHTML=`<button type="button" class="is-active" data-filter="all">Todas</button>${Object.entries(config.groups).map(([key,label])=>`<button type="button" data-filter="${key}">${label}</button>`).join('')}`;
    holder.querySelectorAll('button').forEach(button=>button.onclick=()=>{activeFilter=button.dataset.filter;holder.querySelectorAll('button').forEach(item=>item.classList.toggle('is-active',item===button));renderCards(activeFilter)});
  }
  function renderCards(filter='all'){
    const grid=$('#collection-grid');grid.innerHTML='';config.games.filter(item=>filter==='all'||item.group===filter).forEach((item,index)=>{const card=document.createElement('article');card.className=`collection-card${saved.has(item.id)?' is-done':''}`;card.style.setProperty('--card-soft',['#e5f1ee','#f7eadb','#eaf0f7','#f5e8f2'][index%4]);card.innerHTML=`<span class="collection-card-icon">${item.icon}</span><p class="collection-card-meta">${config.groups[item.group]} · ${item.rounds.length} retos</p><h3>${item.title}</h3><p>${item.description}</p><button type="button">${saved.has(item.id)?'Volver a jugar':'Abrir juego'}</button><span class="collection-card-status">✓ Completado</span>`;card.querySelector('button').onclick=()=>openGame(item);grid.append(card)});
  }
  function updateProgress(){
    const total=config.games.length,count=saved.size;$('#collection-progress-count').textContent=count;$('#collection-progress-total').textContent=total;$('#collection-progress-bar').style.width=`${count/total*100}%`;$('#collection-diploma').hidden=count<total;
  }
  $('#collection-close').onclick=closeDialog;completeButton.onclick=closeDialog;$('#collection-again').onclick=()=>{currentRound=0;renderRound()};dialog.onclick=event=>{if(event.target===dialog)closeDialog()};document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!dialog.hidden)closeDialog()});
  $('#collection-reset').onclick=()=>{if(!confirm('¿Quieres reiniciar el progreso de esta colección en este dispositivo?'))return;saved.clear();localStorage.removeItem(config.storage);updateProgress();renderCards(activeFilter)};
  const soundPlayers=[...document.querySelectorAll('.sound-grid audio')];
  soundPlayers.forEach(player=>player.addEventListener('play',()=>soundPlayers.forEach(other=>{if(other!==player)other.pause()})));
  renderFilters();renderCards();updateProgress();
})();

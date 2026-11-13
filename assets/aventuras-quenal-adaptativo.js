(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const PROFILE_KEY = 'raices-quenal-interests-v1';
  const safeText = (value, max = 40) => String(value || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
  const image = (topic, number, version = 'v1') => `assets/ilustraciones-raices/aventura-${topic}-${String(number).padStart(2, '0')}-${version}.webp`;
  const categories = {
    naturaleza: { label:'Naturaleza', prompt:'Elige entre animales o plantas para comenzar.' },
    tecnologia: { label:'Tecnología', prompt:'Elige una creación para observar cómo funciona y cómo podría mejorar.' },
    ciencia: { label:'Ciencia', prompt:'Elige un fenómeno para observar, comparar y hacer preguntas.' },
    espacio: { label:'Espacio', prompt:'Elige entre una misión o los patrones del cielo.' },
    historias: { label:'Historias y palabras', prompt:'Elige entre lectura, humor, cartas, biografías o mundos imaginados.' },
    numeros: { label:'Números y patrones', prompt:'Elige una ruta para representar, comparar y explicar relaciones matemáticas.' },
    cuerpo: { label:'Cuerpo y emociones', prompt:'Elige una ruta para comprender sistemas, señales y recursos de cuidado.' },
    propio: { label:'Mi propio tema', prompt:'Cuéntale a Queñal qué te causa curiosidad.' }
  };

  const packs = {
    caballos: {
      title: 'El lenguaje tranquilo de los caballos', label: 'Caballos', maxSteps: 7,
      intro: 'Observa señales, compara posibilidades y construye una forma respetuosa de cuidar y planear.',
      scenes: [
        { id:'caballo-observar', phase:'Observar', method:'exploración inicial', title:'Primero, mirar con calma', image:image('caballos',1), alt:'Queñal observa a distancia cómo camina un caballo', caption:'La postura, las orejas y el movimiento ofrecen información antes de acercarse.', narration:'Queñal quería conocer al caballo, pero no corrió hacia él. Se quedó a una distancia tranquila y observó sus orejas, su postura y la forma en que caminaba. Antes de actuar, reunió señales.', question:'¿Qué hizo Queñal antes de acercarse?', answers:['Observó sus señales con calma','Corrió sin mirar','Decidió solo por el color'], answer:0, hint:'Busca la acción que permite reunir información antes de actuar.' },
        { id:'caballo-comparar', phase:'Comparar', method:'relaciones y diferencias', title:'Dos caballos, nuevas preguntas', image:image('caballos',2), alt:'Queñal compara un caballo grande y un poni', caption:'Comparar no es decidir cuál es mejor; es reconocer semejanzas y diferencias útiles.', narration:'Queñal vio un caballo alto y un poni más pequeño. Los dos necesitaban agua, alimento y espacio, aunque su tamaño y su manera de moverse eran distintos. Comparó sin convertir la diferencia en una competencia.', question:'¿Qué comparación ayuda a comprenderlos mejor?', answers:['Sus necesidades y formas de moverse','Cuál merece ganar','Cuál tiene el color más bonito'], answer:0, hint:'Una comparación útil ayuda a cuidar o comprender, no a elegir un ganador.' },
        { id:'caballo-secuencia', phase:'Organizar', method:'secuencia con apoyo visual', title:'Cuidar también tiene un orden', image:image('caballos',3), alt:'Queñal organiza imágenes de agua, alimento y cepillado', caption:'Ordenar acciones ayuda a anticipar lo que viene y revisar si falta algo.', narration:'Queñal preparó una rutina sencilla. Primero revisaría que hubiera agua limpia y alimento apropiado. Después, con un adulto que conoce al caballo, podría cepillarlo con calma.', question:'¿Cuál es el plan más cuidadoso?', answers:['Revisar necesidades y actuar acompañado','Hacer todo rápido y solo','Cambiar el orden sin observar'], answer:0, hint:'Piensa en seguridad, necesidades básicas y acompañamiento.' },
        { id:'caballo-ruta', phase:'Representar', method:'concreto y pictórico', title:'Un camino que se puede ver', image:image('caballos',4), alt:'Queñal observa con un caballo un mapa ilustrado de senderos', caption:'El mapa vuelve visible una ruta para comparar distancia, sombra, agua y obstáculos.', narration:'Para planear un paseo, Queñal usó un mapa con senderos, árboles, agua y piedras. La representación le permitió pensar en el recorrido antes de hacerlo en el mundo real.', question:'¿Para qué sirve el mapa en esta situación?', answers:['Para anticipar y comparar rutas','Para decorar la mochila','Para adivinar sin observar'], answer:0, hint:'La representación permite pensar antes de actuar.' },
        { id:'caballo-estrategias', phase:'Explicar', method:'comparación de estrategias', title:'Más de una ruta posible', image:image('caballos',5), alt:'Queñal compara dos maneras de cruzar un arroyo con un caballo', caption:'Comparar estrategias permite explicar qué condiciones cambian una decisión.', narration:'Al llegar a un arroyo, Queñal imaginó dos posibilidades. Antes de escoger, pensó en la profundidad, las piedras, la experiencia del caballo y la presencia de una persona adulta preparada.', question:'¿Qué conviene hacer antes de elegir una estrategia?', answers:['Revisar las condiciones y explicar la elección','Escoger siempre la ruta más corta','Copiar una ruta sin preguntar'], answer:0, hint:'La misma estrategia no sirve igual en todas las condiciones.' },
        { id:'caballo-crear', phase:'Crear', method:'diseño con propósito', title:'Diseñar un lugar amable', image:image('caballos',6), alt:'Queñal dibuja un espacio para caballos con sombra, agua y terreno abierto', caption:'Crear transforma lo comprendido en una propuesta propia.', narration:'Queñal dibujó un espacio con sombra, agua, ventilación y lugar para moverse. Su diseño no tenía una única respuesta correcta: debía poder explicar cómo cada parte ayudaba al bienestar del caballo.', question:'¿Qué te gustaría agregar a tu propio diseño?', answers:['Una zona de sombra y descanso','Un recorrido para moverse','Una forma sencilla de revisar el agua'], mode:'choice', hint:'Puedes elegir una idea o imaginar otra; lo importante es explicar para qué sirve.' },
        { id:'caballo-transferir', phase:'Transferir', method:'nuevo contexto', title:'Un nuevo lugar, la misma pregunta', image:image('caballos',7), alt:'Queñal explica un plan para caballos en un nuevo pastizal', caption:'Transferir es revisar qué idea sigue siendo útil cuando cambia el lugar.', narration:'En otro pastizal, el terreno y el clima eran diferentes. Queñal no copió su plan exactamente: conservó las preguntas sobre agua, sombra, espacio y seguridad, y adaptó la propuesta al nuevo lugar.', question:'¿Qué muestra mejor una transferencia?', answers:['Usar la idea y ajustarla al nuevo contexto','Repetir todo sin mirar el lugar','Abandonar lo aprendido'], answer:0, hint:'Transferir no es copiar; es reconocer qué se mantiene y qué debe cambiar.' }
      ]
    },
    cohetes: {
      title: 'La misión de los cohetes curiosos', label: 'Cohetes', maxSteps: 7,
      intro: 'Investiga partes, secuencias y rutas mientras conviertes una idea en una misión segura.',
      scenes: [
        { id:'cohete-observar', phase:'Observar', method:'exploración inicial', title:'Un cohete tiene partes', image:image('cohetes',1), alt:'Queñal observa la punta, el cuerpo y las aletas de un cohete de juguete', caption:'Observar partes visibles ayuda a formular preguntas sobre su función.', narration:'Queñal examinó un cohete de juguete. Miró la punta, el cuerpo y las aletas. En vez de memorizar sus nombres solamente, se preguntó qué función podía cumplir cada parte.', question:'¿Qué pregunta ayuda a comprender el modelo?', answers:['¿Para qué sirve cada parte?','¿Cuál parte es la más bonita?','¿Cómo termino sin observar?'], answer:0, hint:'Busca una pregunta que conecte una parte con su función.' },
        { id:'cohete-comparar', phase:'Comparar', method:'variación y contraste', title:'Dos diseños para comparar', image:image('cohetes',2), alt:'Queñal compara dos cohetes de juguete con aletas diferentes', caption:'Cambiar una característica permite pensar qué efecto podría producir.', narration:'Los dos modelos tenían cuerpos parecidos, pero sus aletas eran diferentes. Queñal decidió comparar una característica a la vez para no confundir las posibles causas.', question:'¿Qué comparación es más clara?', answers:['Cambiar una característica y observar','Cambiar todo al mismo tiempo','Elegir sin comparar'], answer:0, hint:'Si cambias muchas cosas juntas, es difícil saber qué produjo la diferencia.' },
        { id:'cohete-secuencia', phase:'Organizar', method:'secuencia japonesa', title:'Preparar antes de iniciar', image:image('cohetes',3), alt:'Queñal ordena tarjetas para revisar un cohete, despejar el área e iniciar una cuenta regresiva', caption:'Una secuencia visible permite revisar seguridad y anticipar el siguiente paso.', narration:'En su misión imaginaria, Queñal ordenó tres acciones: revisar el modelo, confirmar que el área estuviera libre y recién entonces iniciar la cuenta regresiva. El orden evitaba saltarse una comprobación importante.', question:'¿Por qué importa el orden?', answers:['Porque permite revisar antes de avanzar','Porque hace ganar puntos','Porque evita pensar'], answer:0, hint:'Busca la opción que conecta secuencia y seguridad.' },
        { id:'cohete-representar', phase:'Representar', method:'Singapur concreto pictórico', title:'De bloques a una ruta', image:image('cohetes',4), alt:'Queñal usa bloques y dibujos para representar etapas de un cohete', caption:'Pasar de objetos a dibujos ayuda a representar una relación antes de volverla abstracta.', narration:'Queñal construyó etapas con bloques y luego dibujó la misma secuencia como una ruta. Usar algo concreto y después una imagen le ayudó a explicar qué cambiaba en cada momento.', question:'¿Qué relación construyó Queñal?', answers:['Bloques, dibujo y explicación de una secuencia','Un adorno sin relación','Una respuesta copiada'], answer:0, hint:'Observa cómo la misma idea aparece de dos maneras.' },
        { id:'cohete-estrategias', phase:'Razonar', method:'comparación de soluciones', title:'Dos caminos alrededor de una nube', image:image('cohetes',5), alt:'Queñal compara dos rutas dibujadas alrededor de una nube', caption:'Comparar soluciones exige explicar qué información sostiene la elección.', narration:'En el mapa de la misión aparecieron dos rutas alrededor de una nube. Queñal comparó distancia, dirección y seguridad. No buscó la respuesta más rápida: buscó una razón que pudiera explicar.', question:'¿Qué vuelve sólida una elección?', answers:['Comparar condiciones y justificar','Elegir por impulso','Seguir una línea sin mirar'], answer:0, hint:'La estrategia debe poder explicarse con información del problema.' },
        { id:'cohete-crear', phase:'Crear', method:'diseño y variación', title:'Un cohete con una idea propia', image:image('cohetes',6), alt:'Queñal dibuja un cohete con piezas que se pueden combinar', caption:'Crear permite transformar relaciones comprendidas en un diseño propio.', narration:'Queñal diseñó un nuevo cohete de juguete con piezas que podía cambiar. Pensó en su forma, sus etapas y la misión que quería representar. Podía probar más de una versión.', question:'¿Por dónde comenzarías tu diseño?', answers:['Por la misión que quiero cumplir','Por dos versiones para comparar','Por una pieza que quiero investigar'], mode:'choice', hint:'Las tres entradas son posibles si después explicas tu decisión.' },
        { id:'cohete-transferir', phase:'Transferir', method:'nuevo destino', title:'La estrategia viaja a otro planeta', image:image('cohetes',7), alt:'Queñal explica una nueva misión con un planeta y un mapa de estrellas', caption:'La transferencia aparece cuando una estrategia se adapta a un destino diferente.', narration:'La siguiente misión tenía otro destino. Queñal conservó la idea de observar, representar, comparar y revisar, pero cambió la ruta y el diseño según las nuevas condiciones.', question:'¿Qué hizo Queñal con lo aprendido?', answers:['Lo adaptó a una misión nueva','Lo repitió sin cambios','Lo olvidó al cambiar el planeta'], answer:0, hint:'Busca una idea que combine continuidad y adaptación.' }
      ]
    },
    estrellas: {
      title: 'Las formas escondidas en las estrellas', label: 'Estrellas', maxSteps: 7,
      intro: 'Descubre patrones, compara interpretaciones y crea una constelación con una historia propia.',
      scenes: [
        { id:'estrella-observar', phase:'Observar', method:'curiosidad y patrón', title:'Grupos de luz en el cielo', image:image('estrellas',1), alt:'Queñal observa varios grupos de estrellas en el cielo nocturno', caption:'Antes de nombrar una forma, Queñal observa posición, brillo y distancia aparente.', narration:'Queñal miró el cielo y notó que algunas estrellas parecían formar grupos. No decidió de inmediato qué dibujo eran. Primero observó cuáles estaban cerca, cuáles brillaban más y cómo cambiaba el patrón.', question:'¿Qué hizo antes de imaginar una figura?', answers:['Observó las relaciones del patrón','Copió un nombre sin mirar','Eligió la estrella más grande'], answer:0, hint:'La imaginación también puede comenzar con una observación precisa.' },
        { id:'estrella-comparar', phase:'Comparar', method:'relaciones espaciales', title:'Dos patrones, varias diferencias', image:image('estrellas',2), alt:'Queñal sostiene dos tarjetas con patrones de estrellas diferentes', caption:'Comparar posición, cantidad y separación ayuda a describir un patrón.', narration:'En dos tarjetas, las luces formaban figuras distintas. Queñal comparó la separación y la posición de cada punto. Describir la diferencia le permitió mirar con más precisión.', question:'¿Qué característica ayuda a comparar patrones?', answers:['La posición y separación de los puntos','El nombre de quien dibujó','El orden en que tomó las tarjetas'], answer:0, hint:'Busca una característica que pertenezca al patrón.' },
        { id:'estrella-clasificar', phase:'Clasificar', method:'criterios explícitos', title:'Agrupar con una razón', image:image('estrellas',3), alt:'Queñal clasifica tarjetas de estrellas en tres grupos', caption:'Clasificar exige elegir un criterio y poder explicarlo.', narration:'Queñal agrupó tarjetas por brillo y separación. Después probó otro criterio y descubrió que una misma tarjeta podía cambiar de grupo. La clasificación dependía de la pregunta elegida.', question:'¿Qué necesita una clasificación útil?', answers:['Un criterio que pueda explicarse','Un grupo ganador','Una respuesta secreta'], answer:0, hint:'El criterio indica por qué algo pertenece a un grupo.' },
        { id:'estrella-representar', phase:'Representar', method:'Singapur concreto pictórico', title:'De cuentas doradas a un dibujo', image:image('estrellas',4), alt:'Queñal construye un patrón con cuentas y luego lo dibuja', caption:'Una representación concreta puede convertirse en un dibujo de la misma relación.', narration:'Queñal formó un patrón con cuentas doradas y palitos. Luego dibujó los mismos puntos y conexiones. Cambió el material, pero conservó las relaciones importantes.', question:'¿Qué se mantuvo al cambiar la representación?', answers:['La relación entre los puntos','El material exacto','El tamaño de la mesa'], answer:0, hint:'La idea puede mantenerse aunque cambie el material.' },
        { id:'estrella-interpretar', phase:'Explicar', method:'múltiples estrategias', title:'La misma estrella, dos caminos', image:image('estrellas',5), alt:'Queñal explica dos maneras de conectar el mismo grupo de estrellas', caption:'Comparar interpretaciones permite justificar sin imponer una única imaginación.', narration:'Con los mismos puntos, Queñal encontró dos formas de conectarlos. Las dos podían ser válidas si respetaban el patrón y él explicaba su decisión.', question:'¿Qué hace válida una interpretación aquí?', answers:['Respeta el patrón y puede explicarse','Es la única que alguien permite','Se elige sin mirar los puntos'], answer:0, hint:'No toda pregunta creativa tiene una sola respuesta.' },
        { id:'estrella-crear', phase:'Crear', method:'transformación creativa', title:'Una constelación inventada', image:image('estrellas',6), alt:'Queñal crea una constelación con forma de conejo', caption:'Crear combina observación, relaciones e imaginación en una producción propia.', narration:'Queñal unió los puntos y creó una constelación con forma de animal. Después inventó una historia breve para explicar por qué esa figura viajaba por el cielo.', question:'¿Qué crearías a partir de tu patrón?', answers:['Una figura con una historia','Dos interpretaciones distintas','Una nueva pregunta para investigar'], mode:'choice', hint:'Puedes transformar el patrón de varias maneras.' },
        { id:'estrella-transferir', phase:'Transferir', method:'explicación en contexto nuevo', title:'Otro cielo para volver a pensar', image:image('estrellas',7), alt:'Queñal reconoce un patrón en otro cielo y lo explica a una persona adulta', caption:'Reconocer relaciones en una situación nueva ofrece evidencia de transferencia.', narration:'En otro lugar, el cielo se veía diferente. Queñal buscó relaciones conocidas, explicó lo que sí podía comparar y también dijo qué información todavía le faltaba.', question:'¿Qué muestra una transferencia cuidadosa?', answers:['Usar relaciones conocidas y reconocer lo que falta','Afirmar que todo cielo es igual','Evitar explicar la comparación'], answer:0, hint:'Transferir también incluye reconocer los límites de la información.' }
      ]
    },
    semilla: {
      title: 'La semilla que esperaba', label: 'Plantas y semillas', maxSteps: 3,
      intro: 'La aventura original de tres escenas que probó la lectura, las pistas y el registro de evidencias.',
      scenes: [
        { id:'semilla', phase:'Observar', method:'exploración inicial', title:'Una semilla en silencio', image:image('semilla',1,'v2'), alt:'Queñal observa una semilla en su mano junto a un árbol de queñual', caption:'La imagen acompaña la acción: mirar la semilla antes de decidir.', narration:'Queñal encontró una semilla cerca del queñual. No sabía si estaba dormida o esperando. La puso sobre su mano y miró su forma, su color y la tierra que llevaba pegada.', question:'¿Qué hizo Queñal antes de decidir?', answers:['La observó con calma','La escondió sin mirar','La lanzó muy lejos'], answer:0, hint:'Busca la acción que le permitió conocer mejor la semilla.' },
        { id:'suelo', phase:'Comparar', method:'condiciones', title:'¿Qué necesita para crecer?', image:image('semilla',2,'v2'), alt:'Queñal compara suelo húmedo, sombra y un lugar con luz suave', caption:'La imagen muestra tres condiciones diferentes para poder compararlas.', narration:'Sus amigos propusieron agua, luz y un lugar con tierra. Queñal no eligió la respuesta más rápida. Comparó los lugares y notó que uno estaba húmedo, otro muy oscuro y otro recibía luz suave.', question:'¿Qué información le ayuda a elegir un lugar?', answers:['Las condiciones de cada lugar','El lugar más lejano','El color de su mochila'], answer:0, hint:'Piensa en agua, luz y tierra.' },
        { id:'transferencia', phase:'Probar', method:'observación en el tiempo', title:'Una maceta para investigar', image:image('semilla',3,'v2'), alt:'Queñal planta la semilla en una maceta y observa un cuaderno con dibujos', caption:'La imagen acompaña el plan: plantar, observar y registrar cambios.', narration:'Queñal colocó la semilla en una maceta y acordó observarla varios días. Si algo cambiaba, lo anotaría. Si no cambiaba, revisaría las condiciones sin culpar a la semilla ni a quien la cuidó.', question:'¿Qué puede hacer si la semilla todavía no cambia?', answers:['Revisar las condiciones y seguir observando','Decir que nunca crecerá','Culpar a quien la cuidó'], answer:0, hint:'La evidencia puede necesitar más tiempo.' }
      ]
    }
  };

  if (window.RaicesTopicLibrary) {
    Object.assign(packs, window.RaicesTopicLibrary.packs);
    window.RaicesTopicLibrary.mount($('#topic-grid'));
  }

  const customPack = (interest) => ({
    title: `Una expedición sobre ${interest}`, label:interest, maxSteps:3,
    intro:'Queñal empezará por tus preguntas. Esta ruta breve ayuda a elegir cómo desarrollar un nuevo tema en la biblioteca.',
    scenes:[
      { id:'otro-observar', phase:'Elegir', method:'interés expresado', title:`¿Qué te llama la atención de ${interest}?`, image:'assets/personaje-quenal-v2.webp', alt:'Queñal escucha y piensa en una nueva pregunta', caption:'Tu elección ayuda a decidir por dónde comenzar; no determina todo lo que aprenderás.', narration:`Queñal escuchó que hoy te interesa ${interest}. Antes de preparar una aventura completa, quiere saber qué puerta te causa más curiosidad.`, question:'¿Por dónde te gustaría empezar?', answers:['Cómo funciona','Qué historias tiene','Qué formas o partes puedo observar'], mode:'choice', hint:'No hay una respuesta correcta: elige la puerta que te dé más curiosidad.' },
      { id:'otro-estrategia', phase:'Planear', method:'elección de canal', title:'Elegir una forma de investigar', image:'assets/quenual-ilustrado-v2.webp', alt:'Queñal explora un entorno con su cuaderno', caption:'Una misma curiosidad puede investigarse observando, comparando, preguntando o creando.', narration:`Para explorar ${interest}, Queñal propone elegir una primera estrategia. Después podremos comparar si esa estrategia ayudó o si conviene cambiarla.`, question:'¿Qué estrategia quieres probar primero?', answers:['Observar y dibujar detalles','Comparar dos ejemplos','Hacer una pregunta a una persona que sepa'], mode:'choice', hint:'Puedes elegir una y cambiar después; una estrategia no es una etiqueta.' },
      { id:'otro-crear', phase:'Crear', method:'continuidad fuera de pantalla', title:'Tu primera misión', image:'assets/ilustraciones-raices/aventura-semilla-03-v2.webp', alt:'Queñal registra una observación y prepara una misión', caption:'El aprendizaje puede continuar fuera de la pantalla con una acción pequeña y segura.', narration:`Ya tenemos una puerta y una estrategia para ${interest}. Ahora elige una misión breve que puedas hacer con seguridad y, si hace falta, acompañado por una persona adulta.`, question:'¿Cuál misión quieres llevarte?', answers:['Encontrar tres detalles y representarlos','Crear una pregunta nueva','Explicar a alguien lo que quiero descubrir'], mode:'choice', hint:'Elige una misión posible para hoy; no tiene que quedar perfecta.' }
    ]
  });

  let pack = null;
  let topicId = null;
  let selectedCategory = null;
  let index = 0;
  let routeLimit = 3;
  let utterance = null;
  let paused = false;
  let solved = false;
  let sceneHintUsed = false;
  let completed = false;
  let stats = { attempts:0, wrong:0, hints:0, pauses:0, independent:0 };

  const pedagogy = () => window.RaicesPedagogy;
  const readProfile = () => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); } catch (_) { return {}; } };
  const writeProfile = (profile) => { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (_) {} };
  const profileLabel = (id) => packs[id]?.label || 'otros temas';
  const updateInterestMemory = () => {
    const profile = readProfile();
    const choices = profile.choices || {};
    const returns = profile.returnInterest || {};
    const top = Object.keys(packs).map((id) => [id, (choices[id] || 0) + (returns[id] || 0) * 2]).sort((a,b) => b[1] - a[1])[0];
    $('#interest-memory').textContent = top?.[1] ? `${top[1] >= 3 ? 'Se viene repitiendo el interés por' : 'El tema más elegido hasta ahora es'}: ${profileLabel(top[0])}. Es una preferencia observada, no una etiqueta.` : 'Todavía no hay preferencias observadas en este dispositivo.';
    document.querySelectorAll('[data-topic]').forEach((button) => button.classList.toggle('is-familiar', top?.[0] === button.dataset.topic));
  };
  const rememberChoice = (id) => {
    const profile = readProfile(); profile.choices ||= {}; profile.choices[id] = (profile.choices[id] || 0) + 1; profile.lastChosenAt = new Date().toISOString();
    writeProfile(profile);
  };
  const rememberUniverse = (id) => {
    if (!categories[id]) return;
    const profile = readProfile(); profile.universes ||= {}; profile.universes[id] = (profile.universes[id] || 0) + 1;
    writeProfile(profile);
  };
  const rememberCompletion = (id, steps) => {
    const profile = readProfile(); profile.completed ||= {}; profile.completed[id] = (profile.completed[id] || 0) + 1; profile.lastRouteLength = steps; profile.lastCompletedAt = new Date().toISOString();
    writeProfile(profile);
  };
  const rememberReflection = (id, response) => {
    const profile = readProfile(); profile.interestReflections ||= {}; profile.interestReflections[response] = (profile.interestReflections[response] || 0) + 1;
    if (response === 'volver' && packs[id]) { profile.returnInterest ||= {}; profile.returnInterest[id] = (profile.returnInterest[id] || 0) + 1; }
    writeProfile(profile); updateInterestMemory();
  };
  const markProgress = (scene) => { try { const key='raices-aventuras-progreso'; const list=JSON.parse(localStorage.getItem(key)||'[]'); localStorage.setItem(key,JSON.stringify([...new Set([...list,scene])])); } catch (_) {} };
  const stopVoice = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); utterance=null; paused=false; $('#pause').disabled=true; $('#pause').textContent='Ⅱ Pausar'; };
  const words = (text) => { let offset=0; return text.split(/(\s+)/).map((part) => { if (/\s+/.test(part)) { offset += part.length; return part; } const start=offset; offset += part.length; return `<span data-start="${start}">${part}</span>`; }).join(''); };
  const calmVoice = () => { const voices=speechSynthesis.getVoices(); const spanish=voices.filter((voice)=>/^es(?:-|_)/i.test(voice.lang)); return spanish.find((voice)=>/^es-PE/i.test(voice.lang)&&/female|mujer|elvira|helena|laura|mónica|paulina|sabina|sofia/i.test(voice.name)) || spanish.find((voice)=>/female|mujer|elvira|helena|laura|mónica|paulina|sabina|sofia/i.test(voice.name)) || spanish.find((voice)=>/^es-PE/i.test(voice.lang)) || spanish[0] || null; };
  const currentScene = () => pack.scenes[index];
  const log = (type, detail, support='none') => pedagogy()?.record({ activityId:`aventura-${topicId}`, activityTitle:pack.title, sceneId:currentScene()?.id || 'general', type, detail, support, context:`universo:${selectedCategory || 'propio'};interes:${topicId};pasos:${routeLimit}` });

  function showCategory(id) {
    const category = categories[id];
    if (!category) return;
    selectedCategory = id;
    document.querySelectorAll('[data-category]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.category === id)));
    $('#topic-step').hidden = false;
    $('#topic-universe').textContent = category.label;
    $('#topic-title').textContent = category.prompt;
    const custom = id === 'propio';
    $('#topic-grid').hidden = custom;
    $('#other-interest').hidden = !custom;
    document.querySelectorAll('[data-topic]').forEach((button) => {
      button.hidden = custom || !String(button.dataset.categories || '').split(/\s+/).includes(id);
    });
    $('#topic-step').scrollIntoView({ behavior:'smooth', block:'nearest' });
    if (custom) setTimeout(() => $('#custom-interest').focus(), 250);
  }

  function changeUniverse() {
    selectedCategory = null;
    $('#topic-step').hidden = true;
    document.querySelectorAll('[data-category]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
    $('#universe-grid').scrollIntoView({ behavior:'smooth', block:'center' });
  }

  function speak(text, illuminate=false) {
    stopVoice();
    if (!('speechSynthesis' in window)) { $('#reader-status').textContent='La voz no está disponible en este navegador'; return; }
    utterance = new SpeechSynthesisUtterance(text); utterance.lang='es-PE'; utterance.rate=Number($('#voice-rate').value); utterance.pitch=.98; utterance.volume=.88; utterance.voice=calmVoice();
    if (illuminate) {
      const spans=[...$('#scene-narration').querySelectorAll('[data-start]')];
      utterance.onboundary=(event)=>{ if(event.name&&event.name!=='word')return; let current=spans[0]; for(const span of spans){if(Number(span.dataset.start)<=event.charIndex)current=span;else break;} spans.forEach((span)=>span.classList.toggle('lit',span===current)); };
    }
    utterance.onstart=()=>{$('#reader-status').textContent='Queñal está leyendo';$('#pause').disabled=false;};
    utterance.onend=()=>{$('#scene-narration').querySelectorAll('.lit').forEach((span)=>span.classList.remove('lit'));$('#reader-status').textContent='Lectura terminada';$('#pause').disabled=true;log('lectura','Narración escuchada hasta el final.');};
    speechSynthesis.speak(utterance);
  }

  function startAdventure(nextPack, id, categoryId = selectedCategory) {
    const tier = id === 'semilla' ? 'libre' : 'plus';
    const feature = packs[id]?.title || 'La ruta personalizada de Aprendiendo con Queñal';
    if (!(window.RaicesAccess?.require(tier, feature) ?? tier === 'libre')) return;
    selectedCategory = categories[categoryId] ? categoryId : 'propio';
    pack=nextPack; topicId=id; index=0; routeLimit=Math.min(3,pack.scenes.length); stats={attempts:0,wrong:0,hints:0,pauses:0,independent:0}; completed=false;
    rememberChoice(packs[id] ? id : 'otro');
    rememberUniverse(selectedCategory);
    $('#adventure-eyebrow').textContent='Aprendiendo con Queñal · ruta adaptativa'; $('#adventure-title').textContent=pack.title; $('#adventure-intro').textContent=pack.intro;
    $('#interest-picker').hidden=true; $('#reader').hidden=false;
    pedagogy()?.start({id:`aventura-${id}`,title:pack.title});
    log('interes',`Universo ${categories[selectedCategory].label}; tema elegido voluntariamente: ${packs[id]?.label || 'otro tema propuesto'}.`);
    render(); $('#reader').scrollIntoView({behavior:'smooth',block:'start'});
  }

  function render() {
    stopVoice(); solved=false; sceneHintUsed=false; completed=false; const scene=currentScene();
    $('#scene-label').textContent=`Momento ${index+1} de ${routeLimit}`; $('#scene-progress').style.width=`${(index+1)/routeLimit*100}%`; $('#reader-status').textContent='Lista para comenzar';
    $('#scene-image').src=scene.image; $('#scene-image').alt=scene.alt; $('#scene-caption').textContent=scene.caption; $('#scene-kicker').textContent=`Momento ${index+1} · ${scene.phase}`; $('#scene-title').textContent=scene.title; $('#scene-narration').innerHTML=words(scene.narration);
    $('#question').textContent=scene.question; $('#answers').innerHTML=scene.answers.map((answer,i)=>`<button type="button" data-answer="${i}">${answer}</button>`).join('');
    $('#challenge').hidden=true; $('#feedback').textContent=''; $('#next-scene').hidden=true; $('#finish-route').hidden=true; $('#hint').hidden=false; $('#think').hidden=false; $('#listen-question').hidden=false;
    document.querySelectorAll('[data-answer]').forEach((button)=>button.addEventListener('click',()=>answer(Number(button.dataset.answer))));
    log('inicio',`Se presentó el momento ${index+1}: ${scene.phase}.`);
  }

  function extensionRecommended() {
    if (routeLimit === 3) return stats.hints === 0 && stats.wrong <= 1;
    return stats.hints <= 1 && stats.wrong <= 2 && stats.independent >= 3;
  }

  function configureNext() {
    const next=$('#next-scene'); const canExtend=routeLimit<pack.scenes.length && index+1===routeLimit;
    next.hidden=false;
    if (canExtend) {
      $('#finish-route').hidden=false;
      next.textContent=extensionRecommended() ? 'Queñal propone 2 momentos más →' : 'Quiero seguir con apoyo →';
      $('#feedback').textContent += extensionRecommended() ? ' Hay evidencia para profundizar sin aumentar la ayuda.' : ' Puedes cerrar por hoy o continuar con apoyo; ninguna opción es una calificación.';
    } else next.textContent=index+1>=pack.scenes.length?'Terminar exploración ✓':'Siguiente momento →';
  }

  function answer(choice) {
    if (solved || completed) return; const scene=currentScene(); const button=$(`[data-answer="${choice}"]`); stats.attempts+=1; log('intento',`Se eligió la alternativa ${choice+1}.`);
    const accepted=scene.mode==='choice' || choice===scene.answer;
    if (accepted) {
      solved=true; button.classList.add('correct'); if(!sceneHintUsed)stats.independent+=1;
      const type=scene.phase==='Crear'?'creacion':scene.phase==='Transferir'?'transferencia':scene.mode==='choice'?'estrategia':'respuesta';
      $('#feedback').textContent=scene.mode==='choice'?'Elección registrada. Lo importante será probarla y poder explicar qué descubriste.':'La respuesta coincide con la información de este momento. Es evidencia de esta actividad, no una calificación.';
      log(type,scene.mode==='choice'?'Estrategia elegida por la persona.':'Respuesta pertinente registrada.',sceneHintUsed?'requested':'none'); configureNext();
    } else {
      stats.wrong+=1; button.classList.add('try'); $('#feedback').textContent='Esa opción todavía no coincide con la información disponible. Puedes escuchar otra vez, pedir una pista o probar otra idea.'; setTimeout(()=>button.classList.remove('try'),650);
    }
  }

  function advance() {
    if (completed) { resetToInterests(); return; }
    log('cierre',`Momento ${index+1} finalizado.`); markProgress(currentScene().id);
    if (index+1===routeLimit && routeLimit<pack.scenes.length) { routeLimit=Math.min(routeLimit+2,pack.scenes.length); log('decision',`La ruta se amplió a ${routeLimit} momentos con control de la persona.`); }
    if (index+1<routeLimit) { index+=1; render(); $('#reader').scrollIntoView({behavior:'smooth',block:'start'}); }
    else finishAdventure();
  }

  function finishAdventure() {
    stopVoice(); completed=true; const status=routeLimit>=7?'TRANSFER':routeLimit>=5?'CONSOLIDATING':'EXPLORING'; pedagogy()?.finish(status); rememberCompletion(packs[topicId]?topicId:'otro',routeLimit); updateInterestMemory();
    $('#challenge').hidden=false; $('#question').textContent=`¿Te gustaría volver a explorar ${pack.label} otro día?`; $('#answers').innerHTML='<button type="button" data-reflection="volver">Sí, quiero volver</button><button type="button" data-reflection="cambiar">Prefiero otro tema</button><button type="button" data-reflection="todavia-no">Todavía no sé</button>'; $('#hint').hidden=true; $('#think').hidden=true; $('#listen-question').hidden=true; $('#finish-route').hidden=true;
    $('#feedback').textContent=`Hoy completaste ${routeLimit} momentos con el apoyo que necesitabas. Esta pregunta ayuda a observar intereses a lo largo del tiempo; una sola elección no define una capacidad ni un talento.`;
    const mappedTopics=new Set(['caballos','cohetes','estrellas','semilla',...(window.RaicesTopicLibrary?.topics||[]).map(topic=>topic.id)]);
    if (mappedTopics.has(topicId)) $('#feedback').insertAdjacentHTML('beforeend',`<br><a class="map-link" href="mapas-quenal.html#${topicId}">Abrir mapa visual de este tema</a>`);
    const prototypeTopics=new Set(['inventos-prototipos','ingenieria-pequena','experimentos-casa','robots-movimiento','luz-sonido','ajustes-pruebas','materiales-reciclados','reto-inventor']);
    if (prototypeTopics.has(topicId)) $('#feedback').insertAdjacentHTML('beforeend',`<br><a class="map-link" href="taller-prototipo.html#${topicId}">Armar mi propuesta de prototipo</a>`);
    document.querySelectorAll('[data-reflection]').forEach((button)=>button.addEventListener('click',()=>{ document.querySelectorAll('[data-reflection]').forEach((item)=>item.classList.remove('correct')); button.classList.add('correct'); rememberReflection(topicId,button.dataset.reflection); log('interes',`Reflexión voluntaria al cierre: ${button.dataset.reflection}.`); }));
    $('#next-scene').hidden=false; $('#next-scene').textContent='Elegir otro tema'; log('cierre',`Ruta finalizada con ${routeLimit} momentos.`);
    $('#challenge').scrollIntoView({behavior:'smooth',block:'center'});
  }

  function resetToInterests() {
    stopVoice(); pack=null; topicId=null; completed=false; $('#reader').hidden=true; $('#interest-picker').hidden=false; $('#adventure-eyebrow').textContent='Intereses que abren caminos'; $('#adventure-title').textContent='¿Qué te gustaría explorar hoy?'; $('#adventure-intro').textContent='Elige algo que te cause curiosidad. Queñal empezará con tres momentos y podrá proponer más cuando la experiencia lo justifique.'; changeUniverse(); updateInterestMemory(); $('#interest-picker').scrollIntoView({behavior:'smooth',block:'start'});
  }

  document.querySelectorAll('[data-category]').forEach((button)=>{button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>showCategory(button.dataset.category));});
  $('#change-universe').addEventListener('click',changeUniverse);
  document.querySelectorAll('[data-topic]').forEach((button)=>button.addEventListener('click',()=>startAdventure(packs[button.dataset.topic],button.dataset.topic,selectedCategory)));
  $('#other-interest').addEventListener('submit',(event)=>{event.preventDefault();const interest=safeText($('#custom-interest').value);if(interest.length<2){$('#custom-interest').focus();return;}startAdventure(customPack(interest),'otro','propio');});
  $('#listen').addEventListener('click',()=>{log('lectura','Se inició la narración.');speak(currentScene().narration,true);});
  $('#repeat').addEventListener('click',()=>{log('lectura','Se solicitó volver a escuchar.');speak(currentScene().narration,true);});
  $('#pause').addEventListener('click',()=>{if(!utterance)return;if(paused){speechSynthesis.resume();paused=false;$('#pause').textContent='Ⅱ Pausar';log('reanudacion','Narración reanudada.');}else{speechSynthesis.pause();paused=true;stats.pauses+=1;$('#pause').textContent='▶ Continuar';log('pausa','Narración pausada.');}});
  $('#show-challenge').addEventListener('click',()=>{stopVoice();$('#challenge').hidden=false;$('#challenge').scrollIntoView({behavior:'smooth',block:'center'});log('decision','La persona decidió abrir el desafío.');});
  $('#listen-question').addEventListener('click',()=>speak(`${currentScene().question}. ${currentScene().answers.join('. ')}`));
  $('#hint').addEventListener('click',()=>{if(!sceneHintUsed){sceneHintUsed=true;stats.hints+=1;}$('#challenge').classList.add('hinted');$('#feedback').textContent=currentScene().hint;log('pista','Pista solicitada por la persona.','requested');});
  $('#think').addEventListener('click',()=>{$('#feedback').textContent='Tómate el tiempo que necesites. Puedes continuar, cerrar o cambiar de tema cuando quieras.';stats.pauses+=1;log('pausa','Se solicitó tiempo para pensar.');});
  $('#next-scene').addEventListener('click',advance);
  $('#finish-route').addEventListener('click',()=>{log('cierre',`Momento ${index+1} finalizado por decisión de la persona.`);markProgress(currentScene().id);finishAdventure();});
  window.addEventListener('pagehide',stopVoice);
  updateInterestMemory();
})();

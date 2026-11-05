'use strict';
const assert = require('node:assert/strict');
require('./assets/motor-pedagogico.js');

const results = globalThis.RaicesPedagogicalEngine.runAcceptance();
assert.equal(results.length, 20, 'Deben existir los 20 casos oficiales');
assert.deepEqual(results.filter((item) => !item.passed), [], 'Todos los contratos de reglas deben pasar');
const diagnosis = globalThis.RaicesPedagogicalEngine.evaluate({ context:'prueba', evidence:[{source:'sistema'}], outputIncludesDiagnosis:true });
assert.equal(diagnosis.decision, 'REJECT_OUTPUT');
assert.equal(diagnosis.diagnosis, null);
const insufficient = globalThis.RaicesPedagogicalEngine.evaluate({ context:'prueba', evidence:[] });
assert.equal(insufficient.decision, 'WAIT_OBSERVE');
console.log(`Motor pedagógico: ${results.filter((item) => item.passed).length}/${results.length} contratos aprobados`);

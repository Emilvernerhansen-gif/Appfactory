// Test double for the artifact runtime (window.claude): an in-memory db with live
// snapshots, a user and an optional sample stub. Example data only, never real records.
(() => {
  const iso = d => d.toISOString().slice(0, 10);
  const ago = n => iso(new Date(Date.now() - n * 864e5));
  const seed = window.__SEED__ ?? {
    faults: [
      { id: 'x1', sted: '#112', fejl: 'Loftslampe blinker', kat: 'Lys', bem: '', status: 'Åben', dato: ago(21) },
      { id: 'x2', sted: '#114', fejl: 'Bruseslange utæt', kat: 'VVS', bem: 'Ny slange bestilt', status: 'Mangler del', dato: ago(6) },
      { id: 'x3', sted: 'Pool', fejl: 'Fliser løse ved trappen', kat: 'Bygning', bem: '', status: 'I gang', dato: ago(3) },
      { id: 'x4', sted: 'Restaurant', fejl: 'Radiator kold', kat: 'Varme', bem: '', status: 'Åben', dato: ago(1) },
      { id: 'x5', sted: '#120', fejl: 'Gardinstang skæv', kat: 'Inventar', bem: '', status: 'Færdig', dato: ago(12), doneAt: ago(9), init: 'AB' },
      { id: 'x6', sted: '#112', fejl: 'Stikkontakt løs', kat: 'El', bem: '', status: 'Færdig', dato: ago(30), doneAt: ago(25), doneBy: 'u_test' },
    ],
    tasks: [{ id: 'vand', navn: 'Aflæs vandmåler', interval: 'Månedlig', type: 'maaler', enhed: 'm³', sidst: null }],
    readings: [], rooms: [], manuals: [], rounds: [],
  };
  const store = {}; const subs = {}; let n = 0;
  for (const [c, rows] of Object.entries(seed)) { store[c] = new Map(rows.map(({ id, ...d }) => [id, d])); }
  const col = c => (store[c] ??= new Map());
  const emit = c => setTimeout(() => (subs[c] || []).forEach(fn => fn(snap(c))), 0);
  const snap = c => ({ metadata: { fromCache: false }, docs: [...col(c)].map(([id, d]) => ({ id, data: () => structuredClone(d) })) });
  const check = d => { if (!d || typeof d !== 'object') throw { code: 'invalid_argument' }; return structuredClone(d); };
  const db = {
    collection: c => ({
      onSnapshot(fn) { (subs[c] ??= []).push(fn); setTimeout(() => fn(snap(c)), 30); return () => {}; },
      async add(d) { const id = 'n' + (++n); col(c).set(id, check(d)); emit(c); return { id }; },
    }),
    doc: p => { const [c, id] = p.split('/'); return {
      async set(d) { col(c).set(id, check(d)); emit(c); },
      async update(d) { if (!col(c).has(id)) throw { code: 'not_found' }; col(c).set(id, { ...col(c).get(id), ...check(d) }); emit(c); },
      async delete() { col(c).delete(id); emit(c); },
    }; },
  };
  const user = { id: async () => 'u_me', profiles: async ids => Object.fromEntries(ids.map(i => [i, { name: i === 'u_test' ? 'Kim' : 'Mig' }])) };
  window.__store = store; window.__emit = emit;
  window.claude = { use: async name => ({ db, user })[name] ?? null };
})();

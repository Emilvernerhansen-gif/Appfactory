import test from 'node:test';import assert from 'node:assert/strict';import {validate,upsert,filter,sortByRoom} from '../public/model.mjs';
test('create and trim',()=>assert.deepEqual(upsert([],'1','  Pumpe '),[{id:'1',title:'Pumpe',done:false}]));
test('edit retains state',()=>assert.deepEqual(upsert([{id:'1',title:'A',done:true}],'1','B'),[{id:'1',title:'B',done:true}]));
test('reject blank and long title',()=>{assert.throws(()=>upsert([],'1',' '));assert.throws(()=>upsert([],'1','a'.repeat(201)));});
test('reject duplicate IDs and malformed backup',()=>{const x={id:'1',title:'A',done:false};assert.throws(()=>validate([x,x]));assert.throws(()=>validate([{...x,done:'false'}]));assert.throws(()=>validate(null));});
test('Danish case-insensitive search',()=>assert.equal(filter([{title:'VÆRELSE'}],'værelse').length,1));
test('literal text stays literal',()=>assert.equal(upsert([],'1','<script>')[0].title,'<script>'));
test('sort by the room number itself, lowest first, unnumbered last',()=>assert.deepEqual(sortByRoom([{title:'Ingen nr'},{title:'3 pærer i værelse 12'},{title:'Lampe 1 (uden værelse)'},{title:'VÆRELSES NR. 101'},{title:'Vær. 2 dør'},{title:'5: vask'},{title:'Værelse nr 7'}]).map(x=>x.title),['Vær. 2 dør','5: vask','Værelse nr 7','3 pærer i værelse 12','VÆRELSES NR. 101','Ingen nr','Lampe 1 (uden værelse)']));

import test from 'node:test';import assert from 'node:assert/strict';import {validate,upsert,filter,sortByRoom} from '../public/model.mjs';
test('create and trim',()=>assert.deepEqual(upsert([],'1','  Pumpe '),[{id:'1',title:'Pumpe',done:false}]));
test('edit retains state',()=>assert.deepEqual(upsert([{id:'1',title:'A',done:true}],'1','B'),[{id:'1',title:'B',done:true}]));
test('reject blank and long title',()=>{assert.throws(()=>upsert([],'1',' '));assert.throws(()=>upsert([],'1','a'.repeat(201)));});
test('reject duplicate IDs and malformed backup',()=>{const x={id:'1',title:'A',done:false};assert.throws(()=>validate([x,x]));assert.throws(()=>validate([{...x,done:'false'}]));assert.throws(()=>validate(null));});
test('Danish case-insensitive search',()=>assert.equal(filter([{title:'VÆRELSE'}],'værelse').length,1));
test('literal text stays literal',()=>assert.equal(upsert([],'1','<script>')[0].title,'<script>'));
test('sort by lowest room number first, unnumbered last',()=>assert.deepEqual(sortByRoom([{title:'Ingen nr'},{title:'Værelse 12 lampe'},{title:'2: vask'},{title:'værelse 101'},{title:'Vær. 2 dør'}]).map(x=>x.title),['2: vask','Vær. 2 dør','Værelse 12 lampe','værelse 101','Ingen nr']));

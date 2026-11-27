import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createStudioServer } from './server.mjs'
test('private API rejects unauthorized requests and malformed input', async () => {
  const token = 'test-token-not-a-production-secret-1234'
  const server = createStudioServer({STUDIO_ACCESS_TOKEN:token})
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve))
  const url = 'http://127.0.0.1:' + server.address().port
  try {
    assert.equal((await fetch(url+'/health')).status,200)
    assert.equal((await fetch(url+'/v1/analyze',{method:'POST'})).status,401)
    const headers = {Authorization:'Bearer '+token,'Content-Type':'application/json'}
    assert.equal((await fetch(url+'/v1/analyze',{method:'POST',headers,body:'{}'})).status,400)
    assert.equal((await fetch(url+'/v1/analyze',{method:'POST',headers,body:JSON.stringify({kind:'meeting',text:'sample'})})).status,503)
    assert.equal((await fetch(url+'/v1/mail',{method:'POST',headers,body:JSON.stringify({title:'sample',notes:{summary:'x',decisions:[],actions:[]}})})).status,503)
  } finally { await new Promise(resolve => server.close(resolve)) }
})

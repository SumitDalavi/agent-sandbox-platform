const http = require('http');
const { spawn } = require('child_process');

async function runTests() {
  console.log("Starting API for Behavioral Tests...");
  const { exec } = require('child_process');
  const apiProcess = exec('npx tsx api/src/index.ts');
  let isReady = false;
  for (let i = 0; i < 20; i++) {
     try {
       const res = await new Promise((res, rej) => {
         const req = http.get('http://127.0.0.1:3000/api/policy', r => res(r.statusCode));
         req.on('error', rej);
       });
       if (res === 200) { isReady = true; break; }
     } catch(e) {}
     await new Promise(r => setTimeout(r, 1000));
  }
  if (!isReady) {
     console.error("❌ Sandbox API failed to start after 20s");
     apiProcess.kill();
     process.exit(1);
  }

  console.log("Running Behavioral Tests for Agent Sandbox Platform...");

  const fetchJson = (path, method = 'GET', body = null, token = 'valid-token') => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: 3000,
        path: `/api${path}`,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
             resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch(e) {
             resolve({ status: res.statusCode, data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Unauthorized approval fails
    console.log("Testing unauthorized creation...");
    const badRes = await fetchJson('/sandbox', 'POST', null, 'invalid-token');
    if (badRes.status !== 403) throw new Error(`Expected 403, got ${badRes.status}`);

    // 2. Create Sandbox
    console.log("Creating Sandbox...");
    const createRes = await fetchJson('/sandbox', 'POST');
    if (createRes.status !== 200 || !createRes.data.containerId) {
        if (createRes.status === 500 && (JSON.stringify(createRes.data).includes('docker_engine') || JSON.stringify(createRes.data).includes('connect ENOENT'))) {
            console.log("⚠️ SKIPPED: Docker is unavailable. Integration suite aborted.");
            apiProcess.kill();
            process.exit(0);
        }
        throw new Error(`Failed to create sandbox: ${createRes.status} ${JSON.stringify(createRes.data)}`);
    }
    const id1 = createRes.data.containerId;

    // 3. Create second sandbox to test boundary
    const createRes2 = await fetchJson('/sandbox', 'POST');
    const id2 = createRes2.data.containerId;

    // 4. Propose command
    console.log("Proposing command...");
    const propRes = await fetchJson(`/sandbox/${id1}/propose`, 'POST', { cmd: 'echo "hello"' });
    const hash = propRes.data.proposalHash;

    // 5. Approve command
    console.log("Approving command...");
    await fetchJson(`/sandbox/${id1}/approve`, 'POST', { proposalHash: hash });

    // 6. Cross-sandbox execution failure
    console.log("Testing cross-sandbox isolation...");
    const execCross = await fetchJson(`/sandbox/${id2}/execute`, 'POST', { cmd: 'echo "hello"', proposalHash: hash });
    if (execCross.status !== 403) throw new Error("Sandbox A proposal executed in Sandbox B!");

    // 7. Legitimate execution
    console.log("Testing legitimate execution...");
    const execRes = await fetchJson(`/sandbox/${id1}/execute`, 'POST', { cmd: 'echo "hello"', proposalHash: hash });
    if (execRes.status !== 200 || !execRes.data.stdout.includes('hello')) throw new Error("Legitimate execution failed!");

    // 8. Timeout triggers removal
    console.log("Testing timeout removal...");
    const propRes2 = await fetchJson(`/sandbox/${id1}/propose`, 'POST', { cmd: 'sleep 6' });
    const hash2 = propRes2.data.proposalHash;
    await fetchJson(`/sandbox/${id1}/approve`, 'POST', { proposalHash: hash2 });
    
    const execTimeout = await fetchJson(`/sandbox/${id1}/execute`, 'POST', { cmd: 'sleep 6', proposalHash: hash2 });
    if (execTimeout.status !== 403 || !execTimeout.data.error.includes('timed out')) throw new Error("Timeout did not fail correctly!");

    // Verify it was removed
    const verifyDel = await fetchJson(`/sandbox/${id1}`, 'DELETE');
    if (verifyDel.status !== 404) throw new Error("Timeout did not remove sandbox from API inventory!");
    
    // Direct Docker inspection assertion proving actual container is absent
    const { spawnSync } = require('child_process');
    const dockerCheck = spawnSync('docker', ['inspect', id1]);
    if (dockerCheck.status === 0) {
       throw new Error(`Cleanup failure: Docker container ${id1} is still present!`);
    }

    // Cleanup
    await fetchJson(`/sandbox/${id2}`, 'DELETE');
    console.log("✅ Agent Sandbox Platform passed behavioral tests.");
    apiProcess.kill();
  } catch (err) {
    console.error("❌ Test Failed:", err);
    apiProcess.kill();
    process.exit(1);
  }
}

runTests();

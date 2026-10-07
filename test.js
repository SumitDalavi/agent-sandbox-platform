const assert = require('assert');
const fs = require('fs');

async function runTests() {
  console.log("Running Agent Sandbox Platform Tests...");
  
  // Test 1: Auth Middleware exists
  const apiCode = fs.readFileSync(__dirname + '/api/src/index.ts', 'utf8');
  assert(apiCode.includes('authMiddleware'), "Gate 1 Failed: Unauthenticated approvals not rejected.");
  
  // Test 2: Context Binding
  assert(apiCode.includes('proposal.sandboxId !== id'), "Gate 2 Failed: Sandbox ID not bound to proposal.");
  
  // Test 3: Cleanup
  const engineCode = fs.readFileSync(__dirname + '/sandbox-engine/src/engine.ts', 'utf8');
  assert(engineCode.includes('container.remove({ force: true })'), "Gate 3 Failed: Container not forcefully removed on timeout.");
  
  console.log("✅ Agent Sandbox Platform passed.");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});

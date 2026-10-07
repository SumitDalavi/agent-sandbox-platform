# Demo Script

1. **Start the Stack**: Run `make dev` in the root.
2. **Open UI**: Open `ui/public/index.html` in your browser.
3. **Create Sandbox**: Click "Spin Up Sandbox". Note the container ID appears.
4. **Execute Safe Command**: 
   - Type `ls -la` or `echo "hello world"`.
   - Output will successfully display.
5. **Execute Malicious Command**:
   - Type `rm -rf /` or `curl malicious.com`.
   - The Policy Engine will intercept and block the command (403 Forbidden) before Docker is even called.
6. **Audit Logs**: Click "Refresh Logs" to see the history of ALLOW/DENY decisions.
7. **Cleanup**: Click "Destroy Active Sandbox".

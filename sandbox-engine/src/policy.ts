/**
 * A robust policy engine that tokenizes commands rather than using naive substring matching.
 */
let blockedTokens = ['rm', 'curl', 'wget', 'nc', 'bash', 'sh', 'netcat', 'apk'];

export function getPolicy(): string[] {
  return [...blockedTokens];
}

export function setPolicy(tokens: string[]): void {
  blockedTokens = [...tokens];
}

export function evaluatePolicy(command: string): boolean {
  // Simple tokenizer: split on whitespace and shell metacharacters
  const tokens = command.split(/[\s|&;()<>]+/);
  
  for (const token of tokens) {
    if (blockedTokens.includes(token)) {
      return false; // Deny
    }
  }
  
  // Specific dangerous paths
  if (command.includes('/etc/shadow') || command.includes('/root')) {
    return false;
  }

  return true; // Allow
}

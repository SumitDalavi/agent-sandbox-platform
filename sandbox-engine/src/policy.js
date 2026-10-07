"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluatePolicy = evaluatePolicy;
/**
 * A robust policy engine that tokenizes commands rather than using naive substring matching.
 */
function evaluatePolicy(command) {
    // Simple tokenizer: split on whitespace and shell metacharacters
    const tokens = command.split(/[\s|&;()<>]+/);
    const blockedTokens = ['rm', 'curl', 'wget', 'nc', 'bash', 'sh', 'netcat', 'apk'];
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

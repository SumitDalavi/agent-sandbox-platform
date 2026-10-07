export function evaluatePolicy(command: string): boolean {
  const blocked = ['rm -rf', 'curl', 'wget', 'nc', 'bash -i'];
  for (const b of blocked) {
    if (command.includes(b)) return false;
  }
  return true;
}

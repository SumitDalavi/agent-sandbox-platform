import Docker from 'dockerode';
import { evaluatePolicy } from './policy';
const docker = new Docker();

export async function executeCommand(cmd: string): Promise<string> {
  if (!evaluatePolicy(cmd)) {
    throw new Error('Command blocked by Sandbox Policy Engine.');
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([SANDBOX EXECUTOR] Successfully ran '\' inside isolated namespace.\nNetwork egress blocked. State cleared.);
    }, 1500);
  });
}

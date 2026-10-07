import Docker from 'dockerode';
import { evaluatePolicy } from './policy';

const docker = new Docker();

export class Sandbox {
  containerId: string;
  
  constructor(containerId: string) {
    this.containerId = containerId;
  }

  static async create(): Promise<Sandbox> {
    try {
      // Create an Alpine container that sleeps infinitely
      const container = await docker.createContainer({
        Image: 'alpine:latest',
        Cmd: ['tail', '-f', '/dev/null'],
        HostConfig: {
          NetworkMode: 'none', // Strict network isolation
          Memory: 128 * 1024 * 1024, // 128MB limit
          Nanocpus: 1000000000, // 1 CPU
        },
      });
      await container.start();
      return new Sandbox(container.id);
    } catch (err: any) {
      if (err.statusCode === 404) {
        // Automatically pull the image if missing
        console.log("alpine:latest not found, pulling...");
        await new Promise((resolve, reject) => {
          docker.pull('alpine:latest', (err: Error, stream: NodeJS.ReadableStream) => {
            if (err) return reject(err);
            docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
          });
        });
        return Sandbox.create();
      }
      throw err;
    }
  }

  async executeCommand(cmd: string): Promise<{ stdout: string, stderr: string }> {
    if (!evaluatePolicy(cmd)) {
      throw new Error('Command blocked by Sandbox Policy Engine.');
    }

    const container = docker.getContainer(this.containerId);
    
    // Use sh -c to evaluate the command
    const exec = await container.exec({
      Cmd: ['sh', '-c', cmd],
      AttachStdout: true,
      AttachStderr: true,
    });
    
    const stream = await exec.start({ Detach: false });
    
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      
      // Dockerode multiplexes stdout and stderr
      docker.modem.demuxStream(stream, {
        write: (chunk: Buffer) => { stdout += chunk.toString(); }
      }, {
        write: (chunk: Buffer) => { stderr += chunk.toString(); }
      });
      
      stream.on('end', () => {
        resolve({ stdout, stderr });
      });
      stream.on('error', reject);
    });
  }

  async destroy(): Promise<void> {
    const container = docker.getContainer(this.containerId);
    await container.remove({ force: true });
  }
}

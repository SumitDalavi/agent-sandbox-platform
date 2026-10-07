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
      const container = await docker.createContainer({
        Image: 'alpine:latest',
        Cmd: ['tail', '-f', '/dev/null'],
        User: '1000:1000',
        HostConfig: {
          NetworkMode: 'none',
          Memory: 128 * 1024 * 1024,
          NanoCpus: 1000000000,
          PidsLimit: 32,
          ReadonlyRootfs: true,
          CapDrop: ['ALL'],
          SecurityOpt: ['no-new-privileges:true'],
          Tmpfs: { '/tmp': 'rw,size=32m,mode=1777' }
        },
      });
      await container.start();
      return new Sandbox(container.id);
    } catch (err: any) {
      if (err.statusCode === 404) {
        console.log("alpine:latest not found, pulling...");
        await new Promise((resolve, reject) => {
          docker.pull('alpine:latest', (err: Error, stream: NodeJS.ReadableStream) => {
            if (err) return reject(err);
            docker.modem.followProgress(stream, (err: any, res: any) => err ? reject(err) : resolve(res));
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
    
    // Split command strictly into executable + args, bypassing arbitrary shell execution
    const args = cmd.trim().split(/\s+/);
    
    const exec = await container.exec({
      Cmd: args,
      AttachStdout: true,
      AttachStderr: true,
    });
    
    const stream = await exec.start({ Detach: false });
    
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      let totalBytes = 0;
      const MAX_BYTES = 1024 * 1024; // 1MB limit
      
      const forceRemove = async () => {
         try { 
           await container.remove({ force: true }); 
         } catch (e) {
           try {
             await container.inspect();
             throw new Error(`Failed to remove container ${container.id}, it is still running.`);
           } catch (inspectError: any) {
             // 404 means it's gone
             if (inspectError.statusCode !== 404) {
               throw new Error(`Cleanup failure: could not confirm removal of ${container.id}`);
             }
           }
         }
      };
      
      const timeout = setTimeout(async () => {
         stream.destroy();
         await forceRemove();
         reject(new Error("Execution timed out (5s). Container removed."));
      }, 5000);

      const handleChunk = async (chunk: Buffer, isErr: boolean) => {
        totalBytes += chunk.length;
        if (totalBytes > MAX_BYTES) {
           clearTimeout(timeout);
           stream.destroy();
           await forceRemove();
           reject(new Error("Output limit exceeded. Container removed."));
           return;
        }
        if (isErr) stderr += chunk.toString();
        else stdout += chunk.toString();
      };

      docker.modem.demuxStream(stream, {
        write: (chunk: any) => { handleChunk(chunk as Buffer, false); return true; }
      } as any, {
        write: (chunk: any) => { handleChunk(chunk as Buffer, true); return true; }
      } as any);
      
      stream.on('end', async () => {
        clearTimeout(timeout);
        try {
          const info = await exec.inspect();
          if (info.ExitCode !== 0) {
            reject(new Error(`Process exited with code ${info.ExitCode}. STDERR: ${stderr}`));
            return;
          }
        } catch (e) {}
        resolve({ stdout, stderr });
      });
      stream.on('error', (err: any) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  async destroy(): Promise<void> {
    const container = docker.getContainer(this.containerId);
    try {
      await container.remove({ force: true });
    } catch (e: any) {
      if (e.statusCode !== 404) {
         try {
             await container.inspect();
             throw new Error(`Failed to remove container ${this.containerId}, it is still running.`);
         } catch (inspectError: any) {
             if (inspectError.statusCode !== 404) throw new Error(`Cleanup failure: could not confirm removal of ${this.containerId}`);
         }
      }
    }
  }
}

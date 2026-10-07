"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sandbox = void 0;
const dockerode_1 = __importDefault(require("dockerode"));
const policy_1 = require("./policy");
const docker = new dockerode_1.default();
class Sandbox {
    containerId;
    constructor(containerId) {
        this.containerId = containerId;
    }
    static async create() {
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
        }
        catch (err) {
            if (err.statusCode === 404) {
                console.log("alpine:latest not found, pulling...");
                await new Promise((resolve, reject) => {
                    docker.pull('alpine:latest', (err, stream) => {
                        if (err)
                            return reject(err);
                        docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
                    });
                });
                return Sandbox.create();
            }
            throw err;
        }
    }
    async executeCommand(cmd) {
        if (!(0, policy_1.evaluatePolicy)(cmd)) {
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
            const timeout = setTimeout(() => {
                stream.destroy();
                container.kill().catch(() => { });
                reject(new Error("Execution timed out (5s). Container killed."));
            }, 5000);
            const handleChunk = (chunk, isErr) => {
                totalBytes += chunk.length;
                if (totalBytes > MAX_BYTES) {
                    clearTimeout(timeout);
                    stream.destroy();
                    container.kill().catch(() => { });
                    reject(new Error("Output limit exceeded. Container killed."));
                    return;
                }
                if (isErr)
                    stderr += chunk.toString();
                else
                    stdout += chunk.toString();
            };
            docker.modem.demuxStream(stream, {
                write: (chunk) => { handleChunk(chunk, false); return true; }
            }, {
                write: (chunk) => { handleChunk(chunk, true); return true; }
            });
            stream.on('end', async () => {
                clearTimeout(timeout);
                try {
                    const info = await exec.inspect();
                    if (info.ExitCode !== 0) {
                        stderr += `\nProcess exited with code ${info.ExitCode}`;
                    }
                }
                catch (e) { }
                resolve({ stdout, stderr });
            });
            stream.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
    }
    async destroy() {
        const container = docker.getContainer(this.containerId);
        await container.remove({ force: true });
    }
}
exports.Sandbox = Sandbox;

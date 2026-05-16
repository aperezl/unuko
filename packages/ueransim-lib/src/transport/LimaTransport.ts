import { exec } from 'child_process';
import { promisify } from 'util';
import { UeransimTransport } from './index.js';

const execAsync = promisify(exec);

export class LimaTransport implements UeransimTransport {
  constructor(private instanceName: string = 'core5g') {}

  async execute(command: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    try {
      // We escape the command to be passed safely to limactl shell
      const escapedCommand = command.replace(/'/g, "'\\''");
      const { stdout, stderr } = await execAsync(`limactl shell ${this.instanceName} bash -c '${escapedCommand}'`);
      return { stdout, stderr, exitCode: 0 };
    } catch (error: any) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1
      };
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    const escapedContent = content.replace(/'/g, "'\\''");
    const command = `cat <<EOF > ${path}\n${content}\nEOF`;
    // Alternatively, use a more robust way if content is large
    // For now, this should work for YAML configs
    const result = await this.execute(command);
    if (result.exitCode !== 0) {
      throw new Error(`Failed to write file ${path}: ${result.stderr}`);
    }
  }

  async exists(path: string): Promise<boolean> {
    const result = await this.execute(`[ -f ${path} ]`);
    return result.exitCode === 0;
  }
}

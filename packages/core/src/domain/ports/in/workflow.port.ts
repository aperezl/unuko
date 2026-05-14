import { TaskDefinition, WorkflowPorts } from '../../models/workflow.types';

export interface IWorkflowEngine {
  register(task: TaskDefinition): void;
  getTaskDefinitions(): TaskDefinition[];
  validate(config: any): any;
  createMachine(yamlConfig: any, ports: WorkflowPorts): any;
}

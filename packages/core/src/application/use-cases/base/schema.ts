import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { TaskDefinition } from '../../../domain/models/workflow.types';

export function generateWorkflowSchema(taskDefinitions: TaskDefinition[]) {
  const taskIds = taskDefinitions.map(t => t.id);

  // Define Transition schema in Zod
  const transitionSchema = z.union([
    z.string(),
    z.object({
      target: z.string(),
      assign: z.record(z.string(), z.any()).optional()
    })
  ]);

  const transitionJsonSchema = zodToJsonSchema(transitionSchema as any, { target: 'jsonSchema7' });

  // Base invoke schema
  const invokeSchema: any = {
    type: 'object',
    properties: {
      src: { 
        enum: taskIds,
        description: 'Choose the task to invoke'
      },
      input: {
        type: 'object',
        description: 'Input parameters. Define "src" first to get specific suggestions.'
      },
      onDone: transitionJsonSchema,
      onError: transitionJsonSchema
    },
    required: ['src'],
    // We use 'dependencies' so that the conditional logic is completely HIDDEN
    // from Monaco until 'src' is actually present in the YAML.
    dependencies: {
      src: {
        oneOf: taskDefinitions.map(task => {
          const branch: any = {
            properties: {
              src: { const: task.id }
            }
          };
          
          if (task.input) {
            const inputSchema: any = zodToJsonSchema(task.input as any, { target: 'jsonSchema7' });
            
            // Delete description to ensure Monaco merges this exactly with the base 'input'
            // This prevents the duplicate 'input' entry in the autocomplete list.
            delete inputSchema.description;

            // Extract default values by parsing an empty object
            const parseResult = task.input.safeParse({});
            if (parseResult.success && Object.keys(parseResult.data).length > 0) {
              inputSchema.default = parseResult.data;
            }

            branch.properties.input = inputSchema;
          } else {
            // Explicitly disallow 'input' if the task doesn't take any
            branch.properties.input = false;
          }
          
          return branch;
        })
      }
    }
  };

  // Define the rest of the workflow using Zod for consistency
  const workflowZodSchema = z.object({
    id: z.string().describe('Unique identifier for the workflow'),
    initial: z.string().describe('The initial state of the workflow'),
    context: z.record(z.string(), z.any()).optional().describe('Initial context data'),
    states: z.record(
      z.string(),
      z.object({
        type: z.enum(['final', 'parallel', 'compound', 'atomic']).optional(),
        invoke: z.any().optional(),
        on: z.record(z.string(), transitionSchema).optional()
      })
    )
  }).describe('Unuko Workflow Definition');

  const jsonSchema: any = zodToJsonSchema(workflowZodSchema as any, {
    target: 'jsonSchema7'
  });

  // Inject our refined invokeSchema into the generated JSON Schema
  // We locate where 'states' is defined, handling potential wrapper definitions
  let targetSchema = jsonSchema;
  if (jsonSchema && jsonSchema.$ref) {
    const defName = jsonSchema.$ref.split('/').pop();
    if (defName) {
      if (jsonSchema.definitions && jsonSchema.definitions[defName]) {
        targetSchema = jsonSchema.definitions[defName];
      } else if (jsonSchema.$defs && jsonSchema.$defs[defName]) {
        targetSchema = jsonSchema.$defs[defName];
      }
    }
  }

  if (targetSchema && targetSchema.properties && targetSchema.properties.states) {
    const statesSchema = targetSchema.properties.states;
    if (statesSchema.additionalProperties && statesSchema.additionalProperties.properties) {
      statesSchema.additionalProperties.properties.invoke = invokeSchema;
    }
  }

  return {
    uri: 'https://unuko.com/schemas/workflow.json',
    fileMatch: ['*.yaml', '*.yml'],
    schema: jsonSchema
  };
}

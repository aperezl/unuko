import { z } from 'zod';

export const FunctionExecutionStatusSchema = z.object({
  status: z.enum(["Executed-Success", "Executed-WithWarning", "Failed"]),
  statusCodeData: z.object({
    subjectCode: z.string(), // Example: "8.1.1"
    reasonCode: z.string(),  // Example: "3.8"
    subjectIdentifier: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
});

export const SgpResponseHeaderSchema = z.object({
  functionExecutionStatus: FunctionExecutionStatusSchema,
});

export type SgpResponseHeader = z.infer<typeof SgpResponseHeaderSchema>;
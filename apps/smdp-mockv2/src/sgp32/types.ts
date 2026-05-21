import { z } from 'zod';

export const IotFunctionExecutionStatusSchema = z.object({
  status: z.enum(["Executed-Success", "Executed-WithWarning", "Failed"]),
  statusCodeData: z.object({
    subjectCode: z.string(), // category code (Example: "8.1.1")
    reasonCode: z.string(),  // reason code (Example: "3.8")
    subjectIdentifier: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
});

export const Sgp32ResponseHeaderSchema = z.object({
  functionExecutionStatus: IotFunctionExecutionStatusSchema,
});

export type Sgp32ResponseHeader = z.infer<typeof Sgp32ResponseHeaderSchema>;
export type IotFunctionExecutionStatus = z.infer<typeof IotFunctionExecutionStatusSchema>;
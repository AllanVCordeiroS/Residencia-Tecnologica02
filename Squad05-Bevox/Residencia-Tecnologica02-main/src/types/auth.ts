import type { z } from "zod";

import type { loginSchema } from "@/schemas/auth";

export type LoginCredentials = z.infer<typeof loginSchema>;

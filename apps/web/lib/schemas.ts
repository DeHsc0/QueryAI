/**
 * Zod schemas mirroring the FastAPI backend contracts exactly.
 *
 * Every backend response is validated with these schemas before it reaches
 * component state — an unexpected payload fails loudly in the API layer
 * instead of corrupting the UI downstream.
 *
 * Source of truth: apps/backend/schemas.py + the raw JSONResponse payloads
 * built in apps/backend/api/endpoints/*.py.
 */

import { z } from "zod"

/** apps/backend/schemas.py :: Creds.database_type */
export const databaseTypeSchema = z.enum(["postgresql", "mysql", "oracle", "microsoft"])

/** apps/backend/schemas.py :: Creds */
export const credentialsSchema = z.object({
  host: z.string().min(1),
  database_type: databaseTypeSchema,
  username: z.string().min(1),
  password: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  database: z.string().min(1),
})

/** apps/backend/schemas.py :: Database_Creation */
export const registerDatabaseRequestSchema = z.object({
  database_name: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+$/, "Lowercase letters and numbers only."),
  description: z.string().trim().nullish(),
  creds: credentialsSchema,
})

/**
 * What GET /api/database and POST /api/database actually return per item:
 * { id, database_name, database_soft, description, created_at }.
 *
 * dense_schema is optional-and-nullable: GET omits it entirely, so the
 * "Indexed" chip can only ever be seen when it is really present.
 */
export const databaseSummarySchema = z.object({
  id: z.string(),
  database_name: z.string(),
  database_soft: databaseTypeSchema,
  description: z.string().nullable(),
  created_at: z.string(),
  dense_schema: z.string().nullable().optional(),
})

/** What GET /api/conversation/{db_id} returns per conversation: { id, title, created_at }. */
export const conversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  created_at: z.string(),
})

/** What GET /api/turns/{db_id}/{conversation_id} returns per turn (models.py Turns). */
export const turnSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  user_query: z.string(),
  ai_response: z.string(),
  sql_query: z.array(z.string()).nullable(),
  created_at: z.string(),
})

// ── response wrappers ──────────────────────────────────────────────────

export const databasesResponseSchema = z.object({
  data: z.array(databaseSummarySchema),
})

export const databaseResponseSchema = z.object({
  data: databaseSummarySchema,
})

/** GET /api/conversation/{db_id} — the owning database plus all its conversations, in one response. */
export const databaseWithConversationsResponseSchema = z.object({
  data: z.object({
    database: databaseSummarySchema,
    conversations: z.array(conversationSchema),
    questions: z.array(z.string()).nullable().optional(),
  }),
})

export const turnsResponseSchema = z.object({
  data: z.array(turnSchema),
})

// ── form-level validation (FormState shape, see register-dialog.tsx) ───

export const registrationFormSchema = z.object({
  databaseName: z
    .string()
    .trim()
    .min(1, "Display name is required.")
    .regex(/^[a-z0-9]+$/, "Lowercase letters and numbers only."),
  host: z.string().trim().min(1, "Host is required."),
  port: z
    .string()
    .trim()
    .refine(
      (value) => {
        const port = Number(value)
        return Number.isInteger(port) && port >= 1 && port <= 65535
      },
      "Port must be an integer between 1 and 65535.",
    ),
  database: z.string().trim().min(1, "Database name is required."),
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
})

export type RegistrationFormErrors = Partial<
  Record<"databaseName" | "host" | "port" | "database" | "username" | "password", string>
>

/** First zod issue per field, keyed by field path — feeds the inline error UI. */
export function registrationFormErrors(error: z.ZodError): RegistrationFormErrors {
  const errors: RegistrationFormErrors = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === "string" && !(key in errors)) {
      errors[key as keyof RegistrationFormErrors] = issue.message
    }
  }
  return errors
}

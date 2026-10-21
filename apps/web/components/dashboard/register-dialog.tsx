"use client"

import { cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from "react"
import { ArrowRight, Check, CircleAlert, Eye, EyeOff, Loader2, PartyPopper } from "lucide-react"
import type { DatabaseType, DatabaseSummary, RegisterDatabaseRequest } from "@/lib/types"
import { VendorIcon } from "@/components/shared/sql-code"
import { registerDatabase } from "@/lib/api"
import {
  registrationFormErrors,
  registrationFormSchema,
  type RegistrationFormErrors,
} from "@/lib/schemas"
import { getVendor, vendors } from "./vendor"
import { SetupGuide } from "./setup-guide"
import { Dialog } from "./dialog"
import { FormatDate } from "./format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FormState {
  databaseName: string
  description: string
  connectionString: string
  host: string
  port: string
  database: string
  username: string
  password: string
}

type Errors = RegistrationFormErrors

const blankForm: FormState = {
  databaseName: "",
  description: "",
  connectionString: "",
  host: "",
  port: "",
  database: "",
  username: "",
  password: "",
}

const VENDOR_TO_SCHEME: Record<DatabaseType, string> = {
  postgresql: "postgresql",
  mysql: "mysql",
  oracle: "oracle",
  microsoft: "sqlserver",
}

const SCHEME_TO_VENDOR: Record<string, DatabaseType> = {
  postgresql: "postgresql",
  postgres: "postgresql",
  mysql: "mysql",
  mariadb: "mysql",
  oracle: "oracle",
  oracledb: "oracle",
  sqlserver: "microsoft",
  mssql: "microsoft",
  microsoft: "microsoft",
}

type ParsedConnection = {
  vendor?: DatabaseType
  host?: string
  port?: string
  database?: string
  username?: string
  password?: string
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseConnectionUrl(raw: string): ParsedConnection | null {
  const withoutJdbc = raw.trim().replace(/^jdbc:/i, "")
  const match = /^([a-zA-Z][a-zA-Z0-9+]*):\/\/(.*)$/.exec(withoutJdbc)
  if (!match) return null
  const vendor = SCHEME_TO_VENDOR[match[1].toLowerCase()]
  if (!vendor) return null
  const rest = match[2]
  const parsed: ParsedConnection = { vendor }

  if (rest.includes(";")) {
    const [hostPart, ...params] = rest.split(";")
    const hostPort = hostPart.split("\\")[0]
    const comma = hostPort.indexOf(",")
    if (comma >= 0 && /^\d+$/.test(hostPort.slice(comma + 1).trim())) {
      if (hostPort.slice(0, comma).trim()) parsed.host = hostPort.slice(0, comma).trim()
      parsed.port = hostPort.slice(comma + 1).trim()
    } else if (hostPort.trim()) {
      parsed.host = hostPort.trim()
    }
    for (const param of params) {
      const eq = param.indexOf("=")
      if (eq < 0) continue
      const key = param.slice(0, eq).trim().toLowerCase()
      const value = param.slice(eq + 1).trim()
      if (!value) continue
      if (key === "databasename" || key === "database") parsed.database = value
      else if (key === "user id" || key === "user" || key === "username" || key === "uid")
        parsed.username = value
      else if (key === "password" || key === "pwd") parsed.password = value
      else if (key === "port") parsed.port = value
    }
  } else {
    try {
      const url = new URL(withoutJdbc)
      if (url.username) parsed.username = safeDecode(url.username)
      if (url.password) parsed.password = safeDecode(url.password)
      if (url.hostname) parsed.host = url.hostname
      if (url.port) parsed.port = url.port
      if (url.pathname.length > 1) parsed.database = safeDecode(url.pathname.slice(1))
    } catch {
      const noQuery = rest.split("?")[0]
      const at = noQuery.lastIndexOf("@")
      const userinfo = at >= 0 ? noQuery.slice(0, at) : null
      const hostPart = at >= 0 ? noQuery.slice(at + 1) : noQuery
      if (userinfo) {
        const colon = userinfo.indexOf(":")
        if (colon >= 0) {
          if (userinfo.slice(0, colon)) parsed.username = safeDecode(userinfo.slice(0, colon))
          if (userinfo.slice(colon + 1)) parsed.password = safeDecode(userinfo.slice(colon + 1))
        } else {
          parsed.username = safeDecode(userinfo)
        }
      }
      const slash = hostPart.indexOf("/")
      const hostPort = slash >= 0 ? hostPart.slice(0, slash) : hostPart
      if (slash >= 0 && hostPart.slice(slash + 1))
        parsed.database = safeDecode(hostPart.slice(slash + 1))
      const colon = hostPort.lastIndexOf(":")
      if (colon >= 0 && /^\d+$/.test(hostPort.slice(colon + 1))) {
        parsed.port = hostPort.slice(colon + 1)
        if (hostPort.slice(0, colon)) parsed.host = hostPort.slice(0, colon)
      } else if (hostPart) {
        parsed.host = hostPart
      }
    }
  }
  return parsed
}

function buildConnectionUrl(
  vendor: DatabaseType,
  fields: Pick<FormState, "host" | "port" | "database" | "username" | "password">,
): string {
  const { host, port, database, username, password } = fields
  if (!host.trim()) return ""
  let url = `${VENDOR_TO_SCHEME[vendor]}://`
  if (username.trim()) url += encodeURIComponent(username.trim())
  if (password) url += `:${encodeURIComponent(password)}`
  if (username.trim() || password) url += "@"
  url += host.trim()
  if (port.trim()) url += `:${port.trim()}`
  if (database.trim()) url += `/${database.trim()}`
  return url
}

/** Field errors straight from the shared zod schema (mirrors the backend contract). */
function computeErrors(form: FormState): Errors {
  const result = registrationFormSchema.safeParse(form)
  return result.success ? {} : registrationFormErrors(result.error)
}

/**
 * Registration runs inside a dialog on the workspace itself: two panes
 * (form + read-only guide) with independent scroll, so the page behind
 * never scrolls. The separate registration page was removed.
 */
export function RegisterDatabaseDialog({
  onClose,
  onRegistered,
}: {
  onClose: () => void
  onRegistered: (created: DatabaseSummary) => void
}) {
  const [vendor, setVendor] = useState<DatabaseType>("postgresql")
  const [form, setForm] = useState<FormState>(blankForm)
  const [errors, setErrors] = useState<Errors>({})
  const [touchedSubmit, setTouchedSubmit] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState<DatabaseSummary | null>(null)
  const [mobileGuideOpen, setMobileGuideOpen] = useState(true)
  const [failed, setFailed] = useState(false)

  const vendorMeta = getVendor(vendor)

  const setField = (key: keyof FormState, value: string) => {
    let next: FormState = { ...form, [key]: value }
    if (key !== "connectionString" && key !== "databaseName" && key !== "description") {
      // keep the connection URL in sync whenever a connection field changes
      next = { ...next, connectionString: buildConnectionUrl(vendor, next) }
    }
    setForm(next)
    if (touchedSubmit) setErrors(computeErrors(next))
  }

  const setConnectionString = (value: string) => {
    const parsed = parseConnectionUrl(value)
    if (parsed?.vendor && parsed.vendor !== vendor) setVendor(parsed.vendor)
    const next: FormState = { ...form, connectionString: value }
    if (parsed) {
      if (parsed.host !== undefined) next.host = parsed.host
      if (parsed.port !== undefined) next.port = parsed.port
      if (parsed.database !== undefined) next.database = parsed.database
      if (parsed.username !== undefined) next.username = parsed.username
      if (parsed.password !== undefined) next.password = parsed.password
      if (!parsed.port && !form.port.trim())
        next.port = String(getVendor(parsed.vendor ?? vendor).defaultPort)
    }
    setForm(next)
    if (touchedSubmit) setErrors(computeErrors(next))
  }

  const selectVendor = (next: DatabaseType) => {
    if (next === vendor) return
    setVendor(next)
    // Vendor-specific connection state resets; identity fields carry over.
    const nextForm = { ...form, port: "" }
    nextForm.connectionString = buildConnectionUrl(next, nextForm)
    setForm(nextForm)
    setErrors(computeErrors(nextForm))
  }

  const submit = async () => {
    setTouchedSubmit(true)
    const found = computeErrors(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setSubmitting(true)
    setFailed(false)
    try {
      const payload: RegisterDatabaseRequest = {
        database_name: form.databaseName.trim(),
        description: form.description.trim() || null,
        creds: {
          host: form.host.trim(),
          database_type: vendor,
          username: form.username.trim(),
          password: form.password,
          port: Number(form.port),
          database: form.database.trim(),
        },
      }
      const created = await registerDatabase(payload)
      setRegistered(created)
      setForm((f) => ({ ...f, password: "" }))
      onRegistered(created)
    } catch {
      setFailed(true)
    } finally {
      setSubmitting(false)
    }
  }

  const registerAgain = () => {
    setRegistered(null)
    setErrors({})
    setTouchedSubmit(false)
  }

  const close = () => {
    if (!submitting) onClose()
  }

  const dbName = form.databaseName.trim()

  return (
    <Dialog
      open
      onClose={close}
      title={registered ? "Database registered" : "Register a database"}
      description={
        registered
          ? undefined
          : "Pick your engine, create a dedicated read-only user with the guide, then enter the connection details. Passwords are encrypted server-side with Fernet."
      }
      className="max-h-[calc(100dvh-2rem)] overflow-y-auto md:max-h-none md:h-[calc(100dvh-5rem)] md:overflow-hidden md:flex md:flex-col md:max-w-[1120px]"
    >
      {registered ? (
        <RegistrationSuccess
          created={registered}
          vendor={vendor}
          onDone={close}
          onRegisterAgain={registerAgain}
        />
      ) : (
        <div className="-mx-5 -mb-5 mt-3 grid gap-px border-t border-border bg-border md:min-h-0 md:flex-1 md:grid-cols-[minmax(0,1fr)_400px] md:overflow-hidden">
          {/* main pane: vendor + form */}
          <div className="@container min-w-0 bg-card md:h-full md:overflow-y-auto">
            <div className="p-5">
              {/* step 1 — vendor */}
              <section aria-labelledby="step-vendor" className="mb-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <h3 id="step-vendor" className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    01 · Select database
                  </h3>
                  <span className="text-xs text-muted-foreground">{vendors.length} engines supported</span>
                </div>
                <fieldset>
                  <legend className="sr-only">Database engine</legend>
                  <div role="radiogroup" aria-label="Database engine" className="grid grid-cols-2 gap-2.5 @[500px]:grid-cols-4">
                    {vendors.map((v) => {
                      const selected = v.type === vendor
                      return (
                        <button
                          key={v.type}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => selectVendor(v.type)}
                          className={cn(
                            "group relative flex min-h-24 flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            selected
                              ? "border-accent-bright/60 bg-accent-bright/[0.06] shadow-[inset_0_1px_0_oklch(0.985_0_0/0.05)]"
                              : "border-border bg-card hover:border-ring/60 hover:bg-accent/30"
                          )}
                        >
                          <VendorIcon vendor={v.type} className="size-10 shrink-0" />
                          <span className={cn("text-[13px] leading-4", selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                            {v.label}
                          </span>
                          {selected && (
                            <Check className="absolute right-3 top-3 hidden size-3.5 text-accent-bright sm:block" aria-hidden="true" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
                <p className="mt-3 text-xs text-muted-foreground">
                  The guide updates immediately when you switch engines.
                </p>
              </section>

              {/* mobile: guide disclosure */}
              <div className="mb-6 md:hidden">
                <SetupGuide
                  vendor={vendor}
                  dbName={dbName}
                  variant="disclosure"
                  open={mobileGuideOpen}
                  onToggle={setMobileGuideOpen}
                />
              </div>

              {/* step 2 — connection details */}
              <section aria-labelledby="step-details">
                <h3 id="step-details" className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  02 · Connection details
                </h3>

                <form
                  className="mt-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    submit()
                  }}
                  noValidate
                >
                  <div className="grid gap-4 @[512px]:grid-cols-2">
                    <Field
                      id="connectionUrl"
                      label="Connection URL"
                      className="col-span-full"
                      hint="Optional — paste a connection string to auto-fill the fields. Editing a field updates the URL."
                    >
                      <Input
                        id="connectionUrl"
                        name="connectionUrl"
                        autoComplete="off"
                        spellCheck={false}
                        value={form.connectionString}
                        onChange={(e) => setConnectionString(e.target.value)}
                        placeholder={`${VENDOR_TO_SCHEME[vendor]}://user:password@host:port/database`}
                        className="h-10 font-mono"
                      />
                    </Field>
                    <Field id="databaseName" label="Display name" hint="Lowercase letters and numbers" error={errors.databaseName}>
                      <Input
                        id="databaseName"
                        name="databaseName"
                        autoComplete="off"
                        spellCheck={false}
                        value={form.databaseName}
                        onChange={(e) => setField("databaseName", e.target.value)}
                        placeholder="salesdata"
                        aria-invalid={Boolean(errors.databaseName)}
                        className="h-10 font-mono"
                      />
                    </Field>
                    <Field id="description" label="Description" hint="Optional">
                      <Input
                        id="description"
                        name="description"
                        autoComplete="off"
                        value={form.description}
                        onChange={(e) => setField("description", e.target.value)}
                        placeholder="Production orders and customers"
                        className="h-10"
                      />
                    </Field>
                    <Field id="host" label="Host" error={errors.host}>
                      <Input
                        id="host"
                        name="host"
                        autoComplete="off"
                        spellCheck={false}
                        value={form.host}
                        onChange={(e) => setField("host", e.target.value)}
                        placeholder="db.yourcompany.com"
                        aria-invalid={Boolean(errors.host)}
                        className="h-10 font-mono"
                      />
                    </Field>
                    <Field id="port" label="Port" error={errors.port} hint={`Default ${vendorMeta.defaultPort} for ${vendorMeta.label}`}>
                      <Input
                        id="port"
                        name="port"
                        inputMode="numeric"
                        autoComplete="off"
                        value={form.port}
                        onChange={(e) => setField("port", e.target.value)}
                        placeholder={String(vendorMeta.defaultPort)}
                        aria-invalid={Boolean(errors.port)}
                        className="h-10 font-mono"
                      />
                    </Field>
                    <Field id="database" label={vendor === "oracle" ? "Service name" : "Database name"} error={errors.database}>
                      <Input
                        id="database"
                        name="database"
                        autoComplete="off"
                        spellCheck={false}
                        value={form.database}
                        onChange={(e) => setField("database", e.target.value)}
                        placeholder={vendor === "oracle" ? "ORCLPDB1" : "yourdatabase"}
                        aria-invalid={Boolean(errors.database)}
                        className="h-10 font-mono"
                      />
                    </Field>
                    <Field id="username" label="Username" error={errors.username} hint="The read-only user from the guide">
                      <Input
                        id="username"
                        name="username"
                        autoComplete="off"
                        spellCheck={false}
                        value={form.username}
                        onChange={(e) => setField("username", e.target.value)}
                        placeholder="queryai_readonly"
                        aria-invalid={Boolean(errors.username)}
                        className="h-10 font-mono"
                      />
                    </Field>
                    <Field
                      id="password"
                      label="Password"
                      error={errors.password}
                      className="@[512px]:col-span-2"
                      hint="Encrypted with Fernet before storage, never displayed again"
                      trailing={
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-pressed={showPassword}
                          className="absolute right-1 top-1 grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </button>
                      }
                    >
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(e) => setField("password", e.target.value)}
                        aria-invalid={Boolean(errors.password)}
                        className="h-10 pr-10"
                      />
                    </Field>
                  </div>

                  {Object.keys(errors).length > 0 && touchedSubmit && (
                    <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5" role="alert">
                      <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                      <p className="text-[13px] leading-relaxed text-destructive">
                        Fix the highlighted fields to continue. {Object.keys(errors).length} field{Object.keys(errors).length === 1 ? "" : "s"} need attention.
                      </p>
                    </div>
                  )}

                  {failed && (
                    <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5" role="alert">
                      <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                      <p className="text-[13px] leading-relaxed text-destructive">
                        Registration failed. Nothing was registered, try again.
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-col-reverse items-stretch gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      By registering you confirm QueryAI will connect with the read-only account.
                    </p>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting}
                      className="h-11 shrink-0 gap-2 rounded-lg px-6 text-[15px] font-medium"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                          Registering…
                        </>
                      ) : (
                        <>
                          Register database
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </section>
            </div>
          </div>

          {/* side pane: guide rail */}
          <aside className="hidden md:block md:h-full md:overflow-y-auto">
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between px-1 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <span>Setup guide · read-only user</span>
                <span className="text-[10px] normal-case tracking-normal text-muted-foreground">
                  {vendorMeta.label}
                </span>
              </div>
              <SetupGuide vendor={vendor} dbName={dbName} variant="panel" />
            </div>
          </aside>
        </div>
      )}
    </Dialog>
  )
}

/* ── pieces ───────────────────────────────────────────────────────── */

function Field({
  id,
  label,
  hint,
  error,
  className,
  trailing,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  className?: string
  trailing?: ReactNode
  children: ReactNode
}) {
  const control =
    isValidElement(children)
      ? cloneElement(children as ReactElement<{ id?: string; "aria-describedby"?: string }>, {
          id,
          "aria-describedby": `${id}-hint`,
        })
      : children
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-foreground">
        {label}
      </label>
      {trailing ? (
        <div className="relative">
          {control}
          {trailing}
        </div>
      ) : (
        control
      )}
      <p
        id={`${id}-hint`}
        className={cn("mt-1.5 text-[11.5px] leading-4", error ? "text-destructive" : "text-muted-foreground")}
      >
        {error ?? hint}
      </p>
    </div>
  )
}

function RegistrationSuccess({
  created,
  vendor,
  onDone,
  onRegisterAgain,
}: {
  created: DatabaseSummary
  vendor: DatabaseType
  onDone: () => void
  onRegisterAgain: () => void
}) {
  const meta = getVendor(vendor)
  return (
    <div className="-mx-5 -mb-5 grid border-t border-border bg-card px-6 py-10 text-center md:h-full md:min-h-0 md:place-items-center md:overflow-y-auto">
      <div className="mx-auto max-w-md">
        <span className="mx-auto grid size-12 place-items-center rounded-full border border-accent-bright/40 bg-accent-bright/10">
          <PartyPopper className="size-5 text-accent-bright" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-xl font-medium tracking-tight text-foreground">
          {created.database_name} is registered
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {meta.label} · registered {FormatDate(created.created_at)}
        </p>
        <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
          Your credentials were encrypted server-side with Fernet and your schema was
          extracted. Indexing for agent retrieval runs in the background — the database
          is already visible in your workspace.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="h-11 rounded-lg px-6 text-[15px] font-medium" onClick={onDone}>
            View database list
          </Button>
          <Button size="lg" variant="outline" className="h-11 rounded-lg px-6 text-[15px]" onClick={onRegisterAgain}>
            Register another
          </Button>
        </div>
      </div>
    </div>
  )
}

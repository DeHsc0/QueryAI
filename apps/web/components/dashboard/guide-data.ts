/**
 * Vendor-specific read-only database user setup guides.
 *
 * Sourcing notes (honesty rules):
 * - Commands use feature-complete, documented syntax per vendor. Common
 *   and well-established T-SQL/PL-SQL/DDL where the semantics are stable.
 * - Where behavior has vendor caveats that were not verifiable for this
 *   codebase, they are stated plainly in `notes` instead of papered over.
 * - The commands are run by the user in their own database environment;
 *   the frontend never executes them.
 */

import type { DatabaseType } from "@/lib/types"

export interface GuideStep {
  title: string
  /** Where the command is executed, e.g. which database or tool. */
  runWhere: string
  command: string
  caveat?: string
}

export interface VendorGuide {
  why: string
  prerequisites: string[]
  steps: GuideStep[]
  placeholders: { token: string; meaning: string }[]
  troubleshooting: { problem: string; fix: string }[]
  docsUrl: string
  docsLabel: string
}

const POSTGRES_GUIDE: VendorGuide = {
  why:
    "PostgreSQL roles can hold many privileges. A dedicated role that only receives SELECT lets QueryAI read your analytical data without any path to writing, altering, or administrating.",
  prerequisites: [
    "Run these commands from a superuser or the role that owns the target database and tables.",
    "psql or any SQL console with administrative access.",
  ],
  steps: [
    {
      title: "1 · Create the read-only login role",
      runWhere: "Run in a connection to the cluster (e.g. psql -U postgres)",
      command:
        "CREATE ROLE YOUR_READONLY_USERNAME LOGIN PASSWORD 'YOUR_STRONG_PASSWORD'\n  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;",
      caveat:
        "The flags are explicit by design: without them, inheritance from future role changes could expand effective privileges.",
    },
    {
      title: "2 · Allow connecting to the database",
      runWhere: "Run as an admin; repeat per database you want readable",
      command:
        "GRANT CONNECT ON DATABASE YOUR_DATABASE_NAME TO YOUR_READONLY_USERNAME;",
      caveat:
        "Fresh clusters grant CONNECT to PUBLIC by default; this explicit grant keeps the intent clear and holds if defaults are ever tightened.",
    },
    {
      title: "3 · Grant schema usage",
      runWhere: "Run inside the target database",
      command: "GRANT USAGE ON SCHEMA YOUR_SCHEMA_NAME TO YOUR_READONLY_USERNAME;",
      caveat:
        "USAGE is required before any SELECT works in that schema. Replace YOUR_SCHEMA_NAME with your real schema (often 'public').",
    },
    {
      title: "4 · Grant SELECT on existing tables and views",
      runWhere: "Run inside the target database",
      command:
        "GRANT SELECT ON ALL TABLES IN SCHEMA YOUR_SCHEMA_NAME TO YOUR_READONLY_USERNAME;",
      caveat: "This covers tables and views that already exist today.",
    },
    {
      title: "5 · Keep SELECT on future tables",
      runWhere: "Run as each table-owning role",
      command:
        "ALTER DEFAULT PRIVILEGES IN SCHEMA YOUR_SCHEMA_NAME\n  GRANT SELECT ON TABLES TO YOUR_READONLY_USERNAME;",
      caveat:
        "Default privileges apply only to objects created by the role that runs this statement. If different roles own your tables, run it once per owner (ALTER DEFAULT PRIVILEGES FOR ROLE owner_name IN SCHEMA ...).",
    },
  ],
  placeholders: [
    { token: "YOUR_READONLY_USERNAME", meaning: "A new name for the dedicated role, e.g. queryai_readonly" },
    { token: "YOUR_STRONG_PASSWORD", meaning: "A strong password, used only for this account" },
    { token: "YOUR_DATABASE_NAME", meaning: "The database you registered or are registering" },
    { token: "YOUR_SCHEMA_NAME", meaning: "The schema holding your tables, usually 'public'" },
  ],
  troubleshooting: [
    { problem: "permission denied for schema", fix: "Step 3 is missing: USAGE on the schema must be granted before SELECT works." },
    { problem: "permission denied for table", fix: "The table was created after step 5 by a different owner. Run ALTER DEFAULT PRIVILEGES as that owner, or grant SELECT on the table directly." },
    { problem: "role \"...\" already exists", fix: "Reuse the role with ALTER ROLE ... WITH LOGIN PASSWORD '...' instead of creating a duplicate." },
    { problem: "FATAL: password authentication failed", fix: "Check pg_hba.conf in your server configuration allows password-based (scram-sha-256 or md5) host connections for this user." },
  ],
  docsUrl: "https://www.postgresql.org/docs/current/sql-grant.html",
  docsLabel: "PostgreSQL: GRANT and default privileges",
}

const MYSQL_GUIDE: VendorGuide = {
  why:
    "MySQL privileges are granted per scope. A dedicated account with database-scoped SELECT can read your tables and views without any global or write privilege.",
  prerequisites: [
    "Run from an administrative connection (root or a user with CREATE USER and GRANT privileges).",
    "MySQL 8.0+ syntax.",
  ],
  steps: [
    {
      title: "1 · Create the read-only account",
      runWhere: "Run on your MySQL server as an administrator",
      command:
        "CREATE USER 'YOUR_READONLY_USERNAME'@'localhost'\n  IDENTIFIED BY 'YOUR_STRONG_PASSWORD';",
      caveat:
        "'localhost' permits connections only from the database server itself. Use a specific host or IP for tighter control, or '%' for any host (least specific).",
    },
    {
      title: "2 · Grant database-scoped read access",
      runWhere: "Same administrative session",
      command:
        "GRANT SELECT ON YOUR_DATABASE_NAME.*\n  TO 'YOUR_READONLY_USERNAME'@'localhost';",
      caveat:
        "Covers every table and view inside that database only. No global (*) privileges are involved. Prefer narrower granular open grants for individual tables where possible.",
    },
  ],
  placeholders: [
    { token: "YOUR_READONLY_USERNAME", meaning: "A new name for the dedicated account, e.g. queryai_readonly" },
    { token: "YOUR_STRONG_PASSWORD", meaning: "A strong password, used only for this account" },
    { token: "YOUR_DATABASE_NAME", meaning: "The schema (database) you are registering" },
  ],
  troubleshooting: [
    { problem: "ERROR 1044: Access denied for user to database", fix: "The SELECT grant is missing or scoped to a different schema. Re-run step 2 against the exact database name." },
    { problem: "ERROR 1698: Access denied for user", fix: "MySQL's auth_socket plugin is active for this account. Create the user with mysql_native_password or caching_sha2_password instead." },
    { problem: "Connection refused from remote host", fix: "The 'host' part of the account does not allow that client host. Recreate the account with the right host value." },
  ],
  docsUrl: "https://dev.mysql.com/doc/refman/8.0/en/grant.html",
  docsLabel: "MySQL 8.0: GRANT statement",
}

const ORACLE_GUIDE: VendorGuide = {
  why:
    "Oracle has no database-wide read-only role by default. The safe pattern is a dedicated account with only CREATE SESSION plus explicit object-level SELECT grants, never a broad system privilege like SELECT ANY TABLE.",
  prerequisites: [
    "Run from an administrative account with the CREATE USER privilege (ADMIN in Autonomous Database; commonly SYS or SYSTEM in self-managed installs).",
    "In multitenant installations (12c+), connect to the pluggable database (PDB) holding your data, not the CDB root.",
  ],
  steps: [
    {
      title: "1 · Create the dedicated account",
      runWhere: "Run as ADMIN in the PDB that stores your data",
      command:
        'CREATE USER YOUR_READONLY_USERNAME\n  IDENTIFIED BY "YOUR_STRONG_PASSWORD";',
      caveat:
        "Oracle passwords are case-sensitive when quoted and must follow database password complexity rules if configured.",
    },
    {
      title: "2 · Grant only the session privilege",
      runWhere: "Same administrative session",
      command: "GRANT CREATE SESSION TO YOUR_READONLY_USERNAME;",
      caveat:
        "This is the only system privilege the account needs. No SELECT ANY TABLE, no quotas, no write privileges.",
    },
    {
      title: "3 · Grant SELECT on each object",
      runWhere: "Per schema you want readable",
      command:
        "GRANT SELECT ON YOUR_SCHEMA_NAME.TABLE_NAME\n  TO YOUR_READONLY_USERNAME;",
      caveat:
        "Object-level grants are the least-privilege option. Repeat for each table or view the agent should read.",
    },
    {
      title: "4 · Generate the remaining grants from the catalog",
      runWhere: "Run as an admin; this query prints GRANT statements, it does not run them",
      command:
        "SELECT 'GRANT SELECT ON YOUR_SCHEMA_NAME.' || object_name\n       || ' TO YOUR_READONLY_USERNAME;'\nFROM all_objects\nWHERE owner = 'YOUR_SCHEMA_NAME'\n  AND object_type IN ('TABLE', 'VIEW');",
      caveat:
        "Review the output, then copy and execute it back in the same session to apply every missing grant.",
    },
  ],
  placeholders: [
    { token: "YOUR_READONLY_USERNAME", meaning: "A new name for the dedicated account, e.g. queryai_readonly" },
    { token: "YOUR_STRONG_PASSWORD", meaning: "A strong password, used only for this account" },
    { token: "YOUR_SCHEMA_NAME", meaning: "The schema (user) that owns your tables" },
    { token: "TABLE_NAME", meaning: "One table or view to grant read access to" },
  ],
  troubleshooting: [
    { problem: "ORA-01045: user lacks CREATE SESSION privilege", fix: "Step 2 was skipped or the account was created with NO AUTHENTICATION. Grant CREATE SESSION to the account." },
    { problem: "ORA-00942: table or view does not exist", fix: "The object-level SELECT grant for that table is missing (step 3), or you are connected to the wrong PDB." },
    { problem: "ORA-01031: insufficient privileges to create user", fix: "Your admin session lacks CREATE USER. In Autonomous Database use the ADMIN account." },
  ],
  docsUrl: "https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/GRANT-statement.html",
  docsLabel: "Oracle Database 19c: GRANT statement",
}

const SQLSERVER_GUIDE: VendorGuide = {
  why:
    "SQL Server separates a server-level login from a database-level user. A login maps to exactly the database it should read and joins the database-scoped db_datareader role's narrow, well-understood permission (SELECT on tables and views in that database, nothing else).",
  prerequisites: [
    "Run from a connection with sysadmin or database-owner privileges.",
    "Steps 1 and 2 run in different databases, as marked.",
  ],
  steps: [
    {
      title: "1 · Create the server login",
      runWhere: "Run in the master database",
      command:
        "CREATE LOGIN YOUR_READONLY_USERNAME\n  WITH PASSWORD = 'YOUR_STRONG_PASSWORD',\n  CHECK_POLICY = ON;",
      caveat:
        "A server login alone cannot touch any database. It becomes usable only once mapped in the database (step 2).",
    },
    {
      title: "2 · Map the login to a database user",
      runWhere: "Run in YOUR_DATABASE_NAME",
      command:
        "CREATE USER YOUR_READONLY_USERNAME\n  FOR LOGIN YOUR_READONLY_USERNAME;",
      caveat:
        "The user exists only inside this database, which is the boundary of the access you are granting.",
    },
    {
      title: "3 · Add the read-only database role",
      runWhere: "Run in YOUR_DATABASE_NAME",
      command:
        "ALTER ROLE db_datareader ADD MEMBER YOUR_READONLY_USERNAME;",
      caveat:
        "db_datareader is SELECT on every user table and view in this database only. No writes, no rights in other databases. Prefer the object-level alternative below where possible.",
    },
    {
      title: "4 · Optional: object-level alternative",
      runWhere: "Run in YOUR_DATABASE_NAME, skip step 3 if you use this",
      command:
        "GRANT SELECT ON dbo.TABLE_NAME\n  TO YOUR_READONLY_USERNAME;",
      caveat:
        "Narrower than db_datareader: repeat per table or view."
    },
  ],
  placeholders: [
    { token: "YOUR_READONLY_USERNAME", meaning: "A new name for the dedicated login and user, e.g. queryai_readonly" },
    { token: "YOUR_STRONG_PASSWORD", meaning: "A strong password, used only for this account" },
    { token: "YOUR_DATABASE_NAME", meaning: "The database you are registering" },
    { token: "TABLE_NAME", meaning: "One table to grant read access to" },
  ],
  troubleshooting: [
    { problem: "Login failed for user", fix: "The login was not created (step 1), the password is wrong, or SQL Server authentication is disabled on the instance." },
    { problem: "Cannot open database", fix: "The login has no user mapping in that database. Run step 2 inside YOUR_DATABASE_NAME." },
    { problem: "The SELECT permission was denied", fix: "db_datareader membership (step 3) covers user tables only; system views and other databases are intentionally excluded." },
  ],
  docsUrl: "https://learn.microsoft.com/en-us/sql/t-sql/statements/grant-object-permissions-transact-sql?view=sql-server-ver16",
  docsLabel: "Microsoft: object permissions (GRANT)",
}

export const guides: Record<DatabaseType, VendorGuide> = {
  postgresql: POSTGRES_GUIDE,
  mysql: MYSQL_GUIDE,
  oracle: ORACLE_GUIDE,
  microsoft: SQLSERVER_GUIDE,
}

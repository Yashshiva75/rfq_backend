# Project Instructions — Mini RFQ Portal

## Tech Stack
- Node.js, Express, TypeScript
- PostgreSQL with Prisma ORM
- Follow the existing project structure and installed package versions.

## General Rules
- Inspect existing code before making changes.
- Reuse existing utilities, middleware, validation patterns, and error handling.
- Keep code modular; separate routes, controllers, services, and database access according to existing conventions.
- Do not rewrite unrelated files or introduce unnecessary dependencies.
- Do not assume missing business requirements. Ask before making significant design decisions.

## Database Rules
- Treat `prisma/schema.prisma` as the source of truth for the data model.
- Do not modify models, relations, enums, or migrations unless required by the task.
- Never change existing database data or run destructive migrations without explicit approval.
- Use Prisma transactions when multiple database changes must succeed or fail together.
- Validate foreign-key ownership and cross-record business rules in the service layer.
- Use Decimal for monetary values; never use floating-point arithmetic for financial calculations.
- Preserve quotation revision history; do not overwrite historical snapshots.

## Authorization and Security
- Validate user input on the server.
- Enforce authentication and role-based authorization on every protected endpoint.
- Vendors must only access RFQs they are authorized to view and their own quotations.
- Never trust user IDs, role IDs, prices, totals, or ownership supplied by the client without server-side validation.
- Store password hashes, never plaintext passwords.
- Never expose secrets or `.env` values in code, logs, or responses.

## Workflow
- First explain the proposed approach and files to be changed.
- Make the smallest change that satisfies the task.
- Do not silently change APIs, database schema, or existing behavior.
- Run relevant formatting, type-checking, tests, and Prisma validation when applicable.
- Report changed files, checks run, failures, and any remaining risks.
- Ask before installing dependencies, running migrations, deleting files, or performing destructive operations.
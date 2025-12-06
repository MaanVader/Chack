# CHACK PRD

## Overview
- **Product**: CHACK – security assessment platform for managing blackbox/whitebox testing.
- **Goal**: Give small security teams and engineering orgs a single place to run assessments, track findings, and share results across organizations/projects.
- **Primary Outcomes**: Faster assessment turnaround, clearer finding ownership, and real-time visibility for stakeholders.

## Scope (v0.1–v0.2)
- Included: OAuth login (Google/GitHub) via NextAuth; first-time onboarding; organization and project CRUD; assessment creation (simulated execution); auto-generated findings/results; dashboard with summaries; Convex-backed real-time data; basic RBAC (owner/admin/analyst/viewer as represented in UI/data).
- Excluded (future): Real scanner integrations, edit/delete findings, reporting/exports, notifications, webhooks, advanced search/filtering.

## Users & Personas
- **Security Lead**: Plans assessments, wants progress and risk visibility.
- **Pentester/Analyst**: Runs assessments, captures findings, needs fast input + evidence.
- **Engineering Manager**: Consumes results, cares about status and remediation clarity.
- **Org Admin**: Manages org membership, plans, and access.

## User Stories (core)
- As a new user, I can sign in with Google/GitHub and be guided to create or join an organization.
- As an org member, I can create projects and see them in my dashboard and sidebar.
- As a pentester, I can create an assessment with target metadata (type, target URL or GitHub public repo link) and trigger a run.
- As a stakeholder, I can view assessment status, findings (severity, CWE, remediation), and results data in real time.
- As an org admin, I can view members and their roles.

## Key Flows
- **Auth & Onboarding**: NextAuth OAuth → new users redirected to onboarding → create org → land on dashboard.
- **Project Setup**: From dashboard, create project → appears in sidebar with counts.
- **Assessment Run**: Create assessment (type/target) → choose target as a web app URL or a GitHub public repo link → simulated 5s run → auto findings/results → status updates (pending/running/completed/failed).
- **Results Consumption**: Assessment detail shows findings (severity, status, remediation) and results (JSON/metadata) with status badges.
- **Org Context**: Sidebar shows current org, switching capability, members list.

## Functional Requirements
- Auth: OAuth (Google, GitHub), persistent sessions, sign out, provider tracking.
- Onboarding: First-login detection, org creation, redirect logic.
- Organizations: Create/read, switch orgs, plan metadata (free/pro/enterprise), members with roles.
- Projects: Create/read within org; status (active/archived); sidebar surfacing.
- Assessments: Create with type (blackbox/whitebox) + target (web_app/api/mobile/network) with target source as either a web app URL or a GitHub public repo link; auto-run; statuses; history listing.
- Findings: Auto-generated with severity, CWE ID, CVSS, location/evidence, remediation; statuses (open/confirmed/false_positive/resolved).
- Results: Auto-generated result items (scan_data/vulnerability/configuration/log) with JSON payload + metadata.
- Dashboard/UI: Sidebar with org info, quick stats, members toggle, projects/assessments lists; navbar with user info; breadcrumbs and status chips; dark theme + responsive layout.

## Data Model (Convex)
- Entities: users (synced from NextAuth), organizations, memberships (role), projects, assessments, findings, results.
- Relationships: Organization → Projects → Assessments → {Findings, Results}.
- Real-time sync: Convex functions provide query/mutation paths; auto type generation.

## Non-Functional Requirements
- Performance: Core pages load <1.5s on broadband; simulated runs complete in ~5s.
- Availability: Target 99% for hosted environments; graceful error handling for Convex/NextAuth failures.
- Security: OAuth best practices; JWT sessions; role-aware UI; protect API routes; sanitize user input displayed in UI.
- Observability: Log auth/assessment lifecycle events; basic error surfaces to user.

## Success Metrics (initial)
- Activation: % of new sign-ins completing onboarding and creating an org.
- Engagement: Projects created per active org; assessments run per week; findings viewed per assessment.
- Reliability: Assessment run success rate; Convex/NextAuth error rate.
- Time-to-signal: Median time from assessment creation to results visible (simulated ~5s).

## Release Plan
- **v0.1 (current)**: OAuth + onboarding, org/project CRUD, simulated assessments with auto findings/results, dashboard/sidebar, Convex realtime.
- **v0.2**: Basic finding management (edit/update), reporting/export (PDF/CSV), email notifications.
- **v0.3**: Pluggable scanner integrations, webhooks/API, advanced filters/search, SSO/SCIM.

## Dependencies
- Frontend: Next.js 15 (App Router), React 19, Tailwind.
- Auth: NextAuth (Google/GitHub providers).
- Backend: Convex (queries/mutations, schema).
- Deployment: Vercel-ready; Convex cloud for data.

## Risks & Mitigations
- Scanner realism is simulated → manage expectations in UI and docs; plan integration path.
- RBAC enforcement mostly UI-level → add server-side guards for sensitive actions.
- Multi-tenant data safety → validate org context on all queries/mutations.
- OAuth provider quotas/creds → document setup and fallbacks.

## Open Questions
- Which real scanners/services to integrate first (e.g., ZAP, Burp, custom)?  
- How to handle evidence uploads securely (storage choice, PII handling)?  
- Do we need per-assessment collaborator roles vs org roles?  
- Reporting format preference (PDF with exec summary vs CSV/JSON export)?  
- Notification channels priority (email, Slack, webhooks)?  
- SLA/uptime targets for production?  


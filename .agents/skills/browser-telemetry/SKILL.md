# Skill: Observability Development

## Purpose

Develop observability for a multi-layer web system so that an AI agent can understand, debug, and improve workflows across:

browser → frontend server → backend/API → microservices → databases.

## When to use this skill

Use this skill when:

- adding observability to a new system;
- improving debugging capacity;
- preparing a system for AI-agent development;
- connecting browser events to backend traces;
- reducing the amount of code/log context the agent needs to read;
- creating a full-stack request trace loop.

## Architecture 

The system has this structure: `bash command to fetch the files that have the system architecture context`

The system uses RESTful HTTP APIs, but this skill may also be adapted for GraphQL, queues, WebSockets, or event-driven workflows.


## Required correlation fields

Every span, log, error, and browser event should include:

```json
{
  "trace_id": "...",
  "span_id": "...",
  "parent_span_id": "...",
  "request_id": "...",
  "session_id": "...",
  "user_action_id": "...",
  "workflow.name": "...",
  "test.scenario.id": "..."
}
````

## Required resource fields

Every service should emit:

```json
{
  "service.name": "...",
  "service.version": "...",
  "deployment.environment.name": "...",
  "container.image.name": "...",
  "container.image.tag": "..."
}
```

## Required source-code fields

Every manually instrumented span/log/error should include:

```json
{
  "source.repository.url": "...",
  "source.commit.sha": "...",
  "source.branch": "...",
  "code.file.repo_path": "...",
  "code.file.path": "...",
  "code.function.name": "...",
  "code.namespace": "...",
  "code.line.number": 0,
  "code.line.end": 0
}
```

Prefer this stable source identity:

```txt
<service>@<commit>:<repo-relative-file-path>#L<start>-L<end>
```

Example:

```txt
proposal-api@9f4a2c8:src/modules/proposals/use-cases/create-proposal.usecase.ts#L42-L87
```

## Required architecture fields

Every span/log/error should identify its architectural role:

```json
{
  "architecture.layer": "browser | frontend_server | backend | microservice | database",
  "architecture.component_type": "component | route | controller | use_case | repository | database_client | external_api_client",
  "module.name": "...",
  "domain.entity": "...",
  "domain.operation": "create | read | update | delete | validate | generate | sync"
}
```

## Required operation fields

Use operation summaries to save agent context:

```json
{
  "operation.name": "...",
  "operation.summary": "...",
  "input.schema": "...",
  "output.schema": "...",
  "payload.fields.present": [],
  "payload.fields.missing": [],
  "payload.size.bytes": 0,
  "payload.hash": "sha256:..."
}
```

Never emit raw sensitive payloads by default.

## Browser instrumentation requirements

The browser telemetry layer must observe:

* page load;
* route changes;
* query/path/parameter changes;
* click events;
* form submissions;
* validation errors;
* fetch/XHR requests;
* response status;
* console errors;
* uncaught exceptions;
* unhandled promise rejections;
* localStorage/sessionStorage writes;
* React component render behavior;
* source-map-mapped original file paths.

Every browser workflow should start a root workflow span.

Example semantic browser event:

```json
{
  "layer": "browser",
  "event.name": "proposal_form.submit_clicked",
  "workflow.name": "generate_commercial_proposal",
  "session_id": "sess_123",
  "user_action_id": "action_456",
  "trace_id": "abc123",
  "route.path": "/proposals/new",
  "component.name": "ProposalForm",
  "component.file.repo_path": "src/features/proposals/components/ProposalForm.tsx"
}
```

## HTTP propagation requirements

Every browser-triggered request should propagate:

```txt
traceparent: <w3c-trace-context>
x-request-id: <uuid>
x-session-id: <session-id>
x-user-action-id: <user-action-id>
x-workflow-name: <workflow-name>
x-test-scenario-id: <scenario-id>
```

## Backend instrumentation requirements

Instrument:

* route handlers;
* middleware;
* validation;
* controllers;
* services/use cases;
* repositories;
* database clients;
* external API clients;
* queues/events;
* error handlers.

Every backend span should connect the HTTP request to the source file and architecture layer.

Example:

```json
{
  "layer": "backend",
  "http.method": "POST",
  "http.route": "/api/proposals",
  "architecture.component_type": "use_case",
  "module.name": "ProposalsModule",
  "code.file.repo_path": "src/modules/proposals/use-cases/create-proposal.usecase.ts",
  "code.function.name": "CreateProposalUseCase.execute",
  "domain.entity": "Proposal",
  "domain.operation": "create",
  "trace_id": "abc123"
}
```

## Database instrumentation requirements

Every database span should include:

```json
{
  "layer": "database",
  "db.system.name": "postgresql",
  "db.operation.name": "INSERT",
  "db.collection.name": "proposals",
  "db.query.summary": "INSERT proposal",
  "repository.name": "ProposalRepository",
  "repository.method": "create",
  "code.file.repo_path": "src/modules/proposals/repositories/proposal.repository.ts",
  "schema.table": "proposals",
  "migration.expected": "..."
}
```

Do not send raw SQL with sensitive values by default. Prefer query summaries, parameter counts, table names, duration, affected rows, and error class.

## Metrics rule

Do not attach high-cardinality values to metrics.

Avoid these on metrics:

* request_id;
* session_id;
* user_id;
* line number;
* full file path;
* dynamic URL IDs.

Use low-cardinality metric attributes:

```json
{
  "service.name": "proposal-api",
  "http.route": "/api/proposals",
  "http.method": "POST",
  "http.response.status_code": 500,
  "workflow.name": "generate_commercial_proposal",
  "architecture.layer": "backend"
}
```

Use traces/logs for high-cardinality debugging details.

## Agent context layer

Besides raw telemetry, create an agent-readable context layer.

For each failed workflow, generate:

```json
{
  "workflow.name": "...",
  "trace_id": "...",
  "user_action_id": "...",
  "summary": "...",
  "expected.result": "...",
  "actual.result": "...",
  "failure.layer": "...",
  "failure.suspected_cause": "...",
  "error.fingerprint": "...",
  "source.pointers": [],
  "recommended.files": [],
  "next.debugging.steps": []
}
```

The agent should consume this layer before reading raw traces/logs.

## Execution procedure

1. Identify the workflow to observe.
2. Define the expected causal chain.
3. Add correlation IDs to browser, HTTP, backend, microservices, and database.
4. Add source-code metadata to spans/logs/errors.
5. Add browser telemetry for UI events, route changes, network calls, storage changes, and component behavior.
6. Add backend spans for routes, controllers, use cases, repositories, and external dependencies.
7. Add database spans for queries and transactions.
8. Configure telemetry export to the OpenTelemetry Collector.
9. Store telemetry in the chosen backend.
10. Build an agent-readable workflow summary.
11. Test one complete workflow from browser to database.
12. Verify that the agent can fetch only the relevant files and line ranges.

## Output artifacts

After executing this skill, produce:

* observability architecture diagram;
* telemetry metadata contract;
* browser instrumentation plan;
* backend instrumentation plan;
* database instrumentation plan;
* source pointer contract;
* agent-readable workflow schema;
* implementation checklist;
* first workflow test scenario.

## Stop condition

Stop only when one user action can be reconstructed as:

browser event
→ HTTP request
→ backend route
→ business logic
→ database operation
→ response
→ browser state update

And when each relevant step contains:

* trace_id;
* workflow.name;
* user_action_id;
* service.name;
* architecture.layer;
* source pointer;
* operation summary.



# Skill: Request Trace Debugging Loop

## Purpose

Test and debug one user workflow across browser, frontend server, backend, microservices, and database.

## Inputs

- Start URL
- User scenario
- Expected result
- Relevant services
- Observability backend access
- Source repository access

## Procedure

1. Open the frontend URL.
2. Capture initial browser state:
   - URL
   - path
   - params
   - DOM/accessibility tree
   - console errors
   - localStorage/sessionStorage metadata
3. Execute the user action.
4. Capture browser network requests.
5. Extract:
   - trace_id
   - request_id
   - session_id
   - user_action_id
   - workflow.name
6. Query traces/logs by trace_id.
7. Reconstruct the causal chain:
   browser event
   → request
   → route
   → middleware
   → controller
   → use case
   → repository
   → database
   → response
   → UI update
8. Compare expected vs actual behavior.
9. Classify the failure layer.
10. Fetch only source files listed in source.pointers or recommended.files.
11. Propose the smallest safe patch.
12. Add or update regression test.
13. Rerun the same workflow.
14. Compare before/after telemetry.

## Failure classes

- browser_event_failure
- frontend_state_failure
- request_payload_failure
- network_or_proxy_failure
- backend_validation_failure
- business_logic_failure
- database_schema_failure
- database_query_failure
- external_dependency_failure
- response_mapping_failure
- frontend_cache_failure
- ui_render_failure

## Output

Return:

- workflow timeline
- failure classification
- evidence
- source files inspected
- proposed patch
- regression test
- retest result
```

---

# 5. Skill: Source Pointer & Context Compression

Save as:

```txt
.ai/skills/source-pointer-context/SKILL.md
```

````md
# Skill: Source Pointer & Context Compression

## Purpose

Reduce token usage by making telemetry point to precise code locations and compact summaries.

## Principle

Do not fetch full files by default.

Fetch in this order:

1. workflow summary
2. suspicious spans
3. source pointers
4. exact line snippets
5. full files only if necessary

## Required source pointer format

```txt
<service>@<commit>:<repo-relative-path>#L<start>-L<end>
````

Example:

```txt
proposal-api@9f4a2c8:src/modules/proposals/use-cases/create-proposal.usecase.ts#L42-L87
```

## Required metadata

```json
{
  "source.pointer": "...",
  "service.name": "...",
  "source.commit.sha": "...",
  "code.file.repo_path": "...",
  "code.function.name": "...",
  "code.line.number": 0,
  "code.line.end": 0,
  "architecture.layer": "...",
  "module.name": "...",
  "operation.summary": "...",
  "failure.suspected_cause": "...",
  "agent.fetch.priority": "high | medium | low",
  "agent.fetch.reason": "..."
}
```

## Output

Return a ranked list of files and snippets the agent should inspect.

Do not return unrelated files.

````

---

# 6. How this accelerates your development

The acceleration comes from **removing repeated reasoning**.

Without skills, every debugging task starts like this:

```txt
Explain architecture
Explain layers
Explain how to trace
Explain what metadata matters
Explain what files to inspect
Explain how to patch
````

With skills, the agent already knows:

```txt
how to instrument
how to correlate
how to classify failure
how to fetch code
how to avoid token waste
how to retest
```

So your development workflow becomes:

```txt
1. Pick a workflow.
2. Apply Observability Development Skill.
3. Run Request Trace Debugging Skill.
4. Use Source Pointer Skill to fetch minimal code.
5. Use Patch and Regression Skill to fix.
6. Save the improved pattern as a new skill.
```

---

# 7. The most important skill to build first

Start with this one:

```txt
observability-development/SKILL.md
```

Because it creates the foundation for all the others.

Then build:

```txt
request-trace-debugging/SKILL.md
```

Because that is the skill that turns observability into actual development speed.

The final architecture of your skill system should be:

```txt
Observability Development Skill
  ↓
Browser Telemetry Skill
  ↓
Request Trace Debugging Skill
  ↓
Source Pointer & Context Compression Skill
  ↓
Failure Classification Skill
  ↓
Patch and Regression Loop Skill
```

The central idea is:

```txt
Transform architecture knowledge into reusable agent procedures.
Transform telemetry into source-code pointers.
Transform source-code pointers into minimal context.
Transform minimal context into faster patches.
Transform successful patches into regression tests.
```

That is how these ideas become practical **Skills** that accelerate development.

[1]: https://opentelemetry.io/docs/?utm_source=chatgpt.com "Documentation"
[2]: https://playwright.dev/docs/network?utm_source=chatgpt.com "Network"
[3]: https://react.dev/reference/react/Profiler?utm_source=chatgpt.com "Profiler"
[4]: https://opentelemetry.io/docs/concepts/signals/traces/?utm_source=chatgpt.com "Traces"
[5]: https://opentelemetry.io/docs/specs/semconv/registry/attributes/code/?utm_source=chatgpt.com "Code Attributes"
[6]: https://developer.mozilla.org/en-US/docs/Glossary/Source_map?utm_source=chatgpt.com "Source map - Glossary - MDN Web Docs"

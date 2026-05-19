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
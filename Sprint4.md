# Sprint 4

Siva: Backend Controller Unit Tests

I worked on this module that encapsulates unit test coverage for key backend controller endpoints in the `swamp` service. We implemented test-driven validation of the `Login`, `RequestOTP`, and `CreateSwamp` functionalities using Go’s `net/http/httptest` and `testify/assert` libraries. Each test suite initializes an in-memory SQLite database using GORM for isolated, repeatable environments.

The `Login` tests verify password hashing integrity (bcrypt), user credential verification, and input schema validation. `RequestOTP` ensures email validation, OTP generation pathway correctness, and malformed request rejection. The `CreateSwamp` tests validate time-bound event creation, enforce required payload constraints, and assert proper marshaling of both successful and failure conditions.

Test data is dynamically injected using struct-based test tables, allowing parallel validation of edge cases and nominal paths. The tests simulate HTTP requests with custom payloads and verify controller behavior against expected status codes and response fragments.

All components are isolated from external dependencies and conform to best practices for handler testing in Go.

# Sprint 4

## Backend Controller Unit Tests (Siva)

I worked on this module that encapsulates unit test coverage for key backend controller endpoints in the `swamp` service. We implemented test-driven validation of the `Login`, `RequestOTP`, and `CreateSwamp` functionalities using Go's `net/http/httptest` and `testify/assert` libraries. Each test suite initializes an in-memory SQLite database using GORM for isolated, repeatable environments.

### APIs being Tested:
- RequestOTP
- VerifyOTP
- Login
- CreateSwamp
- GetSwamps
- GetSwampByID

### Test Cases:
- **TestLogin**: Validates login functionality
- **TestRequestOTP**: Verifies OTP request process
- **TestCreateSwamp**: Tests swamp creation endpoints

### Test Coverage:
1. Logged in user is registered
2. OTP is valid
3. User has given a valid email address
4. Payloads are valid JSON files
5. Data Models do not have null/invalid outputs

The `Login` tests verify password hashing integrity (bcrypt), user credential verification, and input schema validation. `RequestOTP` ensures email validation, OTP generation pathway correctness, and malformed request rejection. The `CreateSwamp` tests validate time-bound event creation, enforce required payload constraints, and assert proper marshaling of both successful and failure conditions.

Test data is dynamically injected using struct-based test tables, allowing parallel validation of edge cases and nominal paths. The tests simulate HTTP requests with custom payloads and verify controller behavior against expected status codes and response fragments.

All components are isolated from external dependencies and conform to best practices for handler testing in Go.

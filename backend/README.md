## Swamp

[![GoDoc Badge]][godoc] [![GoReportCard Badge]][goreportcard]

Swamp is a dynamic chatroom platform that combines live video feeds with real-time comments to enable seamless communication and collaboration. Whether you're hosting a brainstorming session, a virtual event, or a casual meetup, Swamp is designed to bring people together in an engaging way.

### Features

Swamp's backend is built with a robust set of features to support its dynamic chatroom functionality:

- **Configuration Management**: Using [viper](https://github.com/spf13/viper)
- **Command-Line Interface**: Powered by [cobra](https://github.com/spf13/cobra)
- **PostgreSQL Database**: Integration with migration support via [bun](https://github.com/uptrace/bun)
- **Structured Logging**: Implemented with [Logrus](https://github.com/sirupsen/logrus)
- **Efficient Routing**: Using [chi router](https://github.com/go-chi/chi) and middleware
- **Secure JWT Authentication**: Leveraging [lestrrat-go/jwx](https://github.com/lestrrat-go/jwx)
- **Request Data Validation**: Using [ozzo-validation](https://github.com/go-ozzo/ozzo-validation)
- **HTML Email Support**: With [go-mail](https://github.com/go-mail/mail)

### Getting Started

#### Local Setup

1. **Create a PostgreSQL Database**: Configure environment variables in `dev.env`.
2. **Run the Application**: View available commands with `go run main.go`.
3. **Execute Migrations**: Run all migrations from the database/migrate folder with `go run main.go migrate`.
4. **Start the Application**: Use the serve command with `go run main.go serve`.

#### Docker Compose Setup

1. **Start the Database**: Run `docker compose up -d postgres`.
2. **Initialize the Database**: Execute migrations with `docker compose run server ./main migrate`.
3. **Launch the API Server**: Run `docker compose up`.

### API Routes

#### Authentication

Swamp uses a passwordless login system with the following routes:

| Path          | Method | Required JSON | Header                                | Description                     |
| ------------- | ------ | ------------- | ------------------------------------- | ------------------------------- |
| /auth/login   | POST   | email         |                                       | Initiate login with email       |
| /auth/token   | POST   | token         |                                       | Verify token received via email |
| /auth/refresh | POST   |               | Authorization: "Bearer refresh_token" | Refresh JWTs                    |
| /auth/logout  | POST   |               | Authorization: "Bearer refresh_token" | Logout from current device      |

#### Main API

Swamp's API is divided into two main routes:

- **/api/\***: For general application functionality
- **/admin/\***: For administrative tasks (requires admin JWT)

For a complete overview of API routes, refer to [routes.md](routes.md).

### Testing

The `auth/pwdless` package includes API tests using a mocked database. Run tests with: `go test -v ./...`

### Client Access and CORS

Swamp serves a Progressive Web App (PWA) client from the `./public` folder. CORS configuration is not required when serving the client from the same host as the API.

To enable API access from a different host, set the environment variable `ENABLE_CORS=true`.

### Email Configuration

For development purposes, login tokens will be printed to stdout if valid email SMTP settings are not provided. Set the `EMAIL_SMTP_HOST` environment variable for proper email functionality.

[godoc]: https://godoc.org/github.com/dhax/go-base
[godoc badge]: https://godoc.org/github.com/dhax/go-base?status.svg
[goreportcard]: https://goreportcard.com/report/github.com/dhax/go-base
[goreportcard badge]: https://goreportcard.com/badge/github.com/dhax/go-base

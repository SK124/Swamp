# Project Title

Basic frontend structure for The Swamp web app consisting of boilerplate code, Login page, home page and Create a Room page. 


# Commands To Run Frontend 
    > Clone the Repository to Local 
    > cd frontend 
    > npm install ( to install all dependencies in package.json)
    > npm run dev ( to run the server )

# Running Cypress Tests

## Component Tests
To run component tests in the Cypress UI:
    > cd frontend
    > npm run cypress:open
    > Select component testing and select the component to test for

To run all component tests headlessly in the terminal:
    > cd frontend
    > npm run cypress:component

To run tests for a specific component:
    > npx cypress run --component --spec "cypress/component/Signup.cy.jsx"
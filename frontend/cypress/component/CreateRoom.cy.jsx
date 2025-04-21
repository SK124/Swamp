import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom'; 
import userReducer from '../../src/store/userSlice'; 
import CreateRoom from '../../src/pages/CreateRoom';

describe('CreateRoom Component', () => {
  let mockStore;

  beforeEach(() => {
    // Mock the topics API call
    cy.intercept('GET', 'http://localhost:8080/api/topics', {
      statusCode: 200,
      body: [
        { ID: 1, Name: 'React Development' },
        { ID: 2, Name: 'Backend Development' },
        { ID: 3, Name: 'UI/UX Design' }
      ]
    }).as('getTopics');

    // Setup mock store with test user
    mockStore = configureStore({
      reducer: { user: userReducer },
      preloadedState: {
        user: {
          user: { id: 'test-creator-123', name: 'Test Creator' },
          isAuthenticated: true,
        },
      },
    });

    // Mount the component
    cy.mount(
      <Provider store={mockStore}>
        <BrowserRouter>
          <CreateRoom />
        </BrowserRouter>
      </Provider>
    );

    // Wait for topics to load
    cy.wait('@getTopics');
  });

  it('should display the main title', () => {
    cy.contains('Create a New Swamp').should('be.visible'); 
  });

  it('should display the essential form fields', () => {
    cy.get('#title').should('be.visible');
    cy.contains('label', 'Topics').should('be.visible'); 
    cy.get('#maxParticipants').should('be.visible');
    cy.get('#duration').should('be.visible');
    cy.get('#startTime').should('be.visible');
  });

  it('should display topic checkboxes from the API response', () => {
    cy.contains('label', 'React Development').should('be.visible');
    cy.contains('label', 'Backend Development').should('be.visible');
    cy.contains('label', 'UI/UX Design').should('be.visible');
  });

  it('should allow selecting and deselecting topics', () => {
    // Select a topic
    cy.get('#topic-1').click();
    cy.get('#topic-1').should('be.checked');
    
    // Deselect the topic
    cy.get('#topic-1').click();
    cy.get('#topic-1').should('not.be.checked');
  });

  it('should allow typing into the title field', () => {
    const testTitle = 'My Cypress Test Room';
    cy.get('#title').type(testTitle).should('have.value', testTitle);
  });

  it('should allow setting max participants', () => {
    cy.get('#maxParticipants').clear().type('15').should('have.value', '15');
  });

  it('should allow setting duration', () => {
    cy.get('#duration').clear().type('90').should('have.value', '90');
  });

  it('should allow setting start time', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    futureDate.setHours(10, 0, 0);
    
    // Format date for input (YYYY-MM-DDThh:mm)
    const formattedDate = futureDate.toISOString().slice(0, 16);
    
    cy.get('#startTime').type(formattedDate).should('have.value', formattedDate);
  });

  it('should display validation error for missing required fields', () => {
    // Clear the fields
    cy.get('#title').clear();
    cy.get('#startTime').clear();
    
    // Try to submit
    cy.contains('button', 'Create Swamp').click();
    
    // Should show error message
    cy.contains('Please fill in Title and Start Time.').should('be.visible');
  });

  it('should handle form submission with complete data', () => {
    // Mock the POST request
    cy.intercept('POST', 'http://localhost:8080/api/swamp', {
      statusCode: 201,
      body: {
        swamp: {
          ID: 'new-swamp-123',
          Title: 'Test Swamp'
        }
      }
    }).as('createSwamp');

    // Fill in required fields
    cy.get('#title').type('Test Swamp');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const formattedDate = futureDate.toISOString().slice(0, 16);
    cy.get('#startTime').type(formattedDate);
    
    // Submit the form
    cy.contains('button', 'Create Swamp').click();
    
    // Verify API call
    cy.wait('@createSwamp').then((interception) => {
      expect(interception.request.body).to.have.property('Title', 'Test Swamp');
      expect(interception.request.body).to.have.property('OwnerID');
      expect(interception.request.body).to.have.property('MaxParticipants');
      expect(interception.request.body).to.have.property('StartTime');
      expect(interception.request.body).to.have.property('Duration');
    });
  });

  it('should handle API errors during submission', () => {
    // Mock a failed POST request
    cy.intercept('POST', 'http://localhost:8080/api/swamp', {
      statusCode: 500,
      body: {
        error: 'Server error during swamp creation'
      }
    }).as('failedCreateSwamp');

    // Fill in required fields
    cy.get('#title').type('Test Swamp');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const formattedDate = futureDate.toISOString().slice(0, 16);
    cy.get('#startTime').type(formattedDate);
    
    // Submit the form
    cy.contains('button', 'Create Swamp').click();
    
    // Verify error message is displayed
    cy.contains('Server error during swamp creation').should('be.visible');
  });

  it('should display the submit button', () => {
    cy.contains('button', 'Create Swamp').should('be.visible'); 
  });
  
  it('should show loading state during form submission', () => {
    // Mock a delayed response
    cy.intercept('POST', 'http://localhost:8080/api/swamp', (req) => {
      req.reply({
        delay: 1000,
        statusCode: 201,
        body: {
          swamp: {
            ID: 'new-swamp-123',
            Title: 'Test Swamp'
          }
        }
      });
    }).as('delayedCreateSwamp');

    // Fill in required fields
    cy.get('#title').type('Test Swamp');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const formattedDate = futureDate.toISOString().slice(0, 16);
    cy.get('#startTime').type(formattedDate);
    
    // Submit the form
    cy.contains('button', 'Create Swamp').click();
    
    // Button should show loading state
    cy.contains('button', 'Creating...').should('be.visible');
  });
});
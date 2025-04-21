import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import CreateTopic from '../../src/pages/CreateTopic';

describe('CreateTopic Component', () => {
  beforeEach(() => {
    // Mount the component with router context
    cy.mount(
      <BrowserRouter>
        <CreateTopic />
      </BrowserRouter>
    );
  });

  it('should display the main title', () => {
    cy.contains('Create New Topic').should('be.visible');
  });

  it('should display the topic name input field', () => {
    cy.get('#topicName').should('be.visible');
    cy.contains('label', 'Topic Name').should('be.visible');
  });

  it('should display a create button', () => {
    cy.contains('button', 'Create Topic').should('be.visible');
  });

  it('should allow typing into the topic name field', () => {
    const testName = 'Cypress Testing';
    cy.get('#topicName').type(testName).should('have.value', testName);
  });

  it('should show validation error for empty topic name', () => {
    // Submit form without entering any value
    cy.contains('button', 'Create Topic').click();
    
    // Should display error message
    cy.contains('Topic name is required').should('be.visible');
  });

  it('should show validation error for whitespace-only topic name', () => {
    // Type only spaces
    cy.get('#topicName').type('   ');
    
    // Submit form
    cy.contains('button', 'Create Topic').click();
    
    // Should display error message
    cy.contains('Topic name is required').should('be.visible');
  });



  it('should handle API errors during submission', () => {
    // Mock API error response
    cy.intercept('POST', 'http://localhost:8080/api/topics', {
      statusCode: 500,
      body: { error: 'Server error during topic creation' }
    }).as('failedCreateTopic');

    // Fill in topic name
    cy.get('#topicName').type('Backend Development');
    
    // Submit form
    cy.contains('button', 'Create Topic').click();
    
    // Wait for API call
    cy.wait('@failedCreateTopic');
    
    // Verify error message is displayed
    cy.contains('Server error during topic creation').should('be.visible');
  });



  it('should show loading state during form submission', () => {
    // Mock a delayed response
    cy.intercept('POST', 'http://localhost:8080/api/topics', (req) => {
      req.reply({
        delay: 1000,
        statusCode: 201,
        body: { id: 1, name: 'Delayed Topic' }
      });
    }).as('delayedCreateTopic');

    // Fill in topic name
    cy.get('#topicName').type('Delayed Topic');
    
    // Submit form
    cy.contains('button', 'Create Topic').click();
    
    // Button should show loading state
    cy.contains('button', 'Creating…').should('be.visible');
    
    // Input should be disabled during loading
    cy.get('#topicName').should('be.disabled');
  });


});
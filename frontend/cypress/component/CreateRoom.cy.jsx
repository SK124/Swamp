

import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom'; 
import userReducer from '../../src/store/userSlice'; 
import CreateRoom from '../../src/pages/CreateRoom';

describe('CreateRoom Component (Simple)', () => {
  let mockStore;

  beforeEach(() => {

    mockStore = configureStore({
      reducer: { user: userReducer },
      preloadedState: {
        user: {
          // Mock user data for the test
          user: { id: 'test-creator-123', name: 'Test Creator' },
          isAuthenticated: true,
        },

      },
    });

  
    cy.mount(
      <Provider store={mockStore}>
        <BrowserRouter>
          <CreateRoom />
        </BrowserRouter>
      </Provider>
    );
  });

  it('should display the main title', () => {
    cy.contains('Create a New Swamp').should('be.visible'); 
  });

  it('should display the essential form fields', () => {
    cy.get('#title').should('be.visible');
    cy.get('label:contains("Topics")').should('be.visible'); 
    cy.get('#maxParticipants').should('be.visible');
    cy.get('#duration').should('be.visible');
    cy.get('#startTime').should('be.visible');
  });

   it('should display topic checkboxes (basic check)', () => {

    cy.contains('label', 'React Development').should('be.visible');
  });


  it('should allow typing into the title field', () => {
    const testTitle = 'My Cypress Test Room';
    cy.get('#title').type(testTitle).should('have.value', testTitle);
  });

  it('should display the submit button', () => {
    cy.contains('button', 'Create Swamp').should('be.visible'); 
  });

  
  it('should allow clicking the submit button', () => {
    cy.contains('button', 'Create Swamp').click();
    cy.contains('button', 'Create Swamp').should('not.contain', 'Creating...');
  });
});
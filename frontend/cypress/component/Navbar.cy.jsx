// cypress/component/Navbar.cy.jsx

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../../src/store/userSlice'; // Adjust path
import Navbar from '../../src/components/Navbar';

describe('Navbar Component (Simple)', () => {
  let mockStore;
  const MOCK_USER_ID = 'simple-nav-789';

  beforeEach(() => {
    // Minimal mock store: just need user ID for the profile link
    mockStore = configureStore({
      reducer: { user: userReducer },
      preloadedState: {
        user: {
          user: { id: MOCK_USER_ID }, // Provide only the ID
          isAuthenticated: true, // Assume logged in to render Navbar link correctly
        },
      },
    });

    // Mount with Redux Provider and BrowserRouter for Links
    cy.mount(
      <Provider store={mockStore}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );
  });

  it('should display the navbar title and link to home', () => {
    cy.contains('🎙️ The Swamp')
      .should('be.visible')
      .and('have.attr', 'href', '/');
  });

  it('should have a Create Room link styled as a button', () => {
    // --- FIX ---
    // Target the link (<a> tag) directly, not a button element
    cy.contains('a', 'Create Swamp') // Find an <a> tag containing the text
      .should('be.visible')
      .and('have.attr', 'href', '/create-room');
    // --- END FIX ---
  });

  it('should display the avatar linked to the user profile', () => {
    // Check the link exists and points to the correct profile URL
    cy.get(`a[href="/profile/${MOCK_USER_ID}"]`)
      .should('exist')
      .within(() => {
        // Check the static avatar image is inside the link
        cy.get('img[src="https://github.com/shadcn.png"]').should('exist');
      });
  });

});
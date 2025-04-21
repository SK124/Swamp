// cypress/component/UserProfile.cy.jsx

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../../src/store/userSlice'; 
import UserProfile from '../../src/pages/UserProfile';


const MOCK_USER_ID = '1'; 
const EXPECTED_MOCK_NAME = 'User 1'; // Updated to match UI display
const API_URL = 'http://localhost:8080/api';

// --- Mock Data ---
const MOCK_TOPICS = [
  { ID: 1, Name: 'React Development' },
  { ID: 2, Name: 'Node.js' },
  { ID: 3, Name: 'UI/UX Design' }
];

const MOCK_USER_TOPICS = [1, 3]; // User prefers React and UI/UX
// --- End Mock Data ---


describe('UserProfile Component', () => {
  let mockStore;

  beforeEach(() => {
    // Intercept API calls
    cy.intercept('GET', `${API_URL}/topics`, {
      statusCode: 200,
      body: MOCK_TOPICS
    }).as('getTopics');

    cy.intercept('GET', `${API_URL}/user/${MOCK_USER_ID}/topics`, {
      statusCode: 200,
      body: MOCK_USER_TOPICS
    }).as('getUserTopics');

    cy.intercept('POST', `${API_URL}/user/${MOCK_USER_ID}/topics`, {
      statusCode: 200,
      body: { success: true }
    }).as('saveTopics');
    
    mockStore = configureStore({
      reducer: { user: userReducer },
      preloadedState: {
        user: {
          user: { id: MOCK_USER_ID, name: EXPECTED_MOCK_NAME },
          isAuthenticated: true,
        },
      },
    });

    cy.mount(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={[`/profile/${MOCK_USER_ID}`]}>
          <Routes>
            <Route path="/profile/:userId" element={<UserProfile />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Wait for API calls to complete
    cy.wait(['@getTopics', '@getUserTopics']);
  });

  it('should initially display loading state', () => {
    // Reset the test and intercept before responses complete
    cy.mount(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={[`/profile/${MOCK_USER_ID}`]}>
          <Routes>
            <Route path="/profile/:userId" element={<UserProfile />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Check loading state before resolving API calls
    cy.contains('Loading profile…').should('be.visible');
  });

  it('should display "Your Profile" heading (as it is own profile)', () => {
    cy.contains('Your Profile').should('be.visible');
  });

  it('should display "Your Topics" label for own profile', () => {
    cy.contains('Your Topics').should('be.visible');
  });

  

  it('should have a "Save Preferences" button and handle saving', () => {
    cy.contains('button', 'Save Preferences').should('be.visible').click();
    cy.wait('@saveTopics');
    cy.contains('Preferences saved successfully').should('be.visible');
  });

  it('should show button in saving state while updating', () => {
    // Use a delayed response for the POST request
    cy.intercept('POST', `${API_URL}/user/${MOCK_USER_ID}/topics`, {
      statusCode: 200,
      body: { success: true },
      delay: 500
    }).as('slowSaveTopics');

    cy.contains('button', 'Save Preferences').click();
    cy.contains('button', 'Saving…').should('be.visible');
  });
});

describe('UserProfile Component (Viewing Other User)', () => {
  let mockStore;

  beforeEach(() => {
    const OTHER_USER_ID = '2';
    
    // Intercept API calls
    cy.intercept('GET', `${API_URL}/topics`, {
      statusCode: 200,
      body: MOCK_TOPICS
    }).as('getTopics');

    cy.intercept('GET', `${API_URL}/user/${OTHER_USER_ID}/topics`, {
      statusCode: 200,
      body: MOCK_USER_TOPICS
    }).as('getUserTopics');
    
    mockStore = configureStore({
      reducer: { user: userReducer },
      preloadedState: {
        user: {
          user: { id: MOCK_USER_ID, name: EXPECTED_MOCK_NAME }, // Current user is still MOCK_USER_ID
          isAuthenticated: true,
        },
      },
    });

    cy.mount(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={[`/profile/${OTHER_USER_ID}`]}>
          <Routes>
            <Route path="/profile/:userId" element={<UserProfile />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Wait for API calls to complete
    cy.wait(['@getTopics', '@getUserTopics']);
  });

  it('should display "User 2" when viewing other profile', () => {
    cy.contains('User 2').should('be.visible');
  });

  it('should display "Preferred Topics" when viewing other profile', () => {
    cy.contains('Preferred Topics').should('be.visible');
  });

  it('should show selected topics as tags for other user', () => {
    cy.contains('React Development').should('be.visible');
    cy.contains('UI/UX Design').should('be.visible');
    cy.contains('Node.js').should('not.exist');
  });

  it('should not show checkboxes or save button for other user', () => {
    cy.get('input[type="checkbox"]').should('not.exist');
    cy.contains('button', 'Save Preferences').should('not.exist');
  });

  
});
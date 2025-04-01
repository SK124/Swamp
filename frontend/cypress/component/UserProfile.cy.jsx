// cypress/component/UserProfile.cy.jsx

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../../src/store/userSlice'; 
import UserProfile from '../../src/pages/UserProfile';


const MOCK_USER_ID = '1'; 
const EXPECTED_MOCK_NAME = 'Arjun Kaliyath'; 
const EXPECTED_MOCK_EMAIL = 'kaliyatharjun@gmail.com'; 
const EXPECTED_FALLBACK = 'AW'; 
const EXPECTED_AVATAR_SRC = 'https://github.com/shadcn.png'; 
// --- End Mock Data ---


describe('UserProfile Component (Using Internal Mocks)', () => {
  let mockStore;

  beforeEach(() => {
    
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

    
    cy.wait(500); 
  });

  it('should display the user name from internal mock data', () => {
    cy.contains(EXPECTED_MOCK_NAME).should('be.visible');
  });

  it('should display the user email from internal mock data', () => {
    cy.contains(EXPECTED_MOCK_EMAIL).should('be.visible');
  });


  it('should display the "Your Topic Preferences" section (as it is own profile)', () => {
    cy.contains('Your Topic Preferences').should('be.visible');
    cy.contains('label', 'React Development').should('be.visible'); 
  });

  it('should have a "Save Preferences" button (as it is own profile)', () => {
    cy.contains('button', 'Save Preferences').should('be.visible');
  });

});
import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter } from 'react-router-dom'  
import userReducer from '../../src/store/userSlice'
import AuthPage from '../../src/pages/AuthPage'

describe('AuthPage Component', () => {
  let store;

  beforeEach(() => {
    //Creating a fresh store for each test
    store = configureStore({
      reducer: {
        user: userReducer
      }
    });


    // Mounting the component
    cy.mount(
      <Provider store={store}>
        <BrowserRouter>
          <AuthPage />
        </BrowserRouter>
      </Provider>
    );
  });


  it('should display login form by default', () => {
    cy.contains('Login to The Swamp').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
  });

  it('should switch to signup form when signup button is clicked', () => {
    cy.contains('button', 'Signup').click();
    cy.contains('Create Your Account').should('be.visible');
    cy.get('#fullName').should('be.visible');
  });

  it('should switch back to login form when login button is clicked', () => {
    // First switch to signup
    cy.contains('button', 'Signup').click();
    
    // Then switch back to login
    cy.contains('button', 'Login').click();
    cy.contains('Login to The Swamp').should('be.visible');
  });
});
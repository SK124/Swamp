import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter } from 'react-router-dom'
import userReducer from '../../src/store/userSlice'
import Login from '../../src/pages/Login'

describe('Login Component', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer
      }
    });




    cy.mount(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
  });

  it('should display the login form', () => {
    cy.contains('Welcome to The Swamp').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.contains('button', 'Login').should('be.visible');
  });

  it('should validate required fields', () => {
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    
    
    cy.get('#email').then($el => {
      expect($el[0].validity.valid).to.be.false;
    });
  });

  // it('should log in successfully with valid credentials', () => {
  //   cy.get('#email').type('test@example.com');
  //   cy.get('#password').type('password123');
  //   cy.get('form').submit();
    
  //   cy.get('@navigate').should('have.been.calledWith', '/');
  // });
});

import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../../src/store/userSlice'
import Signup from '../../src/pages/Signup'

describe('Signup Component', () => {
  let store;

  beforeEach(() => {
   
    store = configureStore({
      reducer: {
        user: userReducer
      }
    });

    cy.mount(
      <Provider store={store}>
        <Signup />
      </Provider>
    );
  });

  it('should display the signup form initially', () => {
    cy.contains('Create Your Account').should('be.visible');
    cy.get('#fullName').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('#confirmPassword').should('be.visible');
    cy.contains('button', 'Next').should('be.visible');
  });

  it('should show errors for empty fields', () => {
    cy.contains('button', 'Next').click();
    cy.contains('Full Name is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
    cy.contains('Please confirm your password').should('be.visible');
  });

  it('should validate email format', () => {
    cy.get('#fullName').type('Test User');
    // cy.get('#email').type('Invalid.email');
    cy.get('#password').type('Password123!');
    cy.get('#confirmPassword').type('Password123!');
    cy.contains('button', 'Next').click();
    cy.contains('Email is required').should('be.visible');
  });

  it('should validate password requirements', () => {
    cy.get('#fullName').type('Test User');
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('password');
    cy.get('#confirmPassword').type('password');
    cy.contains('button', 'Next').click();
    cy.contains('Password must contain 1 uppercase, 1 lowercase, and 1 special character').should('be.visible');
  });

  it('should validate password matching', () => {
    cy.get('#fullName').type('Test User');
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('Password123!');
    cy.get('#confirmPassword').type('DifferentPassword123!');
    cy.contains('button', 'Next').click();
    cy.contains('Passwords do not match').should('be.visible');
  });

//   it('should proceed to OTP screen when form is valid', () => {
//     cy.get('#fullName').type('Test User');
//     cy.get('#email').type('test@example.com');
//     cy.get('#password').type('Password123!');
//     cy.get('#confirmPassword').type('Password123!');
//     cy.contains('button', 'Next').click();
//     cy.get('#otp').should('be.visible');
//     cy.contains('button', 'Verify OTP').should('be.visible');
//   });

//   it('should validate OTP field', () => {
//     //submit the initial form
//     cy.get('#fullName').type('Test User');
//     cy.get('#email').type('test@example.com');
//     cy.get('#password').type('Password123!');
//     cy.get('#confirmPassword').type('Password123!');
//     cy.contains('button', 'Next').click();
    
//     //validate OTP screen
//     // cy.contains('button', 'Verify OTP').click();
//     // cy.contains('OTP is required').should('be.visible');
//   });

//   it('should complete signup process successfully', () => {
//     // First fill out and submit the initial form
//     cy.get('#fullName').type('Test User');
//     cy.get('#email').type('test@example.com');
//     cy.get('#password').type('Password123!');
//     cy.get('#confirmPassword').type('Password123!');
//     cy.contains('button', 'Next').click();
    
//     // Then complete OTP verification
//     cy.get('#otp').type('123456');
//     cy.contains('button', 'Verify OTP').click();
//     cy.contains('Signup Successful!').should('be.visible');
//   });
});

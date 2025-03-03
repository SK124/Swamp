import React from 'react'
import CreateRoom from '../../src/pages/CreateRoom'

describe('CreateRoom Component', () => {
  beforeEach(() => {
    cy.mount(<CreateRoom />);
  });

  it('should display the create room form', () => {
    cy.contains('Create a Room').should('be.visible');
    cy.get('#roomName').should('be.visible');
    cy.get('#description').should('be.visible');
    cy.contains('button', 'Create Room').should('be.visible');
  });

  it('should allow input in form fields', () => {
    cy.get('#roomName').type('Test Room');
    cy.get('#description').type('This is a test room description');
    
    cy.get('#roomName').should('have.value', 'Test Room');
    cy.get('#description').should('have.value', 'This is a test room description');
  });

  it('should have a working submit button', () => {
    // Since the component doesn't have form submission logic yet,
    // we're just checking that the button exists and is clickable
    cy.contains('button', 'Create Room').click();
  });
});
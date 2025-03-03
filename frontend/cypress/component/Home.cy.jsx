import React from 'react'
import Home from '../../src/pages/Home'

describe('Home Component', () => {
  beforeEach(() => {
    cy.mount(<Home />);
  });

  it('should display the explore rooms heading', () => {
    cy.contains('Explore Rooms').should('be.visible');
  });

  it('should display a room card', () => {
    cy.contains('🎯 Design Talk').should('be.visible');
    cy.contains('Join the conversation.').should('be.visible');
  });
});

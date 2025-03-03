import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../../src/components/Navbar'

describe('Navbar Component', () => {
  beforeEach(() => {
    cy.mount(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
  });

  it('should display the navbar title', () => {
    cy.contains('🎙️ The Swamp').should('be.visible');
  });

  it('should have a link to the home page', () => {
    cy.contains('🎙️ The Swamp').should('have.attr', 'href', '/');
  });

  it('should have a Create Room button', () => {
    cy.contains('Create Room').should('be.visible');
    cy.contains('Create Room').should('have.attr', 'href', '/create-room');
  });

  it('should display the avatar', () => {
    cy.get('img').should('have.attr', 'src', 'https://github.com/shadcn.png');
  });
});

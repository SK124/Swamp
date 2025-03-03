import React from 'react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Profile from '../../src/pages/Profile'

describe('Profile Component', () => {
  beforeEach(() => {
    // Mounting with MemoryRouter to provide the userId param
    cy.mount(
      <MemoryRouter initialEntries={['/profile/123']}>
        <Routes>
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
  });

  it('should display the profile heading', () => {
    cy.contains('User Profile').should('be.visible');
  });

  it('should display the avatar', () => {
    cy.get('img').should('have.attr', 'src', 'https://github.com/shadcn.png');
  });
});
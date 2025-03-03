import React from 'react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Room from '../../src/pages/Room'

describe('Room Component', () => {
  beforeEach(() => {
    // Mounting with MemoryRouter to provide the roomId param
    cy.mount(
      <MemoryRouter initialEntries={['/room/123']}>
        <Routes>
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </MemoryRouter>
    );
  });

  it('should display the room heading with ID', () => {
    cy.contains('Room #123').should('be.visible');
  });

  it('should have a leave room button', () => {
    cy.contains('Leave Room').should('be.visible');
  });

  it('should have a grid for participants', () => {
    cy.get('.grid-cols-4').should('exist');
  });
});
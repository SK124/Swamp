// cypress/component/SwampDetail.cy.jsx

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SwampDetail from '../../src/pages/SwampDetail';

// --- Mock Data ---
const MOCK_SWAMP_ID = 'simple-swamp-456';
const MOCK_SWAMP_DATA = { 
  ID: 567,
  Title: 'Cypress Test Swamp Detailed',
  OwnerID: 999,
  Topics: [1, 3],
  MaxParticipants: 15,
  StartTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(), 
  Duration: 45,

};
// --- End Mock Data ---


describe('SwampDetail Component (Intercepted)', () => {

  beforeEach(() => {
    //Intercept the API Call
    // Intercept the GET request the component makes
    cy.intercept('GET', `/api/swamp/${MOCK_SWAMP_ID}`, {
        statusCode: 200,
        body: MOCK_SWAMP_DATA 
    }).as('getSwamp'); 

    
    cy.mount(
      <MemoryRouter initialEntries={[`/swamp/${MOCK_SWAMP_ID}`]}>
        <Routes>
          <Route path="/swamp/:swampId" element={<SwampDetail />} />
        </Routes>
      </MemoryRouter>
    );
  });

  it('should display the swamp title after API call', () => {
    cy.wait('@getSwamp'); // Wait for the intercepted call to complete
    cy.contains(MOCK_SWAMP_DATA.Title).should('be.visible');
  });

   it('should display owner ID and duration', () => {
    cy.wait('@getSwamp');
    cy.contains(`Hosted by Owner ID: ${MOCK_SWAMP_DATA.OwnerID}`).should('be.visible');
    cy.contains(`Duration: ${MOCK_SWAMP_DATA.Duration} mins`).should('be.visible');
   });

  it('should display placeholder text for participants', () => {
    cy.wait('@getSwamp');
    cy.contains(`Participants (0 / ${MOCK_SWAMP_DATA.MaxParticipants})`).should('be.visible');
  });

  it('should display placeholder action buttons', () => {
    cy.wait('@getSwamp');
    cy.contains('button', 'Leave Swamp').should('be.visible');
    cy.contains('button', 'Join Swamp').should('be.visible');
    cy.contains('button', 'Go to Live Chat').should('be.visible');
  });
});
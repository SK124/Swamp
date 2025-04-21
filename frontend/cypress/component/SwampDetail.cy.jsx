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

describe('SwampDetail Component', () => {
  context('When loading data', () => {
    beforeEach(() => {
      // Intercept the API call with a delay to test loading state
      cy.intercept('GET', `http://localhost:8080/api/swamp/${MOCK_SWAMP_ID}`, {
        delay: 500,
        statusCode: 200,
        body: MOCK_SWAMP_DATA 
      }).as('getSwampDelayed');
      
      cy.mount(
        <MemoryRouter initialEntries={[`/swamp/${MOCK_SWAMP_ID}`]}>
          <Routes>
            <Route path="/swamp/:swampId" element={<SwampDetail />} />
          </Routes>
        </MemoryRouter>
      );
    });

    
  });

  context('With successful data fetch', () => {
    beforeEach(() => {
      // Intercept the API Call with correct base URL
      cy.intercept('GET', `http://localhost:8080/api/swamp/${MOCK_SWAMP_ID}`, {
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

      cy.wait('@getSwamp');
    });

    it('should display the swamp title after API call', () => {
      cy.contains(MOCK_SWAMP_DATA.Title).should('be.visible');
    });

    it('should display owner ID and duration', () => {
      cy.contains(`Hosted by Owner ID: ${MOCK_SWAMP_DATA.OwnerID}`).should('be.visible');
      cy.contains(`Duration: ${MOCK_SWAMP_DATA.Duration} mins`).should('be.visible');
    });

    it('should display formatted start time', () => {
      const formattedDate = new Date(MOCK_SWAMP_DATA.StartTime).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      cy.contains(`Starts: ${formattedDate}`).should('be.visible');
    });

    

    it('should display participants section', () => {
      cy.contains(`Participants (0 / ${MOCK_SWAMP_DATA.MaxParticipants})`).should('be.visible');
      cy.contains('Participant list:').should('be.visible');
    });

    it('should display the join button', () => {
      cy.contains('button', 'Join Swamp').should('be.visible');
    });

    
  });

  context('With API errors', () => {
    it('should handle 404 not found error', () => {
      cy.intercept('GET', `http://localhost:8080/api/swamp/${MOCK_SWAMP_ID}`, {
        statusCode: 404,
        body: { error: 'Swamp not found' }
      }).as('swampNotFound');
      
      cy.mount(
        <MemoryRouter initialEntries={[`/swamp/${MOCK_SWAMP_ID}`]}>
          <Routes>
            <Route path="/swamp/:swampId" element={<SwampDetail />} />
          </Routes>
        </MemoryRouter>
      );
      
      cy.wait('@swampNotFound');
      cy.contains('Error: Swamp not found').should('be.visible');
    });

    it('should handle general server errors', () => {
      cy.intercept('GET', `http://localhost:8080/api/swamp/${MOCK_SWAMP_ID}`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');
      
      cy.mount(
        <MemoryRouter initialEntries={[`/swamp/${MOCK_SWAMP_ID}`]}>
          <Routes>
            <Route path="/swamp/:swampId" element={<SwampDetail />} />
          </Routes>
        </MemoryRouter>
      );
      
      cy.wait('@serverError');
      cy.contains('Error: Internal server error').should('be.visible');
    });
  });

  context('With swamps having no topics', () => {
    beforeEach(() => {
      const noTopicsSwamp = {
        ...MOCK_SWAMP_DATA,
        Topics: []
      };
      
      cy.intercept('GET', `http://localhost:8080/api/swamp/${MOCK_SWAMP_ID}`, {
        statusCode: 200,
        body: noTopicsSwamp
      }).as('getSwampNoTopics');
      
      cy.mount(
        <MemoryRouter initialEntries={[`/swamp/${MOCK_SWAMP_ID}`]}>
          <Routes>
            <Route path="/swamp/:swampId" element={<SwampDetail />} />
          </Routes>
        </MemoryRouter>
      );
      
      cy.wait('@getSwampNoTopics');
    });

    
  });
});
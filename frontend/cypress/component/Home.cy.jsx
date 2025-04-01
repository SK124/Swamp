import React from 'react'
import Home from '../../src/pages/Home'

describe('Home Component', () => {
  beforeEach(() => {

    // Stub the fetch API to return mock data

    cy.intercept('GET', 'http://localhost:8080/api/swamp*', {
      statusCode: 200,
      body: {
        allDocuments: [
          {
            ID: '1',
            Title: 'Everglades Discussion',
            StartTime: '2025-03-31T14:30:00Z',
            Duration: 120,
            MaxParticipants: 10,
            Topics: [1, 2]
          },
          {
            ID: '2',
            Title: 'Wetland Conservation',
            StartTime: '2025-04-01T10:00:00Z',
            Duration: 90,
            MaxParticipants: 8,
            Topics: [3]
          }
        ],
        meta: {
          totalResults: 2
        }
      }
    }).as('getSwamps');
    
    cy.mount(<Home />);
    cy.wait('@getSwamps');
  });

  it('should display the explore swamps heading', () => {
    cy.contains('Explore Swamps').should('be.visible');
  });

  it('should display swamp cards with correct information', () => {
    cy.contains('Everglades Discussion').should('be.visible');
    cy.contains('Wetland Conservation').should('be.visible');
    
    // Test formatted time display
    const startDate = new Date('2025-03-31T14:30:00Z');
    cy.contains(startDate.toLocaleString()).should('be.visible');
    
    // Test duration formatting
    cy.contains('2h').should('be.visible');
    cy.contains('1h 30m').should('be.visible');
    
    // Test participants display
    cy.contains('0/10').should('be.visible');
    cy.contains('0/8').should('be.visible');
    
    // Test topics display
    cy.contains('Topic 1').should('be.visible');
    cy.contains('Topic 2').should('be.visible');
    cy.contains('Topic 3').should('be.visible');
  });

  it('should show loading state initially', () => {

    cy.mount(<Home />);
    cy.contains('Loading swamps...').should('be.visible');
  });

  it('should display error message when API fails', () => {
    cy.intercept('GET', 'http://localhost:8080/api/swamp*', {
      statusCode: 500,
      body: 'Server error'
    }).as('getSwampsError');
    
    cy.mount(<Home />);
    cy.wait('@getSwampsError');
    cy.contains('Error:').should('be.visible');
  });

  it('should display a message when no swamps are available', () => {
    cy.intercept('GET', 'http://localhost:8080/api/swamp*', {
      statusCode: 200,
      body: {
        allDocuments: [],
        meta: {
          totalResults: 0
        }
      }
    }).as('getEmptySwamps');
    
    cy.mount(<Home />);
    cy.wait('@getEmptySwamps');
    cy.contains('No Swamps Available').should('be.visible');
    cy.contains('There are currently no swamps to display.').should('be.visible');
  });

  it('should have functional scroll navigation', () => {
    cy.get('[aria-label="Scroll right"]').should('be.visible').click();
    cy.get('[aria-label="Scroll left"]').should('be.visible').click();
  });
});
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
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
    
    // Mount the component wrapped in BrowserRouter for Link component
    cy.mount(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    cy.wait('@getSwamps');
  });

  it('should display the explore swamps heading', () => {
    cy.contains('h1', 'Explore Swamps').should('be.visible');
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
    // Intercept but don't respond immediately to simulate loading
    cy.intercept('GET', 'http://localhost:8080/api/swamp*', (req) => {
      req.reply({
        delay: 1000,
        statusCode: 200,
        body: {
          allDocuments: [],
          meta: { totalResults: 0 }
        }
      });
    }).as('delayedSwamps');
    
    cy.mount(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    cy.contains('Loading swamps...').should('be.visible');
  });

  it('should display error message when API fails', () => {
    cy.intercept('GET', 'http://localhost:8080/api/swamp*', {
      statusCode: 500,
      body: 'Server error'
    }).as('getSwampsError');
    
    cy.mount(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
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
    
    cy.mount(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    cy.wait('@getEmptySwamps');
    cy.contains('No Swamps Available').should('be.visible');
    cy.contains('There are currently no swamps to display.').should('be.visible');
  });

  it('should have functional scroll navigation buttons', () => {
    // Spy on the scrollBy method
    const scrollBySpy = cy.spy().as('scrollBySpy');
    cy.window().then((win) => {
      cy.stub(win.HTMLElement.prototype, 'scrollBy').callsFake(scrollBySpy);
    });
    
    // Click scroll right button
    cy.get('[aria-label="Scroll right"]').should('be.visible').click();
    cy.get('@scrollBySpy').should('have.been.calledWith', { left: 340, behavior: 'smooth' });
    
    // Click scroll left button
    cy.get('[aria-label="Scroll left"]').should('be.visible').click();
    cy.get('@scrollBySpy').should('have.been.calledWith', { left: -340, behavior: 'smooth' });
  });

  it('should display total results count', () => {
    cy.contains('Showing 2 of 2 total results').should('be.visible');
  });

  it('should handle the formatting of time properly', () => {
    // Add a swamp with different time format
    cy.intercept('GET', 'http://localhost:8080/api/swamp*', {
      statusCode: 200,
      body: {
        allDocuments: [
          {
            ID: '3',
            Title: 'Midnight Swamp',
            StartTime: '2025-04-30T00:00:00Z',
            Duration: 30,
            MaxParticipants: 5,
            Topics: []
          }
        ],
        meta: {
          totalResults: 1
        }
      }
    }).as('getTimeSwamp');
    
    cy.mount(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    cy.wait('@getTimeSwamp');
    
    // Test formatted time display
    const midnightDate = new Date('2025-04-30T00:00:00Z');
    cy.contains(midnightDate.toLocaleString()).should('be.visible');
    
    // Test short duration formatting
    cy.contains('30 min').should('be.visible');
  });

  it('should handle swamps with no topics', () => {
    cy.intercept('GET', 'http://localhost:8080/api/swamp*', {
      statusCode: 200,
      body: {
        allDocuments: [
          {
            ID: '4',
            Title: 'Topicless Swamp',
            StartTime: '2025-05-01T12:00:00Z',
            Duration: 45,
            MaxParticipants: 15,
            Topics: []
          }
        ],
        meta: {
          totalResults: 1
        }
      }
    }).as('getNoTopicsSwamp');
    
    cy.mount(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    cy.wait('@getNoTopicsSwamp');
    
    // The card should be visible without topics
    cy.contains('Topicless Swamp').should('be.visible');
    // The topics section should not be visible
    cy.get('.bg-blue-100').should('not.exist');
  });
});
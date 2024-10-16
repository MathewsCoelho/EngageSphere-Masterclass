import '@testing-library/cypress/add-commands'
import '../../src/index.css'

Cypress.Commands.add('getByClassStartsWith', (classPart) => {
  cy.get(`[class^="${classPart}"]`);
});
import { mount } from 'cypress/react18';
import Greeting from '.';

const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const todayText = `${today.toLocaleDateString('en-US', options)}`;

describe('Greeting', () => {
  it('It renders the "Hi there" greeting when no name is provided', () => {
    mount(<Greeting />);

    cy.findByText(`Hi there! It is ${todayText}`).should('be.visible');
  });

  it('It renders the "Hi {name}" greeting when the name is provided', () => {
    mount(<Greeting name='Matheus' />);

    cy.findByText(`Hi Matheus! It is ${todayText}`).should('be.visible');
  });
});

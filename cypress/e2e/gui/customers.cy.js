const API_URL = Cypress.env('API_URL');
const CUSTOMERS_URL = `${API_URL}/customers`;

describe('Customers', () => {
  beforeEach(() => {
    cy.setCookie('cookieConsent', 'accepted');
    cy.visit('/');
  });

  context('View', () => {
    it('goes back to the customers list when clicking the "Back" button', () => {
      cy.contains('button', 'View').click();
      cy.contains('button', 'Back').click();

      cy.contains('p', 'Below is our customer list.').should('be.visible');
    });

    it('shows a Loading... fallback element before the initial customers fetch', () => {
      cy.intercept(
        'GET',
        `${CUSTOMERS_URL}?page=1&limit=10&size=All&industry=All`,
        (req) => {
          req.reply((res) => {
            res.setDelay(1000);
          });
        }
      ).as('getDelayedCustomers');

      cy.visit('/');
      cy.wait('@getDelayedCustomers');

      cy.contains('p', 'Loading...').should('be.visible');
    });

    context('Empty State', () => {
      beforeEach(() => {
        cy.intercept('GET', `${CUSTOMERS_URL}?page=1&limit=10&size=All&industry=All`, {
          fixture: 'customers/empty',
        }).as('getEmptyCustomers');

        cy.visit('/');
        cy.wait('@getEmptyCustomers');
      });

      it('shows the image of an empty box and the text "No customers available." when there are no customers in the database', () => {
        cy.get('svg[title="image of an empty box"]').should('be.visible');
        cy.contains('span', 'No customers available.').should('be.visible');
      });

      it('disables the name text input field when there are no customers in the database', () => {
        cy.get('#name').should('be.disabled');
      });
    });
  });

  context('Messenger Form', () => {
    it('shows and hides a success message when successfully submitting the messenger form', () => {
      const messengerData = {
        name: 'Matheus',
        email: 'matheus@gmail.com',
        message: 'Hello, I need help with something.',
      };

      cy.getByClassThatStartsWith('Messenger_openCloseButton').click();
      cy.get('#messenger-name').type(messengerData.name);
      cy.get('#email').type(messengerData.email);
      cy.get('#message').type(messengerData.message);
      cy.clock();
      cy.getByClassThatStartsWith('Messenger_sendButton').click();

      cy.getByClassThatStartsWith('Messenger_success')
        .should('be.visible')
        .and('have.text', 'Your message has been sent.');
      cy.tick(3000);
      cy.getByClassThatStartsWith('Messenger_success').should('not.exist');
    });
  });

  context('Filters', () => {
    it('keeps the filters when coming back from the customer details view', () => {
      const clientFilterData = {
        size: 'Small',
        industry: 'Technology',
      };

      cy.intercept(
        'GET',
        `${CUSTOMERS_URL}?page=1&limit=10&size=${clientFilterData.size}&industry=${clientFilterData.industry}`,
        { fixture: 'customers/smallTechnology' }
      ).as('getSmallTechnologyCustomers');

      cy.findByTestId('size-filter').select(clientFilterData.size);
      cy.findByTestId('industry-filter').select(clientFilterData.industry);
      cy.contains('button', 'View').click();

      cy.contains('button', 'Back').click();

      cy.findByTestId('size-filter').should('have.value', clientFilterData.size);
      cy.findByTestId('industry-filter').should('have.value', clientFilterData.industry);
    });

    it('persists the limit of items per page in the local storage when changing the limit', () => {
      cy.get('[name="pagination-limit"]').select('20');

      cy.window().then((win) => {
        expect(win.localStorage.getItem('paginationLimit')).to.eq('20');
      });
    });

    context('Filter by size', () => {
      it('filters the customers by small size', () => {
        cy.intercept('GET', `${CUSTOMERS_URL}?page=1&limit=10&size=Small&industry=All`, {
          fixture: 'customers/small',
        }).as('getSmallCustomers');

        cy.findByTestId('size-filter').select('Small');
        cy.wait('@getSmallCustomers');

        cy.get('tbody tr').should('have.length', 4);
      });

      it('filters the customers by medium size', () => {
        cy.intercept('GET', `${CUSTOMERS_URL}?page=1&limit=10&size=Medium&industry=All`, {
          fixture: 'customers/medium',
        }).as('getMediumCustomers');

        cy.findByTestId('size-filter').select('Medium');
        cy.wait('@getMediumCustomers');

        cy.get('tbody tr').should('have.length', 5);
      });

      it('filters the customers by enterprise size', () => {
        cy.intercept(
          'GET',
          `${CUSTOMERS_URL}?page=1&limit=10&size=Enterprise&industry=All`,
          {
            fixture: 'customers/enterprise',
          }
        ).as('getLargeCustomers');

        cy.findByTestId('size-filter').select('Enterprise');
        cy.wait('@getLargeCustomers');

        cy.get('tbody tr').should('have.length', 3);
      });

      it('filters the customers by large enterprise size', () => {
        cy.intercept(
          'GET',
          `${CUSTOMERS_URL}?page=1&limit=10&size=Large%20Enterprise&industry=All`,
          {
            fixture: 'customers/largeEnterprise',
          }
        ).as('getLargeEnterpriseCustomers');

        cy.findByTestId('size-filter').select('Large Enterprise');
        cy.wait('@getLargeEnterpriseCustomers');

        cy.get('tbody tr').should('have.length', 2);
      });

      it('filters the customers by very large enterprise size', () => {
        cy.intercept(
          'GET',
          `${CUSTOMERS_URL}?page=1&limit=10&size=Very%20Large%20Enterprise&industry=All`,
          {
            fixture: 'customers/veryLargeEnterprise',
          }
        ).as('getVeryLargeEnterpriseCustomers');

        cy.findByTestId('size-filter').select('Very Large Enterprise');
        cy.wait('@getVeryLargeEnterpriseCustomers');

        cy.get('tbody tr').should('have.length', 1);
      });

      it('filters the customers by all sizes', () => {
        cy.findByTestId('size-filter').select('Small');
        cy.intercept('GET', `${CUSTOMERS_URL}?page=1&limit=10&size=All&industry=All`, {
          fixture: 'customers/all',
        }).as('getAllCustomers');

        cy.findByTestId('size-filter').select('All');
        cy.wait('@getAllCustomers');

        cy.get('tbody tr').should('have.length', 9);
      });
    });

    context('Filter by industry', () => {
      it('filters the customers by logistics industry', () => {
        cy.intercept(
          'GET',
          `${CUSTOMERS_URL}?page=1&limit=10&size=All&industry=Logistics`,
          {
            fixture: 'customers/logistics',
          }
        ).as('getLogisticsCustomers');

        cy.findByTestId('industry-filter').select('Logistics');
        cy.wait('@getLogisticsCustomers');

        cy.get('tbody tr').should('have.length', 1);
      });

      it('filters the customers by retail industry', () => {
        cy.intercept('GET', `${CUSTOMERS_URL}?page=1&limit=10&size=All&industry=Retail`, {
          fixture: 'customers/retail',
        }).as('getRetailCustomers');

        cy.findByTestId('industry-filter').select('Retail');
        cy.wait('@getRetailCustomers');

        cy.get('tbody tr').should('have.length', 1);
      });

      it('filters the customers by technology industry', () => {
        cy.intercept(
          'GET',
          `${CUSTOMERS_URL}?page=1&limit=10&size=All&industry=Technology`,
          {
            fixture: 'customers/technology',
          }
        ).as('getTechnologyCustomers');

        cy.findByTestId('industry-filter').select('Technology');
        cy.wait('@getTechnologyCustomers');

        cy.get('tbody tr').should('have.length', 3);
      });

      it('filters the customers by HR industry', () => {
        cy.intercept('GET', `${CUSTOMERS_URL}?page=1&limit=10&size=All&industry=HR`, {
          fixture: 'customers/HR',
        }).as('getHRCustomers');

        cy.findByTestId('industry-filter').select('HR');
        cy.wait('@getHRCustomers');

        cy.get('tbody tr').should('have.length', 4);
      });

      it('filters the customers by finance industry', () => {
        cy.intercept(
          'GET',
          `${CUSTOMERS_URL}?page=1&limit=10&size=All&industry=Finance`,
          {
            fixture: 'customers/finance',
          }
        ).as('getFinanceCustomers');

        cy.findByTestId('industry-filter').select('Finance');
        cy.wait('@getFinanceCustomers');

        cy.get('tbody tr').should('have.length', 6);
      });

      it('filters the customers by all industries', () => {
        cy.findByTestId('industry-filter').select('Technology');
        cy.intercept('GET', `${CUSTOMERS_URL}?page=1&limit=10&size=All&industry=All`, {
          fixture: 'customers/all',
        }).as('getAllCustomers');

        cy.findByTestId('industry-filter').select('All');
        cy.wait('@getAllCustomers');

        cy.get('tbody tr').should('have.length', 9);
      });
    });
  });

  context('Details', () => {
    it('renders the contact details of a customer', () => {
      cy.intercept('GET', `${CUSTOMERS_URL}?page=1&limit=10&size=All&industry=All`, {
        fixture: 'customers/withAddress',
      }).as('getCustomerWithAddress');

      cy.visit('/');
      cy.wait('@getCustomerWithAddress');
      cy.contains('button', 'View').click();

      cy.fixture('customers/withAddress').then((customer) => {
        cy.contains('p', customer.customers[0].contactInfo.name).should('be.visible');
        cy.contains('p', customer.customers[0].contactInfo.email).should('be.visible');
        cy.contains('p', customer.customers[0].id).should('be.visible');
        cy.contains('p', customer.customers[0].employees).should('be.visible');
        cy.contains('p', customer.customers[0].size).should('be.visible');
        cy.contains('p', customer.customers[0].industry).should('be.visible');
      });
    });

    it('shows and hides the customer address', () => {
      cy.intercept('GET', `${CUSTOMERS_URL}?page=1&limit=10&size=All&industry=All`, {
        fixture: 'customers/withAddress',
      }).as('getCustomerWithAddress');

      cy.visit('/');
      cy.wait('@getCustomerWithAddress');
      cy.contains('button', 'View').click();

      cy.getByClassThatStartsWith('CustomerDetails_showAddressBtn').click();

      cy.contains('h3', 'Address').should('be.visible');
      cy.fixture('customers/withAddress').then((customer) => {
        cy.contains('p', customer.customers[0].address.street).should('be.visible');
        cy.contains('p', customer.customers[0].address.city).should('be.visible');
        cy.contains('p', customer.customers[0].address.state).should('be.visible');
        cy.contains('p', customer.customers[0].address.zipCode).should('be.visible');
        cy.contains('p', customer.customers[0].address.country).should('be.visible');
      });

      cy.getByClassThatStartsWith('CustomerDetails_hideAddressBtn').click();

      cy.contains('h3', 'Address').should('not.exist');
    });
  });

  context('CSV', () => {
    it('downloads a CSV file with the customers data', () => {
      cy.intercept('GET', `${CUSTOMERS_URL}?page=1&limit=10&size=All&industry=All`, {
        fixture: 'customers/all',
      }).as('getAllCustomers');

      cy.visit('/');
      cy.wait('@getAllCustomers');

      cy.contains('button', 'Download CSV').click();

      cy.readFile('cypress/downloads/customers.csv').then((csv) => {
        expect(csv).to.include(
          'ID,Company_Name,Number_of_Employees,Size,Industry,Contact_Name,Contact_Email,Street,City,State,Zip_Code,Country'
        );
        cy.fixture('customers/all').then((customers) => {
          customers.customers.forEach((customer) => {
            expect(csv).to.include(
              `"${customer.id}","${customer.name}","${customer.employees}","${customer.size}","${customer.industry}","${customer.contactInfo?.name || ''}","${customer.contactInfo?.email || ''}","${customer.address?.street || ''}","${customer.address?.city || ''}","${customer.address?.state || ''}","${customer.address?.zipCode || ''}","${customer.address?.country || ''}"`
            );
          });
        });
      });
    });
  });
});

describe('Cookies', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit('/');
  });

  it('accepts the cookie consent', () => {
    cy.contains('button', 'Accept').click();

    cy.getByClassThatStartsWith('CookieConsent_banner').should('not.exist');
    cy.getCookie('cookieConsent').should('have.property', 'value', 'accepted');
  });

  it('rejects the cookie consent', () => {
    cy.contains('button', 'Decline').click();

    cy.getByClassThatStartsWith('CookieConsent_banner').should('not.exist');
    cy.getCookie('cookieConsent').should('have.property', 'value', 'declined');
  });
});

describe('Accessibility', () => {
  beforeEach(() => {
    cy.setCookie('cookieConsent', 'accepted');
    cy.visit('/');
    cy.injectAxe();
  });

  context('Light Mode', () => {
    it('finds no a11y issues in light mode in the customer table', () => {
      cy.checkA11y();
    });

    it('finds no a11y issues in the customer details and address view', () => {
      cy.get('button').contains('View').click();
      cy.checkA11y();
    });

    it('finds no a11y issues in the messenger form', () => {
      cy.getByClassThatStartsWith('Messenger_openCloseButton').click();
      cy.checkA11y();
    });
  });

  context('Dark Mode', () => {
    beforeEach(() => {
      cy.getByClassThatStartsWith('ThemeToggle_button').click();
      cy.get('[data-theme="dark"]').should('exist');
    });

    it('finds no a11y issues in dark mode in the customer table', () => {
      cy.checkA11y();
    });

    it('It finds no a11y issues in dark mode in the customer details and address view', () => {
      cy.get('button').contains('View').click();
      cy.checkA11y();
    });

    it('finds no a11y issues in the messenger form', () => {
      cy.getByClassThatStartsWith('Messenger_openCloseButton').click();
      cy.checkA11y();
    });
  });
});

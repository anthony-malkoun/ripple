/* global cy, Cypress */

const { Given, When } = require('cypress-cucumber-preprocessor/steps')

Given(`I have logged into the backend`, () => {
  cy.visit(Cypress.env('CONTENT_API_SERVER'), {
    auth: {
      username: Cypress.env('CONTENT_API_AUTH_USER'),
      password: Cypress.env('CONTENT_API_AUTH_PASS')
    }
  })
  cy.get('[data-drupal-selector="edit-name"]')
    .type(Cypress.env('ADMIN_USERNAME'))

  cy.get('[data-drupal-selector="edit-pass"]')
    .type(Cypress.env('ADMIN_PASSWORD'))

  cy.get('[data-drupal-selector="edit-submit"]').click()
})

Given(`in the backend there is a page at {string} with {string} data`, (url, fixture) => {
  cy.request({
    url: `/api/v1/route?site=${Cypress.env('SITE_ID')}&path=${url}`,
    auth: {
      username: Cypress.env('CONTENT_API_AUTH_USER'),
      password: Cypress.env('CONTENT_API_AUTH_PASS')
    },
    failOnStatusCode: false
  }).then(routeResponse => {
    cy.log(routeResponse)
    if (routeResponse.status !== 200) {
      cy.visit(Cypress.env('CONTENT_API_SERVER') + 'admin/content/import_demo_content', {
        auth: {
          username: Cypress.env('CONTENT_API_AUTH_USER'),
          password: Cypress.env('CONTENT_API_AUTH_PASS')
        }
      })
      cy.fixture(fixture + '.yml').then(yaml => {
        cy.get('[data-drupal-selector="edit-import"]').invoke('val', yaml)
        cy.get('[data-drupal-selector="edit-submit"]').click()
      })
    }
  })
})

Given(`in the backend there are no {string} nodes`, (contentType) => {
  cy.request({
    url: `/api/v1/node/alert?site=${Cypress.env('SITE_ID')}`,
    auth: {
      username: Cypress.env('CONTENT_API_AUTH_USER'),
      password: Cypress.env('CONTENT_API_AUTH_PASS')
    },
    failOnStatusCode: false
  }).then(routeResponse => {
    cy.log(`Found ${routeResponse.body.meta.count} ${contentType} nodes`)
    if (routeResponse.status !== 200 || routeResponse.body.meta.count !== '0') {
      cy.log('Deleting alerts')
      cy.visit(Cypress.env('CONTENT_API_SERVER') + `/admin/content?title=&field_node_primary_site_target_id=${Cypress.env('SITE_ID')}&field_node_site_target_id=All&type=${contentType}&moderation_state=All&status=1`, {
        auth: {
          username: Cypress.env('CONTENT_API_AUTH_USER'),
          password: Cypress.env('CONTENT_API_AUTH_PASS')
        }
      })
      cy.get('.view-content .select-all [title="Select all rows in this table"]').click()
      cy.get('[data-drupal-selector="edit-node-bulk-form"] [data-drupal-selector="edit-action"]').select('node_delete_action')
      cy.get('#edit-submit--2').click()
      cy.url().should('include', '/admin/content/node/delete')
      cy.get('#edit-submit').click()
    }
  })
})

When(`in the BE I go to the current site taxonomy page`, () => {
  cy.visit(`${Cypress.env('CONTENT_API_SERVER')}/taxonomy/term/${Cypress.env('SITE_ID')}/edit`, {
    auth: {
      username: Cypress.env('CONTENT_API_AUTH_USER'),
      password: Cypress.env('CONTENT_API_AUTH_PASS')
    }
  })
})

When(`in the BE I check the {string} checkbox`, (label) => {
  cy.contains(label).click({ force: true })
})

When(`in the BE I click the {string} button`, (label) => {
  cy.get(`input[type="submit"][value="${label}"]`).click()
})

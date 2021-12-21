import { BasicAuthentication } from '@model/users';

export function getPages(auth: BasicAuthentication, apiId: string) {
  return cy.request({
    method: 'GET',
    url: `${Cypress.config().baseUrl}${Cypress.env('managementApi')}/apis/${apiId}/pages`,
    auth,
    failOnStatusCode: false,
    qs: {
      root: true,
    },
  });
}

import {BasicAuthentication} from "@model/users";

export function getCurrentUser(auth: BasicAuthentication) {
    return cy.request({
        method: 'GET',
        url: `${Cypress.config().baseUrl}${Cypress.env('managementApi')}/user`,
        auth,
        failOnStatusCode: false,
    });
}
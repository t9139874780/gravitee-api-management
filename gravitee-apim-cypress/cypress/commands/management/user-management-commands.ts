import {BasicAuthentication, ApiUser} from "@model/users";

export function getCurrentUser(auth: BasicAuthentication) {
    return cy.request({
        method: 'GET',
        url: `${Cypress.config().baseUrl}${Cypress.env('managementApi')}/user`,
        auth,
        failOnStatusCode: false,
    });
}

export function createUser(auth: BasicAuthentication, body: ApiUser) {
    return cy.request({
        method: 'POST',
        url: `${Cypress.config().baseUrl}${Cypress.env('managementApi')}/users`,
        body,
        auth,
        failOnStatusCode: false,
    });
}

export function deleteUser(auth: BasicAuthentication, userId: string) {
    return cy.request({
        method: 'DELETE',
        url: `${Cypress.config().baseUrl}${Cypress.env('managementApi')}/users/${userId}`,
        auth,
        failOnStatusCode: false,
    });
}
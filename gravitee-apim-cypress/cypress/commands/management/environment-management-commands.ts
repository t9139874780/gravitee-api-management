import {BasicAuthentication} from "@model/users";
import {Group} from "@model/groups";

export function createGroup(auth: BasicAuthentication, body: Group) {
    return cy.request({
        method: 'POST',
        url: `${Cypress.config().baseUrl}${Cypress.env('managementApi')}/configuration/groups`,
        auth,
        failOnStatusCode: false,
        body,
    });
}

export function getGroup(auth: BasicAuthentication, groupId: string) {
    return cy.request({
        method: 'GET',
        url: `${Cypress.config().baseUrl}${Cypress.env('managementApi')}/configuration/groups/${groupId}`,
        auth,
        failOnStatusCode: false,
    });
}

export function deleteGroup(auth: BasicAuthentication, groupId: string) {
    return cy.request({
        method: 'DELETE',
        url: `${Cypress.config().baseUrl}${Cypress.env('managementApi')}/configuration/groups/${groupId}`,
        auth,
        failOnStatusCode: false,
    });
}

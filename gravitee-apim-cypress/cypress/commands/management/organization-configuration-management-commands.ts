import {BasicAuthentication, ApiUser} from "@model/users";
import {Role} from "@model/roles";

export function createRole(auth: BasicAuthentication, body: Role) {
    return cy.request({
        method: 'POST',
        url: `${Cypress.config().baseUrl}${Cypress.env('managementOrganizationApi')}/configuration/rolescopes/API/roles`,
        body,
        auth,
        failOnStatusCode: false,
    });
}

export function deleteRole(auth: BasicAuthentication, roleId: string) {
    return cy.request({
        method: 'DELETE',
        url: `${Cypress.config().baseUrl}${Cypress.env('managementOrganizationApi')}/configuration/rolescopes/API/roles/${roleId}`,
        auth,
        failOnStatusCode: false,
    });
}
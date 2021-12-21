/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ADMIN_USER } from '../../../fixtures/fakers/users/users';
import {
  deleteApi,
  importCreateApi,
  importUpdateApi
} from '../../../commands/management/api-management-commands';
import {getPage} from "../../../commands/management/api-pages-management-commands";

context('API - Imports - Update', () => {

  describe('Update API which ID does not exist', function () {
    let apiId;

    it('should fail to update API, returning 404', function () {
      cy.fixture('json/imports/apis/api-empty-with-id').then((definition) => {
        importUpdateApi(ADMIN_USER, "unknown-test-id", definition)
          .notFound()
          .should((response) => {
            expect(response.body.message).to.eq('Api [unknown-test-id] can not be found.');
          });
      });
    });
  });

  describe('Update API with existing documentation page matching generated ID', function() {
    let apiId = '08a92f8c-e133-42ec-a92f-8ce13382ec73';
    let generatedPageId = 'c02077fc-7c4d-3c93-8404-6184a6221391';

    it('should create an API with one page of documentation and return specified API ID', function () {
      cy.fixture('json/imports/pages/api-with-page-with-id')
          .then((definition) => importCreateApi(ADMIN_USER, definition))
          .ok()
          .its('body')
          .should('have.property', 'id')
          .then((id) => {
            apiId = id;
          });
    });

    it('should update API page from specified ID', function () {
      cy.fixture('json/imports/pages/api-with-page-with-id-update')
          .then((definition) => importUpdateApi(ADMIN_USER, apiId, definition))
          .ok()
          .its('body')
          .should('have.property', 'id')
          .should('eq', apiId);
    });

    it('should get updated API page from generated page ID', function () {
      getPage(ADMIN_USER, apiId, generatedPageId)
          .ok()
          .its('body')
          .should(page => {
            expect(page.name).to.eq('Documentation (updated)');
            expect(page.content).to.eq("# Documentation\n##Contributing\nTo be done.");
          });
    });

    it('should delete the API', function() {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });
});

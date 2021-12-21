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
import { deleteApi, getPages, importCreateApi, getApiById } from '../../../commands/management/api-management-commands';

context('API - Imports', () => {
  describe('Create empty API without ID', function () {
    let apiId;

    it('should create API and return generated ID', function () {
      cy.fixture('json/imports/apis/api-empty-without-id').then((definition) => {
        importCreateApi(ADMIN_USER, definition)
          .ok()
          .should((response) => {
            apiId = response.body.id;
            expect(apiId).to.not.be.null;
          });
      });
    });

    it('should get created API with generated ID', function () {
      getApiById(ADMIN_USER, apiId)
        .ok()
        .should((response) => {
          expect(response.body.id).to.eq(apiId);
        });
    });

    it('should delete created API', function () {
      deleteApi(ADMIN_USER, apiId).httpStatus(204);
    });
  });

  describe('Create empty API with specified ID', function () {
    let apiId;

    it('should create API and return the specified ID', function () {
      cy.fixture('json/imports/apis/api-empty-with-id').then((definition) => {
        importCreateApi(ADMIN_USER, definition)
          .ok()
          .should((response) => {
            apiId = response.body.id;
            expect(apiId).to.eq('67d8020e-b0b3-47d8-9802-0eb0b357d84c');
          });
      });
    });

    it('should get created API with the specified ID', function () {
      getApiById(ADMIN_USER, apiId)
        .ok()
        .should((response) => {
          expect(response.body.id).to.eq(apiId);
        });
    });

    it('should delete created API', function () {
      deleteApi(ADMIN_USER, apiId).httpStatus(204);
    });
  });

  describe('Create API with documentation pages', function () {
    let apiId;

    it('should create API from import definition', function () {
      cy.fixture('json/imports/pages/api-with-documentation')
        .then((definition) => importCreateApi(ADMIN_USER, definition))
        .ok()
        .its('body')
        .should('have.property', 'id')
        .then((id) => {
          apiId = id;
        });
    });

    it('should get API documentation pages from generated ID', function () {
      getPages(ADMIN_USER, apiId)
        .ok()
        .its('body')
        .should('have.length', 2)
        .should((pages) => {
          expect(pages.length).to.eq(2);
          expect(pages[0].order).to.eq(0);
          expect(pages[0].type).to.eq('SYSTEM_FOLDER');
          expect(pages[1].order).to.eq(1);
          expect(pages[1].type).to.eq('MARKDOWN');
          expect(pages[1].name).to.eq('Documentation');
          expect(pages[1].content).to.eq('# Documentation');
          expect(pages[1].published).to.be.true;
          expect(pages[1].homepage).to.be.true;
        });
    });

    it('should delete the API', function () {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });
});

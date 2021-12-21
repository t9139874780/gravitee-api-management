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
import { deleteApi, importCreateApi, getApiById } from '../../../commands/management/api-management-commands';
import { getPages, getPage } from '../../../commands/management/api-pages-management-commands';

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

  describe('Create API with one page without an ID', function () {
    let apiId, pageId;

    it('should create API and return generated API ID', function () {
      cy.fixture('json/imports/pages/api-with-page-without-id')
        .then((definition) => importCreateApi(ADMIN_USER, definition))
        .ok()
        .its('body')
        .should('have.property', 'id')
        .then((id) => {
          apiId = id;
        });
    });

    it('should get API documentation pages from generated API ID', function () {
      getPages(ADMIN_USER, apiId)
        .ok()
        .its('body')
        .should('have.length', 2)
        .its(1)
        .should('have.property', 'id')
        .then((id) => {
          pageId = id;
        });
    });

    it('should get page from generated page ID', function () {
      getPage(ADMIN_USER, apiId, pageId)
        .ok()
        .its('body')
        .should((page) => {
          expect(page.order).to.eq(1);
          expect(page.type).to.eq('MARKDOWN');
          expect(page.name).to.eq('Documentation');
          expect(page.content).to.eq('# Documentation');
          expect(page.published).to.be.true;
          expect(page.homepage).to.be.true;
        });
    });

    it('should delete the API', function () {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe('Create API with one page without an ID', function () {
    let apiId = '08a92f8c-e133-42ec-a92f-8ce13382ec73';
    let expectedPageId = 'c02077fc-7c4d-3c93-8404-6184a6221391';

    it('should create API and return specified ID', function () {
      cy.fixture('json/imports/pages/api-with-page-with-id')
        .then((definition) => importCreateApi(ADMIN_USER, definition))
        .ok()
        .its('body')
        .should('have.property', 'id')
        .should('eq', apiId);
    });

    it('should get API documentation pages from specified API ID', function () {
      getPages(ADMIN_USER, apiId)
          .ok()
          .its('body')
          .should('have.length', 2)
          .its(1)
          .should('have.property', 'id')
          .should('eq', expectedPageId);
    });

    it('should get API page from specified IDs', function () {
      getPage(ADMIN_USER, apiId, expectedPageId)
          .ok()
          .its('body')
          .should('have.property', 'api')
          .should('eq', apiId);
    });

    it('should delete the API', function () {
      deleteApi(ADMIN_USER, '08a92f8c-e133-42ec-a92f-8ce13382ec73').noContent();
    });
  });
});

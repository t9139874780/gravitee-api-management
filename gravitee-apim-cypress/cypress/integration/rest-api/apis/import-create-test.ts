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
import { ApiImportFakers } from '../../../fixtures/fakers/api-imports';
import { ApiFakers } from '../../../fixtures/fakers/apis';

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

  describe('Create empty API with specified ID, not yet existing', function () {
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

  describe('Create empty API with specified ID, already existing', function () {
    let apiId;

    it('should create API with the specified ID', function () {
      cy.fixture('json/imports/apis/api-empty-with-id').then((definition) => {
        importCreateApi(ADMIN_USER, definition)
          .ok()
          .should((response) => {
            apiId = response.body.id;
          });
      });
    });

    it('should fail to create API with the same ID', function () {
      cy.fixture('json/imports/apis/api-empty-with-same-id-another-context-path').then((definition) => {
        importCreateApi(ADMIN_USER, definition)
          .badRequest()
          .should((response) => {
            expect(response.body.message).to.eq('An api [67d8020e-b0b3-47d8-9802-0eb0b357d84c] already exists.');
          });
      });
    });

    it('should delete created API', function () {
      deleteApi(ADMIN_USER, apiId).httpStatus(204);
    });
  });

  describe('Create empty API with an already existing context path', function () {
    let apiId;

    it('should create API with the specified ID', function () {
      cy.fixture('json/imports/apis/api-empty-with-id').then((definition) => {
        importCreateApi(ADMIN_USER, definition)
          .ok()
          .should((response) => {
            apiId = response.body.id;
          });
      });
    });

    it('should fail to create API with the same context path', function () {
      cy.fixture('json/imports/apis/api-empty-with-same-context-path-another-id').then((definition) => {
        importCreateApi(ADMIN_USER, definition)
          .badRequest()
          .should((response) => {
            expect(response.body.message).to.eq('The path [/testimport/] is already covered by an other API.');
          });
      });
    });

    it('should delete created API', function () {
      deleteApi(ADMIN_USER, apiId).httpStatus(204);
    });
  });

  describe('Create API with one page without an ID', function () {
    const api = ApiImportFakers.api({ pages: [ApiImportFakers.page()] });

    let apiId, pageId;

    it('should create an API with one page of documentation and return a generated API ID', function () {
      importCreateApi(ADMIN_USER, api)
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
          expect(page.name).to.not.be.empty;
          expect(page.content).to.not.be.empty;
          expect(page.published).to.be.false;
          expect(page.homepage).to.be.false;
        });
    });

    it('should delete the API', function () {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe('Create API with one page with an ID', function () {
    const apiId = '08a92f8c-e133-42ec-a92f-8ce13382ec73';
    const pageId = '7b95cbe6-099d-4b06-95cb-e6099d7b0609';
    const generatedPageId = 'c02077fc-7c4d-3c93-8404-6184a6221391';

    const page = ApiImportFakers.page({ id: pageId });
    const api = ApiImportFakers.api({ id: apiId, pages: [page] });

    it('should create an API with one page of documentation and return specified ID', function () {
      importCreateApi(ADMIN_USER, api).ok().its('body').should('have.property', 'id').should('eq', apiId);
    });

    it('should get API documentation pages from specified API ID', function () {
      getPages(ADMIN_USER, apiId)
        .ok()
        .its('body')
        .should('have.length', 2)
        .its(1)
        .should('have.property', 'id')
        .should('eq', generatedPageId);
    });

    it('should get API page from generated page ID', function () {
      getPage(ADMIN_USER, apiId, generatedPageId).ok().its('body').should('have.property', 'api').should('eq', apiId);
    });

    it('should delete the API', function () {
      deleteApi(ADMIN_USER, '08a92f8c-e133-42ec-a92f-8ce13382ec73').noContent();
    });
  });
});

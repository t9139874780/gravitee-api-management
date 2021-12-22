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
  getApiById,
  getApiMetadata,
  importCreateApi,
  importUpdateApi
} from '../../../commands/management/api-management-commands';
import { getPage, getPages } from '../../../commands/management/api-pages-management-commands';
import { ApiImportFakers } from '../../../fixtures/fakers/api-imports';
import {ApiMetadataFormat, ApiVisibility} from '@model/apis';

context('API - Imports - Update', () => {
  describe('Update API which ID in URL does not exist', () => {
    const api = ApiImportFakers.api({ id: 'unknown-test-id' });

    it('should fail to update API, returning 404', () => {
      importUpdateApi(ADMIN_USER, 'unknown-test-id', api)
        .notFound()
        .should((response) => {
          expect(response.body.message).to.eq('Api [unknown-test-id] can not be found.');
        });
    });
  });

  describe('Update API with existing documentation page matching generated ID', () => {
    const apiId = '08a92f8c-e133-42ec-a92f-8ce13382ec73';
    const pageId = '7b95cbe6-099d-4b06-95cb-e6099d7b0609';
    const generatedPageId = 'c02077fc-7c4d-3c93-8404-6184a6221391';

    const fakeApi = ApiImportFakers.api({ id: apiId });
    const fakePage = ApiImportFakers.page({ id: pageId });

    fakeApi.pages = [fakePage];

    const apiUpdate = ApiImportFakers.api(fakeApi);
    const pageUpdate = ApiImportFakers.page(fakePage);

    pageUpdate.name = 'Documentation (updated)';
    pageUpdate.content = '# Documentation\n## Contributing\nTo be done.';
    apiUpdate.pages = [pageUpdate];

    it('should create an API with one page of documentation and return specified API ID', () => {
      importCreateApi(ADMIN_USER, fakeApi).ok().its('body').should('have.property', 'id').should('eq', apiId);
    });

    it('should update API page from specified ID', () => {
      importUpdateApi(ADMIN_USER, apiId, apiUpdate).ok().its('body').should('have.property', 'id').should('eq', apiId);
    });

    it('should get updated API page from generated page ID', () => {
      getPage(ADMIN_USER, apiId, generatedPageId)
        .ok()
        .its('body')
        .should((page) => {
          expect(page.name).to.eq('Documentation (updated)');
          expect(page.content).to.eq('# Documentation\n## Contributing\nTo be done.');
        });
    });

    it('should delete the API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe('Update API which ID in URL exists, without ID in body', () => {
    const apiId = '67d8020e-b0b3-47d8-9802-0eb0b357d84c';
    const fakeCreateApi = ApiImportFakers.api({ id: apiId });

    // update API data. body doesn't contains API id
    const fakeUpdateApi = ApiImportFakers.api({
      name: 'updatedName',
      version: '1.1',
      description: 'Updated API description',
      visibility: ApiVisibility.PUBLIC,
    });
    fakeUpdateApi.proxy.virtual_hosts[0].path = '/updated/path';

    it('should create API with the specified ID', () => {
      importCreateApi(ADMIN_USER, fakeCreateApi)
        .ok()
        .should((response) => {
          expect(response.body.id).to.eq(apiId);
        });
    });

    it('should update the API with the specified ID, even if no ID in body', () => {
      importUpdateApi(ADMIN_USER, apiId, fakeUpdateApi)
        .ok()
        .should((response) => {
          expect(response.body.id).to.eq(apiId);
        });
    });

    it('should get updated API with updated data', () => {
      getApiById(ADMIN_USER, apiId)
        .ok()
        .should((response) => {
          expect(response.body.id).to.eq(apiId);
          expect(response.body.name).to.eq('updatedName');
          expect(response.body.version).to.eq('1.1');
          expect(response.body.description).to.eq('Updated API description');
          expect(response.body.visibility).to.eq('PUBLIC');
          expect(response.body.proxy.virtual_hosts[0].path).to.eq('/updated/path');
        });
    });

    it('should delete created API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe('Update API which ID in URL exists, with another API ID in body', () => {
    const apiId1 = '67d8020e-b0b3-47d8-9802-0eb0b357d84c';
    const fakeCreateApi1 = ApiImportFakers.api({ id: apiId1, name: 'originalName' });

    const apiId2 = '67d8020e-b0b3-47d8-9802-0eb0b357d899';
    const fakeCreateApi2 = ApiImportFakers.api({ id: apiId2, name: 'originalName' });

    // that will update api2, with api1 id in body
    const fakeUpdateApi = ApiImportFakers.api({ id: apiId1, name: 'updatedName' });

    it('should create API 1', () => {
      importCreateApi(ADMIN_USER, fakeCreateApi1).ok();
    });

    it('should create API 2', () => {
      importCreateApi(ADMIN_USER, fakeCreateApi2).ok();
    });

    it('should update API 2, event if api1 id in body', () => {
      importUpdateApi(ADMIN_USER, apiId2, fakeUpdateApi)
        .ok()
        .should((response) => {
          expect(response.body.id).to.eq(apiId2);
        });
    });

    it('should get API1 with unchanged data', () => {
      getApiById(ADMIN_USER, apiId1)
        .ok()
        .should((response) => {
          expect(response.body.name).to.eq('originalName');
        });
    });

    it('should get API2 with updated data', () => {
      getApiById(ADMIN_USER, apiId2)
        .ok()
        .should((response) => {
          expect(response.body.name).to.eq('updatedName');
        });
    });

    it('should delete created API 1', () => {
      deleteApi(ADMIN_USER, apiId1).httpStatus(204);
    });

    it('should delete created API 2', () => {
      deleteApi(ADMIN_USER, apiId2).httpStatus(204);
    });
  });

  describe('Update API with an updated context path matching another API context path', () => {
    const apiId1 = '67d8020e-b0b3-47d8-9802-0eb0b357d84c';
    const fakeCreateApi1 = ApiImportFakers.api({ id: apiId1 });
    fakeCreateApi1.proxy.virtual_hosts[0].path = '/importTest1';

    const apiId2 = '67d8020e-b0b3-47d8-9802-0eb0b357d899';
    const fakeCreateApi2 = ApiImportFakers.api({ id: apiId2 });
    fakeCreateApi2.proxy.virtual_hosts[0].path = '/importTest2';

    // that will try to update api2, with the same context path as api1
    const fakeUpdateApi = ApiImportFakers.api();
    fakeUpdateApi.proxy.virtual_hosts[0].path = '/importTest1';

    it('should create API 1', () => {
      importCreateApi(ADMIN_USER, fakeCreateApi1).ok();
    });

    it('should create API 2', () => {
      importCreateApi(ADMIN_USER, fakeCreateApi2).ok();
    });

    it('should fail to update API 2 with same context path as API 1', () => {
      importUpdateApi(ADMIN_USER, apiId2, fakeUpdateApi)
        .badRequest()
        .should((response) => {
          expect(response.body.message).to.eq('The path [/importTest1/] is already covered by an other API.');
        });
    });

    it('should delete created API 1', () => {
      deleteApi(ADMIN_USER, apiId1).httpStatus(204);
    });

    it('should delete created API 2', () => {
      deleteApi(ADMIN_USER, apiId2).httpStatus(204);
    });
  });

  describe('Update API with page without ID, with name not corresponding to an existing page', () => {
    const apiId = 'f5cc6ea7-1ea1-46dd-a48f-34a0386467b4';
    const fakeApi = ApiImportFakers.api({ id: apiId });
    const pageName = 'documentation';
    const fakePage = ApiImportFakers.page({ name: pageName });

    it('should create an API with no documentation page', () => {
      importCreateApi(ADMIN_USER, fakeApi).ok();
    });

    it('should update the API, adding one documentation page with an name and without an ID', () => {
      cy.wrap(fakePage).should('not.have.a.property', 'id');
      const apiUpdate = ApiImportFakers.api(fakeApi);
      apiUpdate.pages.push(ApiImportFakers.page(fakePage));
      importUpdateApi(ADMIN_USER, apiId, apiUpdate).ok();
    });

    it('should have created the page', () => {
      getPages(ADMIN_USER, apiId).ok().its('body').should('have.length', 2).its(1).should('have.property', 'name').should('eq', pageName);
    });

    it('should delete the API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe('Update API with page without ID, with name corresponding to one only existing page', () => {
    const apiId = '7f996cc8-27a7-489a-af67-e3b56ec5debb';
    const fakeApi = ApiImportFakers.api({ id: apiId });

    const pageName = 'documentation';

    const fakePage = ApiImportFakers.page({
      name: pageName,
      content: 'Not much to look at\n',
    });

    fakeApi.pages.push(fakePage);

    it('should create an API with one page of documentation', () => {
      importCreateApi(ADMIN_USER, fakeApi).ok();
    });

    it('should get API documentation page content', () => {
      getPages(ADMIN_USER, apiId)
        .ok()
        .its('body')
        .should('have.length', 2)
        .its(1)
        .should('have.property', 'content')
        .should('eq', 'Not much to look at\n');
    });

    it('should update API documentation page content from name', () => {
      const pageUpdate = ApiImportFakers.page(fakePage);
      pageUpdate.content = '# API\n';

      const apiUpdate = ApiImportFakers.api(fakeApi);
      apiUpdate.pages.push(pageUpdate);

      cy.wrap(pageUpdate).should('not.have.a.property', 'id');

      importUpdateApi(ADMIN_USER, apiId, apiUpdate).ok();
    });

    it('should have updated API documentation page content from name', () => {
      getPages(ADMIN_USER, apiId)
        .ok()
        .its('body')
        .should('have.length', 2)
        .its(1)
        .should('have.property', 'content')
        .should('eq', '# API\n');
    });

    it('should delete the API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe('Update API with page without ID, with name corresponding to multiple existing page', () => {
    const apiId = '283fea9a-563c-494b-b8f3-2883d876765e';
    const fakeApi = ApiImportFakers.api({ id: apiId });
    const pageName = 'A Conflicting Name';

    fakeApi.pages.push(ApiImportFakers.page({ name: pageName }));
    fakeApi.pages.push(ApiImportFakers.page({ name: pageName }));

    it('should create an API with two pages of documentation having the same name', () => {
      importCreateApi(ADMIN_USER, fakeApi).ok();
    });

    it('should get three pages of documentation', () => {
      getPages(ADMIN_USER, apiId).ok().its('body').should('have.length', 3);
    });

    it('should fail when trying to add a page with a conflicting name and without an ID', () => {
      const pageUpdate = ApiImportFakers.page({ name: pageName });
      const apiUpdate = ApiImportFakers.api(fakeApi);
      apiUpdate.pages.push(pageUpdate);
      cy.wrap(pageUpdate).should('not.have.a.property', 'id');

      importUpdateApi(ADMIN_USER, apiId, apiUpdate)
        .httpStatus(500)
        .its('body')
        .should('have.property', 'message')
        .should('eq', 'Not able to identify the page to update: A Conflicting Name. Too much pages with the same name');
    });

    it('should delete the API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe.skip('Update API removing pages', () => {
    const apiId = '8fc829e8-b713-469f-8db5-06c702b82eb1';
    const fakeApi = ApiImportFakers.api({ id: apiId });
    fakeApi.pages.push(ApiImportFakers.page(), ApiImportFakers.page());

    it('should create an API with two pages of documentation', () => {
      importCreateApi(ADMIN_USER, fakeApi).ok();
    });

    it('should update the API, removing its pages', () => {
      const apiUpdate = ApiImportFakers.api(fakeApi);
      apiUpdate.pages = [];
      importUpdateApi(ADMIN_USER, apiId, apiUpdate).ok();
    });

    it('should not have deleted pages', () => {
      getPages(ADMIN_USER, apiId).ok().its('body').should('have.length', 3);
    });

    it('should delete the API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe('Update API with some metadata having key that already exists', () => {
    const apiId = 'aa7f03dc-4ccf-434b-80b2-e5af22b0c76a';

    const fakeApi = ApiImportFakers.api({
      id: apiId,
      metadata: [{
        key: 'team',
        name: 'team',
        format: ApiMetadataFormat.STRING,
        value: 'Ops',
      }]
    });

    it('should create an API with some metadata having a key with value "team"', () => {
      importCreateApi(ADMIN_USER, fakeApi).ok();
    });

    it('should get the API metadata', () => {
      getApiMetadata(ADMIN_USER, apiId).ok().its('body').its(0).should('deep.equal', {
        key: 'team',
        name: 'team',
        format: ApiMetadataFormat.STRING,
        value: 'Ops',
        apiId: 'aa7f03dc-4ccf-434b-80b2-e5af22b0c76a',
      });
    });

    it ('should update the API metadata having the key "team"', () => {
      const apiUpdate = ApiImportFakers.api(fakeApi);
      apiUpdate.metadata = [{
        key: 'team',
        name: 'team',
        format: ApiMetadataFormat.STRING,
        value: 'DevOps',
      }];

      importUpdateApi(ADMIN_USER, apiId, fakeApi).ok();
    });

    it('should get the updated API metadata', () => {
      getApiMetadata(ADMIN_USER, apiId).ok().its('body').should('have.length', 2).its(0).should('deep.equal', {
        key: 'team',
        name: 'team',
        format: ApiMetadataFormat.STRING,
        value: 'DevOps',
        apiId: 'aa7f03dc-4ccf-434b-80b2-e5af22b0c76a',
      });
    });

    it ('should delete the API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });
});

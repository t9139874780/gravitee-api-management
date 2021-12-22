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
import {ADMIN_USER} from '../../../fixtures/fakers/users/users';
import {
  deleteApi,
  getApiById,
  importCreateApi,
  importUpdateApi
} from '../../../commands/management/api-management-commands';
import {getPage} from '../../../commands/management/api-pages-management-commands';
import {ApiImportFakers} from '../../../fixtures/fakers/api-imports';
import {ApiVisibility} from "@model/apis";

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

    pageUpdate.name = 'Documentation (updated)'
    pageUpdate.content = '# Documentation\n## Contributing\nTo be done.'
    apiUpdate.pages = [pageUpdate];

    it('should create an API with one page of documentation and return specified API ID', () => {
      importCreateApi(ADMIN_USER, fakeApi).ok().its('body').should('have.property', 'id').should('eq', apiId);
    });

    it('should update API page from specified ID', () => {
      importUpdateApi(ADMIN_USER, apiId, apiUpdate)
        .ok()
        .its('body')
        .should('have.property', 'id')
        .should('eq', apiId);
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
    const fakeUpdateApi = ApiImportFakers.api(
        {
          name: 'updatedName',
          version: '1.1',
          description: 'Updated API description',
          visibility: ApiVisibility.PUBLIC,
        }
    );
    fakeUpdateApi.proxy.virtual_hosts[0].path = "/updated/path";

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
      deleteApi(ADMIN_USER, apiId).httpStatus(204);
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
      fakeCreateApi1.proxy.virtual_hosts[0].path = "/importTest1";

      const apiId2 = '67d8020e-b0b3-47d8-9802-0eb0b357d899';
      const fakeCreateApi2 = ApiImportFakers.api({ id: apiId2 });
      fakeCreateApi2.proxy.virtual_hosts[0].path = "/importTest2";

      // that will try to update api2, with the same context path as api1
      const fakeUpdateApi = ApiImportFakers.api();
      fakeUpdateApi.proxy.virtual_hosts[0].path = "/importTest1";

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
                  expect(response.body.message).to.eq("The path [/importTest1/] is already covered by an other API.");
              });
      });

      it('should delete created API 1', () => {
          deleteApi(ADMIN_USER, apiId1).httpStatus(204);
      });

      it('should delete created API 2', () => {
          deleteApi(ADMIN_USER, apiId2).httpStatus(204);
      });
  });
});

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
import { deleteApi, importCreateApi, importUpdateApi } from '../../../commands/management/api-management-commands';
import { getPage } from '../../../commands/management/api-pages-management-commands';
import { ApiImportFakers } from '../../../fixtures/fakers/api-imports';
import {fake} from "faker";

context('API - Imports - Update', () => {
  describe('Update API which ID does not exist', function () {
    const api = ApiImportFakers.api({ id: 'unknown-test-id' });

    it('should fail to update API, returning 404', function () {
      importUpdateApi(ADMIN_USER, 'unknown-test-id', api)
        .notFound()
        .should((response) => {
          expect(response.body.message).to.eq('Api [unknown-test-id] can not be found.');
        });
    });
  });

  describe('Update API with existing documentation page matching generated ID', function () {
    const apiId = '08a92f8c-e133-42ec-a92f-8ce13382ec73';
    const pageId = '7b95cbe6-099d-4b06-95cb-e6099d7b0609';
    const generatedPageId = 'c02077fc-7c4d-3c93-8404-6184a6221391';

    const fakeApi = ApiImportFakers.api({ id: apiId });
    const fakePage = ApiImportFakers.page({ id: pageId });
    fakeApi.pages = [fakePage];

    const apiUpdate = ApiImportFakers.api(fakeApi);
    const pageUpdate = ApiImportFakers.page({
      ...fakePage,
      ...{
        name: 'Documentation (updated)',
        content: '# Documentation\n##Contributing\nTo be done.',
      }
    });

    apiUpdate.pages = [pageUpdate];

    it('should create an API with one page of documentation and return specified API ID', function () {
      importCreateApi(ADMIN_USER, fakeApi).ok().its('body').should('have.property', 'id').should('eq', apiId);
    });

    it('should update API page from specified ID', function () {
      importUpdateApi(ADMIN_USER, apiId, apiUpdate)
        .ok()
        .its('body')
        .should('have.property', 'id')
        .should('eq', apiId);
    });

    it('should get updated API page from generated page ID', function () {
      getPage(ADMIN_USER, apiId, generatedPageId)
        .ok()
        .its('body')
        .should((page) => {
          expect(page.name).to.eq('Documentation (updated)');
          expect(page.content).to.eq('# Documentation\n##Contributing\nTo be done.');
        });
    });

    it('should delete the API', function () {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });
});

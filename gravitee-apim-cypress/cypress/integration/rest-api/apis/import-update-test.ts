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
import { deleteApi, getApiById, importCreateApi, importUpdateApi } from '../../../commands/management/api-management-commands';

context('API - Imports - Update', () => {
  describe('Update API which ID in URL does not exist', function () {
    it('should fail to update API, returning 404', function () {
      cy.fixture('json/imports/apis/api-empty-with-id').then((definition) => {
        importUpdateApi(ADMIN_USER, 'unknown-test-id', definition)
          .notFound()
          .should((response) => {
            expect(response.body.message).to.eq('Api [unknown-test-id] can not be found.');
          });
      });
    });
  });

  describe('Update API which ID in URL exists, without ID in body', function () {
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

    it('should update the API with the specified ID, even if no ID in body', function () {
      cy.fixture('json/imports/apis/api-empty-without-id-updated-data').then((definition) => {
        importUpdateApi(ADMIN_USER, apiId, definition)
          .ok()
          .should((response) => {
            expect(response.body.id).to.eq(apiId);
          });
      });
    });

    it('should get updated API with updated data', function () {
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

    it('should delete created API', function () {
      deleteApi(ADMIN_USER, apiId).httpStatus(204);
    });
  });

  describe('Update API which ID in URL exists, with another API ID in body', function () {
    // TODO
  });

  describe('Update API with an updated context path matching another API context path', function () {
    // TODO
  });
});

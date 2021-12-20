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
import { deleteApi, getPages, importCreateApi } from '../../../commands/management/api-management-commands';

context.only('API - Imports', () => {
  describe('Create API', function () {
    afterEach(function () {
      deleteApi(ADMIN_USER, this.apiId).httpStatus(204);
    });

    it('should create an API from import with two page of documentation', function () {
      cy.fixture('json/imports/pages/api-with-documentation').then((definition) => {
        importCreateApi(ADMIN_USER, definition)
          .httpStatus(200)
          .should((response) => {
            expect(response.body.id).to.not.be.null;

            const apiId = response.body.id;

            expect(response.body.name).to.eq(definition.name);
            expect(response.body.version).to.eq(definition.version);
            expect(response.body.visibility).to.eq(definition.visibility);
            expect(response.body.state).to.eq('STOPPED');
            expect(response.body.lifecycle_state).to.eq('CREATED');

            cy.wrap(apiId).as('apiId');

            getPages(ADMIN_USER, apiId)
              .httpStatus(200)
              .should((response) => {
                expect(response.body.length).to.eq(2);
              });
          });
      });
    });
  });
});

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
    importUpdateApi
} from '../../../commands/management/api-management-commands';

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
});

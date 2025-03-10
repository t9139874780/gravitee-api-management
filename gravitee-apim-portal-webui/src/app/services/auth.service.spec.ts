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
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: SpectatorService<AuthService>;
  const createService = createServiceFactory({
    service: AuthService,
    imports: [HttpClientTestingModule],
  });

  beforeEach(() => {
    service = createService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

/**
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
package io.gravitee.management.rest.resource;

import java.security.Principal;

import javax.ws.rs.core.Context;
import javax.ws.rs.core.SecurityContext;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

/**
 * @author David BRASSELY (brasseld at gmail.com)
 */
public abstract class AbstractResource {

    @Context
    private SecurityContext securityContext;

    protected String getAuthenticatedUsername() {
        return securityContext.getUserPrincipal().getName();
    }

    protected Principal getAuthenticatedUser() {
        return securityContext.getUserPrincipal();
    }

    protected boolean isAuthenticated() {
        return securityContext.getUserPrincipal() != null;
    }
}

import * as faker from 'faker';
import { Group } from '@model/groups';

export class GroupFakers {
  static group(attributes?: Partial<Group>): Group {
    const name = faker.name.jobArea();

    return {
      name,
      event_rules: [],
      lock_api_role: false,
      lock_application_role: false,
      disable_membership_notifications: true,
      ...attributes,
    };
  }
}

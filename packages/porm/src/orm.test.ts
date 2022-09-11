import { porm } from './orm';
import {
  AssertEqual,
  expectSql,
  insertUser,
  useTestDatabase,
} from './test-utils/test-utils';
import { adapter } from './test-utils/test-db';
import { Model } from './model';

describe('orm', () => {
  useTestDatabase();

  type User = UserModel['columns']['type'];
  class UserModel extends Model {
    table = 'user';
    columns = this.setColumns((t) => ({
      id: t.serial().primaryKey(),
      name: t.text(),
    }));
  }

  class ProfileModel extends Model {
    table = 'profile';
    columns = this.setColumns((t) => ({
      id: t.serial().primaryKey(),
    }));
  }

  it('should return object with provided adapter, destroy and transaction method, models', () => {
    const db = porm(adapter)({
      user: UserModel,
      profile: ProfileModel,
    });

    expect(db.adapter).toBe(adapter);
    expect(db.destroy).toBeInstanceOf(Function);
    expect(db.transaction).toBeInstanceOf(Function);
    expect(Object.keys(db)).toEqual(
      expect.arrayContaining(['user', 'profile']),
    );
  });

  it('should return model which is queryable interface', async () => {
    await insertUser();

    const db = porm(adapter)({
      user: UserModel,
      profile: ProfileModel,
    });

    const query = db.user.select('id', 'name').where({ id: { gt: 0 } });

    expectSql(
      query.toSql(),
      `
        SELECT "user"."id", "user"."name"
        FROM "user"
        WHERE "user"."id" > $1
      `,
      [0],
    );

    const result = await query;
    expect(result).toEqual([{ id: 1, name: 'name' }]);

    const eq: AssertEqual<typeof result, Pick<User, 'id' | 'name'>[]> = true;
    expect(eq).toBe(true);
  });
});

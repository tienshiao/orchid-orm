import { createModel } from './model';
import { orchidORM } from './orm';
import { adapter, db } from './test-utils/test-db';
import { assertType, userData, useTestDatabase } from './test-utils/test-utils';
import { ColumnType, columnTypes, Operators } from 'pqb';

describe('model', () => {
  useTestDatabase();

  describe('overriding column types', () => {
    it('should have .raw with overridden types', () => {
      class Type extends ColumnType {
        dataType = 'type';
        operators = Operators.any;
      }
      const type = new Type();
      const Model = createModel({ columnTypes: { type: () => type } });
      class UserModel extends Model {
        table = 'user';
        columns = this.setColumns((t) => ({
          createdAt: t.type(),
        }));
      }

      const { user } = orchidORM(
        { adapter },
        {
          user: UserModel,
        },
      );

      const value = user.raw((t) => t.type(), '');

      expect(value.__column).toBe(type);
    });

    it('should return date as string by default', async () => {
      await db.user.create(userData);

      const Model = createModel({ columnTypes });
      class UserModel extends Model {
        table = 'user';
        columns = this.setColumns((t) => ({
          createdAt: t.timestamp(),
        }));
      }

      const { user } = orchidORM(
        { adapter },
        {
          user: UserModel,
        },
      );

      const result = await user.get('createdAt');
      expect(typeof result).toBe('string');

      assertType<typeof result, string>();
    });

    it('should return date as Date when overridden', async () => {
      await db.user.create(userData);

      const Model = createModel({
        columnTypes: {
          timestamp() {
            return columnTypes.timestamp().parse((input) => new Date(input));
          },
        },
      });

      class UserModel extends Model {
        table = 'user';
        columns = this.setColumns((t) => ({
          createdAt: t.timestamp(),
        }));
      }

      const { user } = orchidORM(
        { adapter },
        {
          user: UserModel,
        },
      );

      const result = await user.get('createdAt');
      expect(result instanceof Date).toBe(true);

      assertType<typeof result, Date>();
    });
  });
});

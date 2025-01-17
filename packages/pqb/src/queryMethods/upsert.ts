import { Query, SetQueryReturnsOne, SetQueryReturnsVoid } from '../query';
import { UpdateData } from './update';
import { CreateData } from './create';
import { WhereResult } from './where';
import { MoreThanOneRowError } from '../errors';

export type UpsertData<T extends Query> = {
  update: UpdateData<T>;
  create: CreateData<T>;
};

export type UpsertResult<T extends Query> = T['hasSelect'] extends true
  ? SetQueryReturnsOne<T>
  : SetQueryReturnsVoid<T>;

export type UpsertThis = WhereResult<Query> & {
  returnType: 'one' | 'oneOrThrow';
};

export class QueryUpsert {
  upsert<T extends UpsertThis>(this: T, data: UpsertData<T>): UpsertResult<T> {
    return this.clone()._upsert(data);
  }

  _upsert<T extends UpsertThis>(this: T, data: UpsertData<T>): UpsertResult<T> {
    this._update<WhereResult<Query>>(data.update);
    this.query.returnType = 'one';
    this.query.wrapInTransaction = true;
    const { handleResult } = this.query;
    this.query.handleResult = async (q, queryResult) => {
      if (queryResult.rowCount === 0) {
        return (q as Query).create(data.create as CreateData<Query>);
      } else if (queryResult.rowCount > 1) {
        throw new MoreThanOneRowError(
          `Only one row was expected to find for upsert, found ${queryResult.rowCount} rows.`,
        );
      }

      return handleResult(q, queryResult);
    };
    return this as unknown as UpsertResult<T>;
  }
}

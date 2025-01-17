import { Query, SetQueryReturnsRowCount } from '../query';

export type DeleteMethodsNames = 'del' | '_del' | 'delete' | '_delete';

type DeleteArgs<T extends Query> = T['hasWhere'] extends true
  ? [forceAll?: boolean]
  : [true];

type DeleteResult<T extends Query> = T['hasSelect'] extends true
  ? T
  : SetQueryReturnsRowCount<T>;

const del = <T extends Query>(
  self: T,
  ...args: DeleteArgs<T>
): DeleteResult<T> => {
  return self.clone()._del(...args) as unknown as DeleteResult<T>;
};

const _del = <T extends Query>(
  q: T,
  ...args: DeleteArgs<T>
): DeleteResult<T> => {
  if (!q.query.and?.length && !q.query.or?.length && !args[0]) {
    throw new Error('No where conditions or forceAll flag provided to delete');
  }

  if (!q.query.select) {
    q.query.returnType = 'rowCount';
  }

  q.query.type = 'delete';
  return q as unknown as DeleteResult<T>;
};

export class Delete {
  del<T extends Query>(this: T, ...args: DeleteArgs<T>): DeleteResult<T> {
    return del(this, ...args);
  }

  _del<T extends Query>(this: T, ...args: DeleteArgs<T>): DeleteResult<T> {
    return _del(this, ...args);
  }

  delete<T extends Query>(this: T, ...args: DeleteArgs<T>): DeleteResult<T> {
    return del(this, ...args);
  }

  _delete<T extends Query>(this: T, ...args: DeleteArgs<T>): DeleteResult<T> {
    return _del(this, ...args);
  }
}

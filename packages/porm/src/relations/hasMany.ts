import {
  RelationData,
  RelationParams,
  RelationThunkBase,
  RelationThunks,
} from './relations';
import { Model, ModelClass } from '../model';
import { addQueryOn, OnQueryBuilder, Query, Relation } from 'pqb';

export interface HasMany extends RelationThunkBase {
  type: 'hasMany';
  returns: 'many';
  fn(): ModelClass;
  options: RelationThunkBase['options'] &
    (
      | {
          primaryKey: string;
          foreignKey: string;
        }
      | {
          through: string;
          source: string;
        }
    );
}

export type HasManyParams<
  T extends Model,
  Relations extends RelationThunks,
  Relation extends HasMany,
> = Relation['options'] extends { primaryKey: string }
  ? Record<
      Relation['options']['primaryKey'],
      T['columns']['shape'][Relation['options']['primaryKey']]['type']
    >
  : Relation['options'] extends { through: string }
  ? RelationParams<T, Relations, Relations[Relation['options']['through']]>
  : never;

export const makeHasManyMethod = (
  model: Query,
  relation: HasMany,
  query: Query,
): RelationData => {
  if ('through' in relation.options) {
    const { through, source } = relation.options;

    type ModelWithQueryMethod = Record<
      string,
      (params: Record<string, unknown>) => Query
    >;

    const throughRelation = (model.relations as Record<string, Relation>)[
      through
    ];

    const sourceRelation = (
      throughRelation.model.relations as Record<string, Relation>
    )[source];

    const sourceQuery = sourceRelation.joinQuery.as(source);

    const whereExistsCallback = (q: OnQueryBuilder<Query, never>) =>
      sourceQuery as unknown as typeof q;

    return {
      method: (params: Record<string, unknown>) => {
        const throughQuery = (model as unknown as ModelWithQueryMethod)[
          through
        ](params);

        return query.whereExists(throughQuery, whereExistsCallback);
      },
      joinQuery: query.whereExists(
        throughRelation.joinQuery,
        whereExistsCallback,
      ),
    };
  }

  const { primaryKey, foreignKey } = relation.options;

  return {
    method: (params: Record<string, unknown>) => {
      return query.where({ [foreignKey]: params[primaryKey] });
    },
    joinQuery: addQueryOn(query, query, model, foreignKey, primaryKey),
  };
};

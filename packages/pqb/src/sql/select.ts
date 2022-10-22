import { JsonItem, SelectFunctionItem, SelectQueryData } from './types';
import { Expression, getRaw, isRaw, raw } from '../common';
import { Query } from '../query';
import { addValue, q, quoteFullColumn } from './common';
import { aggregateToSql } from './aggregate';
import { getQueryAs } from '../utils';
import { RelationQuery, relationQueryKey } from '../relations';
import { PormInternalError, UnhandledTypeError } from '../errors';

const jsonColumnOrMethodToSql = (
  column: string | JsonItem,
  values: unknown[],
  quotedAs?: string,
) => {
  return typeof column === 'string'
    ? quoteFullColumn(column, quotedAs)
    : jsonToSql(column, values, quotedAs);
};

const jsonToSql = (
  item: JsonItem,
  values: unknown[],
  quotedAs?: string,
): string => {
  const json = item.__json;
  if (json[0] === 'pathQuery') {
    const [, , , column, path, options] = json;
    return `jsonb_path_query(${jsonColumnOrMethodToSql(
      column,
      values,
      quotedAs,
    )}, ${addValue(values, path)}${
      options?.vars ? `, ${addValue(values, options.vars)}` : ''
    }${options?.silent ? ', true' : ''})`;
  } else if (json[0] === 'set') {
    const [, , , column, path, value, options] = json;
    return `jsonb_set(${jsonColumnOrMethodToSql(
      column,
      values,
      quotedAs,
    )}, '{${path.join(', ')}}', ${addValue(values, JSON.stringify(value))}${
      options?.createIfMissing ? ', true' : ''
    })`;
  } else if (json[0] === 'insert') {
    const [, , , column, path, value, options] = json;
    return `jsonb_insert(${jsonColumnOrMethodToSql(
      column,
      values,
      quotedAs,
    )}, '{${path.join(', ')}}', ${addValue(values, JSON.stringify(value))}${
      options?.insertAfter ? ', true' : ''
    })`;
  } else if (json[0] === 'remove') {
    const [, , , column, path] = json;
    return `${jsonColumnOrMethodToSql(
      column,
      values,
      quotedAs,
    )} #- '{${path.join(', ')}}'`;
  }
  return '';
};

export const pushSelectSql = (
  sql: string[],
  model: Query,
  query: Pick<SelectQueryData, 'select' | 'join'>,
  values: unknown[],
  quotedAs?: string,
) => {
  sql.push(selectToSql(model, query, values, quotedAs));
};

export const selectToSql = (
  model: Query,
  query: Pick<SelectQueryData, 'select' | 'join'>,
  values: unknown[],
  quotedAs?: string,
): string => {
  if (query.select) {
    const list: string[] = [];
    query.select.forEach((item) => {
      if (typeof item === 'string') {
        list.push(
          item === '*'
            ? query.join?.length
              ? `${quotedAs}.*`
              : '*'
            : quoteFullColumn(item, quotedAs),
        );
      } else if ((item as Query).query?.[relationQueryKey]) {
        let relationQuery = (item as RelationQuery).clone();
        const as = q(getQueryAs(relationQuery));
        relationQuery._as(relationQuery.query[relationQueryKey] as string);

        const { returnType } = relationQuery.query;
        switch (returnType) {
          case 'all':
          case 'one':
          case 'oneOrThrow':
            relationQuery =
              relationQuery._json() as unknown as typeof relationQuery;
            break;
          case 'pluck': {
            const first = relationQuery.query.select?.[0];
            if (!first)
              throw new PormInternalError(`Nothing was selected for pluck`);

            const selection = selectToSql(
              relationQuery.__model,
              relationQuery.query,
              values,
              q(getQueryAs(relationQuery)),
            );

            relationQuery.query.select = [
              raw(`COALESCE(json_agg(${selection}), '[]')`),
            ];
            break;
          }
          case 'rows':
          case 'value':
          case 'valueOrThrow':
          case 'rowCount':
          case 'void':
            break;
          default:
            throw new UnhandledTypeError(returnType);
        }

        list.push(`(${relationQuery.toSql(values).text}) AS ${as}`);
      } else {
        if ('selectAs' in item) {
          const obj = item.selectAs as Record<string, Expression | Query>;
          for (const as in obj) {
            const value = obj[as];
            if (typeof value === 'object') {
              if (isRaw(value)) {
                list.push(`${getRaw(value, values)} AS ${q(as)}`);
              } else {
                const sql = (value as Query).json().toSql(values);
                list.push(`(${sql.text}) AS ${q(as)}`);
              }
            } else {
              list.push(
                `${quoteFullColumn(value as string, quotedAs)} AS ${q(as)}`,
              );
            }
          }
        } else if ('__json' in item) {
          list.push(
            `${jsonToSql(item, values, quotedAs)} AS ${q(item.__json[1])}`,
          );
        } else if (isRaw(item)) {
          list.push(getRaw(item, values));
        } else if ('arguments' in item) {
          list.push(
            `${(item as SelectFunctionItem).function}(${selectToSql(
              model,
              { select: item.arguments },
              values,
              quotedAs,
            )})${item.as ? ` AS ${q((item as { as: string }).as)}` : ''}`,
          );
        } else {
          list.push(aggregateToSql(model, values, item, quotedAs));
        }
      }
    });
    return list.join(', ');
  } else {
    return query.join?.length ? `${quotedAs}.*` : '*';
  }
};

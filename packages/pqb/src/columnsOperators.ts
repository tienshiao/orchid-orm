import { Query } from './query';
import { quote } from './quote';
import { addValue } from './sql/common';
import { getRaw, isRaw, RawExpression } from './common';

type Fn<T> = (key: string, value: T, values: unknown[]) => string;

export type Operator<T> = Fn<T> & { type: T };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Operators = Record<string, Operator<any>>;

export const createOperator = <T>(fn: Fn<T>) => {
  return Object.assign(fn, { type: undefined as unknown as T });
};

const quoteValue = (
  arg: unknown,
  values: unknown[],
  jsonArray?: boolean,
): string => {
  if (arg && typeof arg === 'object') {
    if (!jsonArray && Array.isArray(arg)) {
      return `(${arg.map((value) => addValue(values, value)).join(', ')})`;
    }

    if ('toSql' in arg) {
      const sql = (arg as Query).toSql({ values });
      return `(${sql.text})`;
    }

    if (isRaw(arg)) {
      return getRaw(arg, values);
    }
  }

  return addValue(values, arg);
};

const all = {
  equals: <T>() =>
    createOperator<T | Query | RawExpression>((key, value, values) =>
      value === null
        ? `${key} IS NULL`
        : `${key} = ${quoteValue(value, values)}`,
    ),
  not: <T>() =>
    createOperator<T | Query | RawExpression>((key, value, values) =>
      value === null
        ? `${key} IS NOT NULL`
        : `${key} <> ${quoteValue(value, values)}`,
    ),
  in: <T>() =>
    createOperator<T[] | Query | RawExpression>(
      (key, value, values) => `${key} IN ${quoteValue(value, values)}`,
    ),
  notIn: <T>() =>
    createOperator<T[] | Query | RawExpression>(
      (key, value, values) => `NOT ${key} IN ${quoteValue(value, values)}`,
    ),
  lt: <T>() =>
    createOperator<T | Query | RawExpression>(
      (key, value, values) => `${key} < ${quoteValue(value, values)}`,
    ),
  lte: <T>() =>
    createOperator<T | Query | RawExpression>(
      (key, value, values) => `${key} <= ${quoteValue(value, values)}`,
    ),
  gt: <T>() =>
    createOperator<T | Query | RawExpression>(
      (key, value, values) => `${key} > ${quoteValue(value, values)}`,
    ),
  gte: <T>() =>
    createOperator<T | Query | RawExpression>(
      (key, value, values) => `${key} >= ${quoteValue(value, values)}`,
    ),
  contains: <T>() =>
    createOperator<T | Query | RawExpression>(
      (key, value, values) =>
        `${key} LIKE '%' || ${quoteValue(value, values)} || '%'`,
    ),
  containsInsensitive: <T>() =>
    createOperator<T | Query | RawExpression>(
      (key, value, values) =>
        `${key} ILIKE '%' || ${quoteValue(value, values)} || '%'`,
    ),
  startsWith: <T>() =>
    createOperator<T | Query | RawExpression>(
      (key, value, values) => `${key} LIKE ${quoteValue(value, values)} || '%'`,
    ),
  startsWithInsensitive: <T>() =>
    createOperator<T | Query | RawExpression>(
      (key, value, values) =>
        `${key} ILIKE ${quoteValue(value, values)} || '%'`,
    ),
  endsWith: <T>() =>
    createOperator<T | Query | RawExpression>(
      (key, value, values) => `${key} LIKE '%' || ${quoteValue(value, values)}`,
    ),
  endsWithInsensitive: <T>() =>
    createOperator<T | Query | RawExpression>(
      (key, value, values) =>
        `${key} ILIKE '%' || ${quoteValue(value, values)}`,
    ),
  between: <T>() =>
    createOperator<[T | Query | RawExpression, T | Query | RawExpression]>(
      (key, [from, to], values) =>
        `${key} BETWEEN ${quoteValue(from, values)} AND ${quoteValue(
          to,
          values,
        )}`,
    ),
  jsonPath: <T>() =>
    createOperator<
      [path: string, op: string, value: T | Query | RawExpression]
    >(
      (key, [path, op, value], values) =>
        `jsonb_path_query_first(${key}, ${quote(
          path,
        )}) #>> '{}' ${op} ${quoteValue(value, values, true)}`,
    ),
  jsonSupersetOf: <T>() =>
    createOperator<T | Query | RawExpression>(
      (key, value, values) => `${key} @> ${quoteValue(value, values, true)}`,
    ),
  jsonSubsetOf: <T>() =>
    createOperator<T | Query | RawExpression>(
      (key, value, values) => `${key} <@ ${quoteValue(value, values, true)}`,
    ),
};

const base = <T>() => ({
  equals: all.equals<T>(),
  not: all.not<T>(),
  in: all.in<T>(),
  notIn: all.notIn<T>(),
});

const numeric = <T>() => ({
  ...base<T>(),
  lt: all.lt<T>(),
  lte: all.lte<T>(),
  gt: all.gt<T>(),
  gte: all.gte<T>(),
  between: all.between<T>(),
});

const text = <T>() => ({
  ...base<T>(),
  contains: all.contains<T>(),
  containsInsensitive: all.containsInsensitive<T>(),
  startsWith: all.startsWith<T>(),
  startsWithInsensitive: all.startsWithInsensitive<T>(),
  endsWith: all.endsWith<T>(),
  endsWithInsensitive: all.endsWithInsensitive<T>(),
});

const json = <T>() => ({
  ...base<T>(),
  jsonPath: all.jsonPath<T>(),
  jsonSupersetOf: all.jsonSupersetOf<T>(),
  jsonSubsetOf: all.jsonSubsetOf<T>(),
});

export const Operators = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any: base<any>(),
  boolean: base<boolean>(),
  number: numeric<number>(),
  date: numeric<Date>(),
  time: numeric<Date>(),
  text: text<string>(),
  json: json<unknown>(),
  // TODO: array operators
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  array: base<any>(),
};

import { ColumnInput, ColumnOutput, ColumnType } from './columnType';
import { Operators } from '../columnsOperators';
import { SetOptional, SomeIsTrue } from '../utils';
import { StringKey } from '../common';

export type ColumnsShape = Record<string, ColumnType>;

export type ColumnShapeOutput<Shape extends ColumnsShape> = {
  [K in keyof Shape]: ColumnOutput<Shape[K]>;
};

type OptionalColumnsForInput<Shape extends ColumnsShape> = {
  [K in keyof Shape]: SomeIsTrue<
    [Shape[K]['isNullable'], Shape[K]['hasDefault']]
  > extends true
    ? K
    : never;
}[keyof Shape];

export type ColumnShapeInput<Shape extends ColumnsShape> = SetOptional<
  {
    [K in keyof Shape]: ColumnInput<Shape[K]>;
  },
  OptionalColumnsForInput<Shape>
>;

export class ColumnsObject<Shape extends ColumnsShape> extends ColumnType<
  { [K in keyof Shape]: Shape[K]['type'] },
  typeof Operators.any
> {
  dataType = 'object';
  operators = Operators.any;

  constructor(public shape: Shape) {
    super();
  }
}

export class ArrayOfColumnsObjects<
  Shape extends ColumnsShape,
> extends ColumnType<
  { [K in keyof Shape]: Shape[K]['type'] }[],
  typeof Operators.any
> {
  dataType = 'array';
  operators = Operators.any;

  constructor(public shape: Shape) {
    super();
  }
}

export abstract class PluckResultColumnType<
  C extends ColumnType,
> extends ColumnType<C['type'][], typeof Operators.any> {}

// resolves in string literal of single primary key
// if table has two or more primary keys it will resolve in never
export type SinglePrimaryKey<Shape extends ColumnsShape> = StringKey<
  {
    [K in keyof Shape]: Shape[K]['isPrimaryKey'] extends true
      ? [
          {
            [S in keyof Shape]: Shape[S]['isPrimaryKey'] extends true
              ? S extends K
                ? never
                : S
              : never;
          }[keyof Shape],
        ] extends [never]
        ? K
        : never
      : never;
  }[keyof Shape]
>;

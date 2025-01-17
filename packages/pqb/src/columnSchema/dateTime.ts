import { ColumnData, ColumnType } from './columnType';
import { Operators } from '../columnsOperators';
import { joinTruthy } from '../utils';
import { dateTypeMethods } from './commonMethods';
import { assignMethodsToClass } from './utils';
import { IntegerColumn } from './number';

export type DateColumnData = ColumnData & {
  min?: Date;
  max?: Date;
};

type DateMethods = typeof dateTypeMethods;

export interface DateBaseColumn
  extends ColumnType<string, typeof Operators.date, string | Date>,
    DateMethods {}

export abstract class DateBaseColumn extends ColumnType<
  string,
  typeof Operators.date,
  string | Date
> {
  data = {} as DateColumnData;
  operators = Operators.date;

  asNumber() {
    return this.encode((input: number) => new Date(input))
      .parse(Date.parse)
      .as(new IntegerColumn() as never) as unknown as IntegerColumn;
  }

  asDate<T extends ColumnType>(this: T) {
    return this.parse((input) => new Date(input as string));
  }
}

assignMethodsToClass(DateBaseColumn, dateTypeMethods);

// date	4 bytes	date (no time of day)	4713 BC	5874897 AD 1 day
export class DateColumn extends DateBaseColumn {
  dataType = 'date' as const;
}

export type DateTimeColumnData = DateColumnData & {
  precision?: number;
};

export abstract class DateTimeBaseClass<
  Precision extends number | undefined = undefined,
> extends DateBaseColumn {
  data: DateTimeColumnData & { precision: Precision };

  constructor(precision?: Precision) {
    super();

    this.data = { precision } as DateTimeColumnData & { precision: Precision };
  }

  toSQL() {
    return joinTruthy(
      this.dataType,
      this.data.precision !== undefined && `(${this.data.precision})`,
    );
  }
}

export abstract class DateTimeWithTimeZoneBaseClass<
  Precision extends number | undefined = undefined,
> extends DateTimeBaseClass<Precision> {
  abstract baseDataType: string;

  toSQL() {
    return joinTruthy(
      this.baseDataType,
      this.data.precision !== undefined && `(${this.data.precision})`,
      ' with time zone',
    );
  }
}

// timestamp [ (p) ] [ without time zone ]	8 bytes	both date and time (no time zone)	4713 BC	294276 AD	1 microsecond
export class TimestampColumn<
  Precision extends number | undefined = undefined,
> extends DateTimeBaseClass<Precision> {
  dataType = 'timestamp' as const;
}

// timestamp [ (p) ] with time zone	8 bytes	both date and time, with time zone	4713 BC	294276 AD	1 microsecond
export class TimestampWithTimeZoneColumn<
  Precision extends number | undefined = undefined,
> extends DateTimeWithTimeZoneBaseClass<Precision> {
  dataType = 'timestamp with time zone' as const;
  baseDataType = 'timestamp' as const;
}

// time [ (p) ] [ without time zone ]	8 bytes	time of day (no date)	00:00:00	24:00:00	1 microsecond
export class TimeColumn<
  Precision extends number | undefined = undefined,
> extends DateTimeBaseClass<Precision> {
  dataType = 'time' as const;
}

// time [ (p) ] with time zone	12 bytes	time of day (no date), with time zone	00:00:00+1559	24:00:00-1559	1 microsecond
export class TimeWithTimeZoneColumn<
  Precision extends number | undefined = undefined,
> extends DateTimeWithTimeZoneBaseClass<Precision> {
  dataType = 'time with time zone' as const;
  baseDataType = 'time' as const;
}

export type TimeInterval = {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

// interval [ fields ] [ (p) ]	16 bytes	time interval	-178000000 years	178000000 years	1 microsecond
export class IntervalColumn<
  Fields extends string | undefined = undefined,
  Precision extends number | undefined = undefined,
> extends ColumnType<TimeInterval, typeof Operators.date> {
  dataType = 'interval' as const;
  data: DateTimeColumnData & { fields: Fields; precision: Precision };
  operators = Operators.date;

  constructor(fields?: Fields, precision?: Precision) {
    super();

    this.data = { fields, precision } as DateTimeColumnData & {
      fields: Fields;
      precision: Precision;
    };
  }

  toSQL() {
    return joinTruthy(
      this.dataType,
      this.data.fields && ` ${this.data.fields}`,
      this.data.precision !== undefined && ` (${this.data.precision})`,
    );
  }
}

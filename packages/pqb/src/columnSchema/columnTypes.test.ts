import { assertType, db } from '../test-utils';
import { columnTypes } from './columnTypes';
import { TimeInterval } from './dateTime';

describe('column types', () => {
  describe('numeric types', () => {
    describe('smallint', () => {
      it('should output number', async () => {
        const result = await db.get(db.raw((t) => t.smallint(), '1::smallint'));
        expect(result).toBe(1);

        assertType<typeof result, number>();
      });
    });

    describe('integer', () => {
      it('should output number', async () => {
        const result = await db.get(db.raw((t) => t.integer(), '1::integer'));
        expect(result).toBe(1);

        assertType<typeof result, number>();
      });
    });

    describe('bigint', () => {
      it('should output string', async () => {
        const result = await db.get(db.raw((t) => t.bigint(), '1::bigint'));
        expect(result).toBe('1');

        assertType<typeof result, string>();
      });
    });

    describe('numeric', () => {
      it('should output string', async () => {
        const result = await db.get(db.raw((t) => t.numeric(), '1::numeric'));
        expect(result).toBe('1');

        assertType<typeof result, string>();
      });
    });

    describe('decimal', () => {
      it('should output string', async () => {
        const result = await db.get(db.raw((t) => t.decimal(), '1::decimal'));
        expect(result).toBe('1');

        assertType<typeof result, string>();
      });
    });

    describe('real', () => {
      it('should output number', async () => {
        const result = await db.get(db.raw((t) => t.real(), '1::real'));
        expect(result).toBe(1);

        assertType<typeof result, number>();
      });
    });

    describe('doublePrecision', () => {
      it('should output number', async () => {
        const result = await db.get(
          db.raw((t) => t.real(), '1::double precision'),
        );
        expect(result).toBe(1);

        assertType<typeof result, number>();
      });
    });

    describe('smallSerial', () => {
      it('should output number', async () => {
        const result = await db.get(
          db.raw((t) => t.smallSerial(), '1::smallint'),
        );
        expect(result).toBe(1);

        assertType<typeof result, number>();
      });
    });

    describe('serial', () => {
      it('should output number', async () => {
        const result = await db.get(db.raw((t) => t.serial(), '1::integer'));
        expect(result).toBe(1);

        assertType<typeof result, number>();
      });
    });

    describe('bigSerial', () => {
      it('should output string', async () => {
        const result = await db.get(db.raw((t) => t.bigSerial(), '1::bigint'));
        expect(result).toBe('1');

        assertType<typeof result, string>();
      });
    });
  });

  describe('text types', () => {
    describe('varchar', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.varchar(), `'text'::varchar(4)`),
        );
        expect(result).toBe('text');

        assertType<typeof result, string>();
      });
    });

    describe('char', () => {
      it('should output string', async () => {
        const result = await db.get(db.raw((t) => t.char(), `'text'::char(4)`));
        expect(result).toBe('text');

        assertType<typeof result, string>();
      });
    });

    describe('text', () => {
      it('should output string', async () => {
        const result = await db.get(db.raw((t) => t.text(), `'text'::text`));
        expect(result).toBe('text');

        assertType<typeof result, string>();
      });
    });

    describe('string', () => {
      it('should be an alias for the text', async () => {
        const result = await db.get(db.raw((t) => t.string(), `'text'::text`));
        expect(result).toBe('text');

        assertType<typeof result, string>();
      });
    });
  });

  describe('binary data type', () => {
    describe('bytea', () => {
      it('should output Buffer', async () => {
        const result = await db.get(db.raw((t) => t.bytea(), `'text'::bytea`));
        expect(result instanceof Buffer).toBe(true);
        expect(result.toString()).toBe('text');

        assertType<typeof result, Buffer>();
      });
    });
  });

  describe('date/time types', () => {
    describe('date', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.date(), `'1999-01-08'::date`),
        );
        expect(result).toBe('1999-01-08');

        assertType<typeof result, string>();
      });
    });

    describe('timestamp', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw(
            () => columnTypes.timestamp(),
            `'1999-01-08 04:05:06'::timestamp`,
          ),
        );
        expect(result).toBe('1999-01-08 04:05:06');

        assertType<typeof result, string>();
      });
    });

    describe('timestamp with time zone', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw(
            (t) => t.timestampWithTimeZone(),
            `'1999-01-08 04:05:06 +0'::timestamptz AT TIME ZONE 'UTC'`,
          ),
        );
        expect(result).toBe('1999-01-08 04:05:06');

        assertType<typeof result, string>();
      });
    });

    describe('time', () => {
      it('should output string', async () => {
        const result = await db.get(db.raw((t) => t.time(), `'12:00'::time`));
        expect(result).toBe('12:00:00');

        assertType<typeof result, string>();
      });
    });

    describe('time with time zone', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw(
            (t) => t.timeWithTimeZone(),
            `'12:00 +0'::timetz AT TIME ZONE 'UTC'`,
          ),
        );
        expect(result).toBe('12:00:00+00');

        assertType<typeof result, string>();
      });
    });

    describe('interval', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw(
            (t) => t.interval(),
            `'1 year 2 months 3 days 4 hours 5 minutes 6 seconds'::interval`,
          ),
        );
        expect(result).toEqual({
          years: 1,
          months: 2,
          days: 3,
          hours: 4,
          minutes: 5,
          seconds: 6,
        });

        assertType<typeof result, TimeInterval>();
      });
    });
  });

  describe('boolean type', () => {
    describe('boolean', () => {
      it('should output boolean', async () => {
        const result = await db.get(db.raw((t) => t.boolean(), `true`));
        expect(result).toBe(true);

        assertType<typeof result, boolean>();
      });
    });
  });

  describe('enum type', () => {
    describe('enum', () => {
      beforeAll(async () => {
        await db.adapter.query(`
          DROP TYPE IF EXISTS mood
        `);
        await db.adapter.query(`
          CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy');
        `);
      });

      type MoodUnion = 'sad' | 'ok' | 'happy';

      it('should output proper union', async () => {
        const result = await db.get(
          db.raw(
            (t) => t.enum('mood', ['sad', 'ok', 'happy']),
            `'happy'::mood`,
          ),
        );
        expect(result).toBe('happy');

        assertType<typeof result, MoodUnion>();
      });
    });
  });

  describe('geometric types', () => {
    describe('point', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.point(), `'(1, 2)'::point`),
        );
        expect(result).toBe('(1,2)');

        assertType<typeof result, string>();
      });
    });

    describe('line', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.line(), `'{1, 2, 3}'::line`),
        );
        expect(result).toBe('{1,2,3}');

        assertType<typeof result, string>();
      });
    });

    describe('lseg', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.lseg(), `'[(1, 2), (3, 4)]'::lseg`),
        );
        expect(result).toBe('[(1,2),(3,4)]');

        assertType<typeof result, string>();
      });
    });

    describe('box', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.box(), `'((3, 4), (1, 2))'::box`),
        );
        expect(result).toBe('(3,4),(1,2)');

        assertType<typeof result, string>();
      });
    });

    describe('path', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.path(), `'((1, 2), (3, 4))'::path`),
        );
        expect(result).toBe('((1,2),(3,4))');

        assertType<typeof result, string>();
      });
    });

    describe('polygon', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.polygon(), `'((1, 2), (3, 4))'::polygon`),
        );
        expect(result).toBe('((1,2),(3,4))');

        assertType<typeof result, string>();
      });
    });

    describe('circle', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.circle(), `'<(1,2),3>'::circle`),
        );
        expect(result).toBe('<(1,2),3>');

        assertType<typeof result, string>();
      });
    });
  });

  describe('network address types', () => {
    describe('cidr', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.cidr(), `'192.168.100.128/25'::cidr`),
        );
        expect(result).toBe('192.168.100.128/25');

        assertType<typeof result, string>();
      });
    });

    describe('inet', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.inet(), `'192.168.100.128/25'::inet`),
        );
        expect(result).toBe('192.168.100.128/25');

        assertType<typeof result, string>();
      });
    });

    describe('macaddr', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.macaddr(), `'08:00:2b:01:02:03'::macaddr`),
        );
        expect(result).toBe('08:00:2b:01:02:03');

        assertType<typeof result, string>();
      });
    });

    describe('macaddr8', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.macaddr8(), `'08:00:2b:ff:fe:01:02:03'::macaddr8`),
        );
        expect(result).toBe('08:00:2b:ff:fe:01:02:03');

        assertType<typeof result, string>();
      });
    });
  });

  describe('bit string types', () => {
    describe('bit', () => {
      it('should output string', async () => {
        const result = await db.get(db.raw((t) => t.bit(3), `B'101'`));
        expect(result).toBe('101');

        assertType<typeof result, string>();
      });
    });

    describe('bit varying', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.bitVarying(), `'10101'::bit varying(5)`),
        );
        expect(result).toBe('10101');

        assertType<typeof result, string>();
      });
    });
  });

  describe('text search types', () => {
    describe('tsvector', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw(
            (t) => t.tsvector(),
            `'a fat cat sat on a mat and ate a fat rat'::tsvector`,
          ),
        );
        expect(result).toBe(
          `'a' 'and' 'ate' 'cat' 'fat' 'mat' 'on' 'rat' 'sat'`,
        );

        assertType<typeof result, string>();
      });
    });

    describe('tsquery', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw((t) => t.tsquery(), `'fat & rat'::tsquery`),
        );
        expect(result).toBe(`'fat' & 'rat'`);

        assertType<typeof result, string>();
      });
    });
  });

  describe('uuid type', () => {
    describe('uuid', () => {
      it('should output string', async () => {
        const result = await db.get(
          db.raw(
            (t) => t.uuid(),
            `'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid`,
          ),
        );
        expect(result).toBe(`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`);

        assertType<typeof result, string>();
      });
    });
  });

  describe('array type', () => {
    describe('array', () => {
      it('should output nested array of numbers', async () => {
        const result = await db.get(
          db.raw(
            (t) => t.array(t.array(t.integer())),
            `'{{1, 2, 3}, {4, 5, 6}}'::integer[][]`,
          ),
        );
        expect(result).toEqual([
          [1, 2, 3],
          [4, 5, 6],
        ]);

        assertType<typeof result, number[][]>();
      });

      it('should output nested array of strings', async () => {
        const result = await db.get(
          db.raw(
            (t) => t.array(t.array(t.text())),
            `'{{"a", "b"}, {"c", "d"}}'::text[][]`,
          ),
        );
        expect(result).toEqual([
          ['a', 'b'],
          ['c', 'd'],
        ]);

        assertType<typeof result, string[][]>();
      });

      it('should output nested array of booleans', async () => {
        const result = await db.get(
          db.raw(
            (t) => t.array(t.array(t.boolean())),
            `'{{true}, {false}}'::text[][]`,
          ),
        );
        expect(result).toEqual([[true], [false]]);

        assertType<typeof result, boolean[][]>();
      });
    });
  });

  describe('other types', () => {
    describe('money', () => {
      it('should output number', async () => {
        const result = await db.get(
          db.raw((t) => t.money(), `'1234567890.42'::money`),
        );
        expect(result).toBe(1234567890.42);

        assertType<typeof result, number>();
      });
    });
  });
});

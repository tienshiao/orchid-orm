jest.mock('pqb', () => require('../pqb/src'), {
  virtual: true,
});

jest.mock('orchid-orm-schema-to-zod', () => require('../schema-to-zod/src'), {
  virtual: true,
});

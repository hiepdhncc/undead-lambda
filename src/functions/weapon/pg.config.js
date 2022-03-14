const pg = require('pg');

const dbConfig = {
  user: 'undead',
  password: 'rG9B8wzAa3AZsphJ',
  host: 'undeadblocks-db-dev.ct3hrkfqkw9m.ap-southeast-1.rds.amazonaws.com',
  port: 5432,
  database: 'undeadblocks',
};

module.exports = new pg.Client(dbConfig);

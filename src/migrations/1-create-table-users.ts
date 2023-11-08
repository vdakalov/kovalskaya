import pg from 'pg';

export const name = 'create table "users"';

export function up(db: pg.Pool): Promise<unknown> {
  return db.query(`
  create table if not exist "users" (
    id bigint not null primary key,
    balance float not null
  )`);
}

export function down(db: pg.Pool): Promise<unknown> {
  return db.query(`
  drop table if exist "users"
  `);
}
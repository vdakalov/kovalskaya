import sequelize from 'sequelize';

type Data = {
  context: sequelize.QueryInterface;
};

const tableName = 'users';

export function up({ context: queryInterface }: Data): Promise<unknown> {
  return queryInterface.insert(null, tableName, {
    id: 1,
    balance: 1e4
  });
}

export function down({ context: queryInterface }: Data): Promise<unknown> {
  return queryInterface.delete(null, tableName, { id: 1 });
}
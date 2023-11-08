import sequelize from 'sequelize';

type Data = {
  context: sequelize.QueryInterface;
};

export const tableName = 'users';

export function up({ context: queryInterface }: Data): Promise<unknown> {
  return queryInterface.createTable(tableName, {
    id: {
      type: sequelize.DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    createdAt: {
      type: sequelize.DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: sequelize.DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    balance: {
      type: sequelize.DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        isInt: true
      }
    }
  });
}

export function down({ context: queryInterface }: Data): Promise<unknown> {
  return queryInterface.dropTable(tableName);
}
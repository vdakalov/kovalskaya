import { Sequelize, Model, DataTypes } from 'sequelize';
export { tableName } from '../migrations/1-create-table-users';

class User extends Model {}

export function init(sequelize: Sequelize, tableName: string): typeof User {
  return User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: tableName,
    tableName
  });
}

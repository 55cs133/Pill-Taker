import { DataTypes } from 'sequelize';

import Sequelize from '@/config/database';

export const User = Sequelize.define('User', {
  googleID: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telegramChatId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

import { DataTypes } from 'sequelize';

import Sequelize from '@/config/database';

export const User = Sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
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

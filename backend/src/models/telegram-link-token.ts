import { DataTypes } from 'sequelize';

import Sequelize from '@/config/database';

export const TelegramLinkToken = Sequelize.define('TelegramLinkToken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
});

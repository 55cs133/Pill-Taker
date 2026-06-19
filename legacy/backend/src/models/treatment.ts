import { DataTypes } from 'sequelize';

import Sequelize from '@/config/database';

export const Treatment = Sequelize.define('Treatment', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  interval: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  medicine: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: true,
});

import { DataTypes } from 'sequelize';

import Sequelize from '@/config/database';

export const Dose = Sequelize.define('Dose', {
  confirmedVia: {
    type: DataTypes.ENUM('qr_scan', 'manual'),
    allowNull: false,
    defaultValue: 'qr_scan',
  },
}, {
  timestamps: true,
});

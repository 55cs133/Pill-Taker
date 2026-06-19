import { User } from '@/models/user';
import { Treatment } from '@/models/treatment';
import { Dose } from '@/models/dose';
import { TelegramLinkToken } from '@/models/telegram-link-token';

export function setupAssociations() {
  User.hasMany(Treatment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
  Treatment.belongsTo(User);

  Treatment.hasMany(Dose, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
  Dose.belongsTo(Treatment);

  User.hasMany(TelegramLinkToken, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
  TelegramLinkToken.belongsTo(User);
}

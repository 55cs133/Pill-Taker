import express from 'express';

import { Treatment } from '@/models/treatment';
import { Dose } from '@/models/dose';
import { User } from '@/models/user';
import { sendTelegramNotification, sendEmailNotification } from '@/utils/notifications';

const router = express.Router();

router.post('/:slug', async (req, res) => {
  try {
    const treatment = await Treatment.findOne({
      where: { slug: req.params.slug },
      include: [{ model: User }],
    });
    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    const dose = await Dose.create({
      TreatmentId: treatment.getDataValue('id'),
      confirmedVia: 'qr_scan',
    });

    const user = treatment.getDataValue('User');
    const treatmentName = treatment.getDataValue('name');
    const takenAt = new Date().toLocaleString();

    const message = `Dose taken: <b>${treatmentName}</b> at ${takenAt}`;

    if (user?.telegramChatId) {
      await sendTelegramNotification(user.telegramChatId, message);
    }
    if (user?.email) {
      await sendEmailNotification(
        user.email,
        `PillTaker: Dose confirmed for ${treatmentName}`,
        `<p>${message}</p>`,
      );
    }

    return res.status(200).json({
      message: 'Dose recorded successfully',
      dose: {
        id: dose.getDataValue('id'),
        takenAt: dose.getDataValue('createdAt'),
        treatmentName,
      },
    });
  } catch (error) {
    console.error('Error flashing QR code', error);
    return res.status(500).json({ error: 'An error has occured.' });
  }
});

export default router;

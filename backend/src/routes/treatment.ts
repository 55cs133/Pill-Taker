import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

import { Treatment } from '@/models/treatment';
import { Dose } from '@/models/dose';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { treatmentName, interval, medicines } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const newTreatment = await Treatment.create({
      name: treatmentName,
      medicine: medicines,
      interval: parseInt(interval, 10),
      slug: uuidv4(),
      UserId: userId,
    });
    return res.status(201).json(newTreatment);
  } catch (error) {
    console.error('Error while creating resource', error);
    return res.status(500).json({ error: 'An error has occured.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const treatments = await Treatment.findAll({
      where: { UserId: userId },
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(treatments);
  } catch (error) {
    console.error('Error fetching treatments', error);
    return res.status(500).json({ error: 'An error has occured.' });
  }
});

router.get('/:id/qr', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const treatment = await Treatment.findOne({
      where: { id: req.params.id, UserId: userId },
    });
    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }
    const flashUrl = `${process.env.PUBLIC_URL}/flash/${treatment.getDataValue('slug')}`;
    const svg = await QRCode.toString(flashUrl, { type: 'svg', margin: 2 });
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.status(200).send(svg);
  } catch (error) {
    console.error('Error generating QR code', error);
    return res.status(500).json({ error: 'An error has occured.' });
  }
});

router.get('/:id/doses', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const treatment = await Treatment.findOne({
      where: { id: req.params.id, UserId: userId },
    });
    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }
    const doses = await Dose.findAll({
      where: { TreatmentId: treatment.getDataValue('id') },
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(doses);
  } catch (error) {
    console.error('Error fetching doses', error);
    return res.status(500).json({ error: 'An error has occured.' });
  }
});

export default router;

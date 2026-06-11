import express from 'express';

import { Treatment } from '@/models/treatment';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { treatmentName, interval, medicines } = req.body;
    console.log('Nom du traitement :', treatmentName);
    console.log('Interval :', interval);
    console.log('Médicaments :', medicines);
    const newTreatment = await Treatment.create({
      name: treatmentName,
      medicine: medicines,
      interval: parseInt(interval, 10),
    });
    return res.status(201).json(newTreatment);
  } catch (error) {
    console.error('Error while creating resource', error);
    return res.status(500).json({ error: 'An error has occured.' });
  }
});

export default router;

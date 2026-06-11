import { createServer } from '@/server';

createServer().then((app) => {
  app.listen(process.env.BACK, () => {
    console.log(`App listening on port ${process.env.BACK}`);
  });
});

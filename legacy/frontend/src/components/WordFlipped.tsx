import { FlipWords } from '@/components/ui/flip-words';

export function WordFlipped() {
  const words = ['flash', 'take', 'track', 'heal'];

  return (
    <div className="h-[40rem] flex justify-center items-center px-4">
      <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
        <FlipWords words={words} duration={500} />
        {' '}
        <br />
      </div>
    </div>
  );
}

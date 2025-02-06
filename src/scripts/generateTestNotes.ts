import { dbManager as db } from '../database/db';
import { subMonths, addDays, format } from 'date-fns';

const loremWords = `
Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor 
incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis 
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat 
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt 
in culpa qui officia deserunt mollit anim id est laborum
`.trim().split(/\s+/);

const generateRandomNote = (minWords: number, maxWords: number): string => {
  const length = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  const words = Array.from({ length }, () => 
    loremWords[Math.floor(Math.random() * loremWords.length)]
  );
  return words.join(' ');
};

const generateRandomDate = (startDate: Date, endDate: Date): Date => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(startDate.getTime() + randomTime);
};

const generateTestNotes = async (count: number = 100) => {
  const endDate = new Date();
  const startDate = subMonths(endDate, 3);
  
  console.log('Generating test notes...');
  
  for (let i = 0; i < count; i++) {
    const date = generateRandomDate(startDate, endDate);
    const content = generateRandomNote(5, 50); // 5 to 50 words per note
    
    await db.createNote(
      content,
      date.toISOString(),
      date.toISOString()
    );
    
    if (i % 10 === 0) {
      console.log(`Created ${i} notes...`);
    }
  }
  
  console.log(`Finished creating ${count} test notes`);
};

// You can run this function from your browser's console
(window as any).generateTestNotes = generateTestNotes; 
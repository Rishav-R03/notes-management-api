import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().min(1, 'enter a title'),
  content: z.string().min(1, 'enter content'),
  isPinned: z.boolean(),
  userId: z.string()
});

export default noteSchema;

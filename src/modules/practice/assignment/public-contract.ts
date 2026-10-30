/** Safe presentation only. Evaluation specifications never cross this boundary. */
export type PublicAssignment = {
  id: string;
  studentId: string;
  revision: number;
  subject: string;
  category: string;
  items: {
    id: string;
    position: number;
    prompt: string;
    responseType: string;
    answerUnit?: string;
    options?: { value: string; label: string }[];
    readingText?: { title: string; paragraphs: string[] };
  }[];
};

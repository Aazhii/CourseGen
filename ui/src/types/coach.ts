export interface CoachTextContent {
  title?: string;
  body: string;
}

export interface CoachQuizCardContent {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface CoachFlashcardContent {
  front: string;
  back: string;
}

export interface CoachStudyPlanStep {
  title: string;
  task: string;
  time: string;
}

export interface CoachStudyPlanContent {
  goal: string;
  duration: string;
  steps: CoachStudyPlanStep[];
}

export interface CoachBlock {
  type: "text" | "quiz_card" | "flashcard" | "study_plan";
  content: CoachTextContent | CoachQuizCardContent | CoachFlashcardContent | CoachStudyPlanContent;
}

export interface CoachResponse {
  intent: string;
  blocks: CoachBlock[];
  suggestions: string[];
}

export interface CoachRequest {
  courseId: string;
  lessonId?: string;
  message: string;
}


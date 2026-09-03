import { DEMO_PASSWORD, UserRole } from "@/constants/roles";

export type CourseType = "funtology" | "skintology" | "barbertology" | "nailtology";

export type CourseAssignment = {
  courseId: string;
  seats: number;
  usedSeats: number;
};

export type AppUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
  phone?: string;
  organization?: string;
  country?: string;
  state?: string;
  city?: string;
  streetAddress?: string;
  zipCode?: string;
  createdAt: string;
  teacherId?: string;
  assignments?: CourseAssignment[];
  status?: "ACTIVE" | "INACTIVE";
};

export type SurveyResponseSummary = {
  _id: string;
  userId: string;
  title: string;
  type?: string;
  createdAt: string;
};

export type Course = {
  _id: string;
  slug: CourseType;
  title: string;
  description: string;
  modules: number;
  lessons: number;
  students: number;
  status: "published" | "draft";
};

export type Lesson = {
  _id: string;
  title: string;
  type: "pdf" | "video" | "quiz";
  duration: string;
  summary: string;
};

export type Module = {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  duration?: string;
  order: number;
  lessons: Lesson[];
};

export type Quiz = {
  _id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description?: string;
  kind: "quiz" | "test" | "exam";
  questions: number;
  passingScore: number;
};

export type QuizQuestionItem = {
  _id: string;
  quizId: string;
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correctAnswer: string;
  points: number;
};

export type VideoItem = {
  _id: string;
  title: string;
  courseId: string;
  duration: string;
  fileName?: string;
};

export type Survey = {
  _id: string;
  title: string;
  description?: string;
  type?: "feedback" | "satisfaction" | "evaluation";
  targetRole?: "student" | "teacher";
  questions: number;
  responses: number;
  isActive?: boolean;
};

export type SurveyQuestionItem = {
  _id: string;
  surveyId: string;
  question: string;
  type: "yes_no" | "multiple_choice" | "rating" | "text";
  options: string[];
  required: boolean;
  order: number;
};

export type NotificationItem = {
  _id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  role: UserRole | "all";
};

export type ChatThread = {
  _id: string;
  name: string;
  role: UserRole;
  lastMessage: string;
  updatedAt: string;
};

export type ChatMessage = {
  _id: string;
  threadId: string;
  fromMe: boolean;
  text: string;
  createdAt: string;
};

export type Certificate = {
  _id: string;
  courseTitle: string;
  issuedAt: string;
  studentName: string;
};

const now = new Date().toISOString();

export const courses: Course[] = [
  {
    _id: "c-fun",
    slug: "funtology",
    title: "Funtology",
    description: "Foundational career and literacy pathway for beauty professionals.",
    modules: 6,
    lessons: 24,
    students: 38,
    status: "published",
  },
  {
    _id: "c-skin",
    slug: "skintology",
    title: "Skintology",
    description: "Skin care science, services, and salon-ready practice.",
    modules: 5,
    lessons: 18,
    students: 22,
    status: "published",
  },
  {
    _id: "c-barb",
    slug: "barbertology",
    title: "Barbertology",
    description: "Barbering techniques, client care, and shop operations.",
    modules: 4,
    lessons: 16,
    students: 17,
    status: "published",
  },
  {
    _id: "c-nail",
    slug: "nailtology",
    title: "Nailtology",
    description: "Nail technology, sanitation, and creative application.",
    modules: 4,
    lessons: 14,
    students: 11,
    status: "draft",
  },
];

export const modules: Module[] = [
  {
    _id: "m-fun-1",
    courseId: "c-fun",
    title: "Welcome to Funtology",
    description: "Orientation to the lifetime Funtology pathway.",
    duration: "35 min",
    order: 1,
    lessons: [
      { _id: "l-1", title: "Program overview", type: "pdf", duration: "12 min", summary: "How the lifetime LMS pathway is structured." },
      { _id: "l-2", title: "Classroom expectations", type: "quiz", duration: "8 min", summary: "Community guidelines and learning habits." },
      { _id: "l-3", title: "Tools of the trade", type: "video", duration: "15 min", summary: "A walkthrough of materials used in later modules." },
    ],
  },
  {
    _id: "m-fun-2",
    courseId: "c-fun",
    title: "Literacy in the salon",
    description: "Reading and writing skills for client care.",
    duration: "19 min",
    order: 2,
    lessons: [
      { _id: "l-4", title: "Client intake forms", type: "pdf", duration: "10 min", summary: "Reading and completing professional paperwork." },
      { _id: "l-5", title: "Career vocabulary", type: "quiz", duration: "9 min", summary: "Key terms used across Funtology courses." },
    ],
  },
  {
    _id: "m-skin-1",
    courseId: "c-skin",
    title: "Skin fundamentals",
    description: "Core anatomy and consultation skills.",
    duration: "25 min",
    order: 1,
    lessons: [
      { _id: "l-6", title: "Skin layers", type: "pdf", duration: "14 min", summary: "Anatomy overview for esthetic practice." },
      { _id: "l-7", title: "Consultation basics", type: "video", duration: "11 min", summary: "How to greet and assess a client." },
    ],
  },
  {
    _id: "m-barb-1",
    courseId: "c-barb",
    title: "Shop foundations",
    description: "Daily shop hygiene and setup.",
    duration: "7 min",
    order: 1,
    lessons: [
      { _id: "l-8", title: "Sanitation checklist", type: "pdf", duration: "7 min", summary: "Daily shop hygiene standards." },
    ],
  },
  {
    _id: "m-fun-3",
    courseId: "c-fun",
    title: "Client conversations",
    description: "Practice professional language with guests.",
    duration: "22 min",
    order: 3,
    lessons: [
      { _id: "l-9", title: "Greeting a guest", type: "video", duration: "8 min", summary: "First-minute conversation." },
    ],
  },
  {
    _id: "m-fun-4",
    courseId: "c-fun",
    title: "Career planner",
    description: "Set goals for the year ahead.",
    duration: "18 min",
    order: 4,
    lessons: [
      { _id: "l-10", title: "Success planner", type: "pdf", duration: "10 min", summary: "Fill in your pathway goals." },
    ],
  },
  {
    _id: "m-fun-5",
    courseId: "c-fun",
    title: "Workplace safety",
    description: "Keep the classroom and salon safe.",
    duration: "16 min",
    order: 5,
    lessons: [
      { _id: "l-11", title: "Safety walkthrough", type: "quiz", duration: "6 min", summary: "Daily safety habits." },
    ],
  },
  {
    _id: "m-fun-6",
    courseId: "c-fun",
    title: "Capstone review",
    description: "Bring the first pathway together.",
    duration: "20 min",
    order: 6,
    lessons: [
      { _id: "l-12", title: "Pathway recap", type: "pdf", duration: "12 min", summary: "Review before certification." },
    ],
  },
  {
    _id: "m-nail-1",
    courseId: "c-nail",
    title: "Nail studio basics",
    description: "Sanitation and station setup.",
    duration: "14 min",
    order: 1,
    lessons: [
      { _id: "l-13", title: "Station checklist", type: "pdf", duration: "8 min", summary: "Prepare a nail station." },
    ],
  },
];

export const quizzes: Quiz[] = [
  { _id: "q-1", courseId: "c-fun", moduleId: "m-fun-1", title: "Welcome check-in", description: "Short check after orientation.", kind: "quiz", questions: 3, passingScore: 70 },
  { _id: "q-2", courseId: "c-fun", moduleId: "m-fun-2", title: "Literacy test", description: "Reading check for salon forms.", kind: "test", questions: 2, passingScore: 75 },
  { _id: "q-3", courseId: "c-skin", moduleId: "m-skin-1", title: "Skin fundamentals exam", description: "Exam covering anatomy basics.", kind: "exam", questions: 1, passingScore: 80 },
];

export const videos: VideoItem[] = [
  { _id: "v-1", title: "Orientation with the foundation", courseId: "c-fun", duration: "6:12" },
  { _id: "v-2", title: "Client conversation demo", courseId: "c-skin", duration: "9:40" },
  { _id: "v-3", title: "Shop floor walkthrough", courseId: "c-barb", duration: "8:05" },
];

export const surveys: Survey[] = [
  { _id: "s-1", title: "Course kickoff feedback", description: "How did the first week feel?", type: "feedback", targetRole: "student", questions: 3, responses: 14, isActive: true },
  { _id: "s-2", title: "Mid-pathway check", description: "Teacher check-in on classroom progress.", type: "evaluation", targetRole: "teacher", questions: 2, responses: 9, isActive: true },
];

export const surveyQuestions: SurveyQuestionItem[] = [
  { _id: "sq-1", surveyId: "s-1", question: "How clear was the first module?", type: "rating", options: [], required: true, order: 1 },
  { _id: "sq-2", surveyId: "s-1", question: "Would you recommend this pathway?", type: "yes_no", options: ["yes", "no"], required: true, order: 2 },
  { _id: "sq-3", surveyId: "s-1", question: "What should we improve?", type: "text", options: [], required: false, order: 3 },
  { _id: "sq-4", surveyId: "s-2", question: "How are students progressing?", type: "multiple_choice", options: ["Ahead", "On track", "Need support"], required: true, order: 1 },
  { _id: "sq-5", surveyId: "s-2", question: "Any classroom notes?", type: "text", options: [], required: false, order: 2 },
];

export const users: AppUser[] = [
  {
    _id: "u-admin",
    firstName: "Amina",
    lastName: "Cole",
    email: "admin@iteach.org",
    role: "admin",
    password: DEMO_PASSWORD,
    phone: "555-0100",
    status: "ACTIVE",
    createdAt: now,
  },
  {
    _id: "u-teacher-1",
    firstName: "Jordan",
    lastName: "Hayes",
    email: "teacher@iteach.org",
    role: "teacher",
    password: DEMO_PASSWORD,
    phone: "555-0142",
    organization: "Lincoln Career Academy",
    country: "United States",
    state: "Illinois",
    city: "Springfield",
    streetAddress: "410 Maple Ave",
    zipCode: "62704",
    status: "ACTIVE",
    createdAt: now,
    assignments: [
      { courseId: "c-fun", seats: 25, usedSeats: 2 },
      { courseId: "c-skin", seats: 10, usedSeats: 1 },
    ],
  },
  {
    _id: "u-teacher-2",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@iteach.org",
    role: "teacher",
    password: DEMO_PASSWORD,
    phone: "555-0188",
    organization: "Westside Technical High",
    country: "United States",
    state: "Ohio",
    city: "Columbus",
    streetAddress: "88 Grove Street",
    zipCode: "43215",
    status: "ACTIVE",
    createdAt: now,
    assignments: [{ courseId: "c-barb", seats: 12, usedSeats: 0 }],
  },
  {
    _id: "u-student-1",
    firstName: "Maya",
    lastName: "Brooks",
    email: "student@iteach.org",
    role: "student",
    password: DEMO_PASSWORD,
    phone: "555-0201",
    teacherId: "u-teacher-1",
    status: "ACTIVE",
    createdAt: now,
  },
  {
    _id: "u-student-2",
    firstName: "Luis",
    lastName: "Ortega",
    email: "luis.ortega@iteach.org",
    role: "student",
    password: DEMO_PASSWORD,
    phone: "555-0204",
    teacherId: "u-teacher-1",
    status: "ACTIVE",
    createdAt: now,
  },
  {
    _id: "u-student-3",
    firstName: "Nora",
    lastName: "Bennett",
    email: "nora.bennett@iteach.org",
    role: "student",
    password: DEMO_PASSWORD,
    phone: "555-0210",
    teacherId: "u-teacher-1",
    status: "ACTIVE",
    createdAt: now,
  },
];

export const surveyResponses: SurveyResponseSummary[] = [
  { _id: "sr-1", userId: "u-student-1", title: "Course kickoff feedback", type: "feedback", createdAt: now },
  { _id: "sr-2", userId: "u-student-2", title: "Course kickoff feedback", type: "feedback", createdAt: now },
  { _id: "sr-3", userId: "u-teacher-1", title: "Mid-pathway check", type: "evaluation", createdAt: now },
];

export const notifications: NotificationItem[] = [
  { _id: "n-1", title: "New teacher assigned", body: "Priya Nair received Barbertology with 12 student seats.", createdAt: now, isRead: false, role: "admin" },
  { _id: "n-2", title: "Student invited", body: "Maya Brooks joined your Funtology classroom.", createdAt: now, isRead: false, role: "teacher" },
  { _id: "n-3", title: "Module unlocked", body: "Literacy in the salon is now available in Funtology.", createdAt: now, isRead: false, role: "student" },
  { _id: "n-4", title: "Certificate ready", body: "A Funtology welcome certificate is waiting in your records.", createdAt: now, isRead: true, role: "student" },
];

export const threads: ChatThread[] = [
  { _id: "t-1", name: "Jordan Hayes", role: "teacher", lastMessage: "The new Funtology seats look great.", updatedAt: now },
  { _id: "t-2", name: "Maya Brooks", role: "student", lastMessage: "I finished the overview lesson.", updatedAt: now },
  { _id: "t-3", name: "Support", role: "admin", lastMessage: "Welcome to iTeach iFuntology.", updatedAt: now },
];

export const messages: ChatMessage[] = [
  { _id: "cm-1", threadId: "t-1", fromMe: false, text: "Thank you for assigning Funtology for life.", createdAt: now },
  { _id: "cm-2", threadId: "t-1", fromMe: true, text: "You are set — update seats anytime from Teachers.", createdAt: now },
  { _id: "cm-3", threadId: "t-2", fromMe: false, text: "I finished the overview lesson.", createdAt: now },
  { _id: "cm-4", threadId: "t-2", fromMe: true, text: "Nice work. Start Literacy in the salon next.", createdAt: now },
];

export const certificates: Certificate[] = [
  { _id: "cert-1", courseTitle: "Funtology", issuedAt: now, studentName: "Maya Brooks" },
];

export const quizQuestions = [
  { id: "qq-1", prompt: "What is the goal of iTeach iFuntology?", options: ["Sell products", "Support nonprofit career literacy", "Book Zoom classes", "Run an online shop"], answer: 1 },
  { id: "qq-2", prompt: "Who assigns lifetime course seats?", options: ["The student", "The teacher", "The admin", "The store"], answer: 2 },
  { id: "qq-3", prompt: "How do students join a classroom?", options: ["Public signup", "Teacher invitation", "Affiliate link", "Purchase order"], answer: 1 },
];

export const quizBank: QuizQuestionItem[] = [
  {
    _id: "qb-1",
    quizId: "q-1",
    question: "What is the goal of iTeach iFuntology?",
    type: "multiple_choice",
    options: ["Sell products", "Support nonprofit career literacy", "Book Zoom classes", "Run an online shop"],
    correctAnswer: "Support nonprofit career literacy",
    points: 10,
  },
  {
    _id: "qb-2",
    quizId: "q-1",
    question: "Who assigns lifetime course seats?",
    type: "multiple_choice",
    options: ["The student", "The teacher", "The admin", "The store"],
    correctAnswer: "The admin",
    points: 10,
  },
  {
    _id: "qb-3",
    quizId: "q-1",
    question: "Students join by public signup.",
    type: "true_false",
    options: ["true", "false"],
    correctAnswer: "false",
    points: 5,
  },
];

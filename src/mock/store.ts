import Cookies from "js-cookie";
import { DEMO_OTP } from "@/constants/roles";
import { UserRole } from "@/constants/roles";
import {
  AppUser,
  CourseAssignment,
  ChatMessage,
  Lesson,
  Module,
  Quiz,
  QuizQuestionItem,
  Survey,
  SurveyQuestionItem,
  VideoItem,
  courses,
  messages as seedMessages,
  surveyResponses as seedSurveyResponses,
  modules as seedModules,
  quizBank as seedQuizBank,
  quizzes as seedQuizzes,
  surveys as seedSurveys,
  surveyQuestions as seedSurveyQuestions,
  users as seedUsers,
  videos as seedVideos,
} from "./data";

const users = [...seedUsers];
const chatMessages = [...seedMessages];
const moduleList = seedModules.map((m) => ({ ...m, lessons: [...m.lessons] }));
const quizList = [...seedQuizzes];
const quizQuestionList = [...seedQuizBank];
const videoList = [...seedVideos];
const surveyList = [...seedSurveys];
const surveyQuestionList = [...seedSurveyQuestions];
const otpByEmail = new Map<string, string>();

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ok<T>(data: T, message = "Success") {
  return { status: true, message, data };
}

export function fail(message: string) {
  return { status: false, message, data: {} };
}

export function makeToken(user: AppUser) {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    }),
  );
  return `${header}.${payload}.mock`;
}

export function publicUser(user: AppUser) {
  const { password, ...rest } = user;
  return rest;
}

export function findUserByEmail(email: string) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string) {
  return users.find((u) => u._id === id);
}

export function enrichPerson(user: AppUser) {
  const base = publicUser(user);
  const surveyResponses = seedSurveyResponses.filter((r) => r.userId === user._id);
  const teacher = user.teacherId ? findUserById(user.teacherId) : undefined;
  const assignedCourses = (user.assignments ?? []).map((a) => ({
    ...a,
    title: courses.find((c) => c._id === a.courseId)?.title ?? a.courseId,
  }));
  const enrollments = (teacher?.assignments ?? []).map((a) => ({
    _id: `${user._id}-${a.courseId}`,
    courseType: courses.find((c) => c._id === a.courseId)?.title ?? a.courseId,
    status: "ACTIVE" as const,
    teacher: teacher
      ? { firstName: teacher.firstName, lastName: teacher.lastName, email: teacher.email }
      : undefined,
  }));

  return {
    ...base,
    status: user.status ?? "ACTIVE",
    studentCount: users.filter((u) => u.role === "student" && u.teacherId === user._id).length,
    assignedCourses,
    teacher: teacher
      ? { _id: teacher._id, firstName: teacher.firstName, lastName: teacher.lastName, email: teacher.email }
      : undefined,
    enrollments,
    surveyResponses,
  };
}

export function listTeachers() {
  return users.filter((u) => u.role === "teacher").map(enrichPerson);
}

export function listStudents(teacherId: string) {
  return users.filter((u) => u.role === "student" && u.teacherId === teacherId).map(enrichPerson);
}

export function listAllStudents() {
  return users.filter((u) => u.role === "student").map(enrichPerson);
}

export function createTeacher(input: Partial<AppUser> & { firstName: string; lastName: string; email: string; password: string }) {
  const user: AppUser = {
    _id: id("u-teacher"),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: input.password,
    role: "teacher",
    phone: input.phone,
    organization: input.organization,
    country: input.country,
    state: input.state,
    city: input.city,
    streetAddress: input.streetAddress,
    zipCode: input.zipCode,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    assignments: [],
  };
  users.push(user);
  return enrichPerson(user);
}

export function guestLogin(email: string, role: UserRole) {
  const existing = findUserByEmail(email);
  if (existing) {
    existing.role = role;
    return existing;
  }
  const local = email.split("@")[0] || role;
  const [firstName, lastName] = local.includes(".")
    ? local.split(".")
    : [local, role];
  const user: AppUser = {
    _id: id(`u-${role}`),
    firstName: firstName.replace(/^\w/, (c) => c.toUpperCase()),
    lastName: (lastName || role).replace(/^\w/, (c) => c.toUpperCase()),
    email,
    password: "bypass",
    role,
    createdAt: new Date().toISOString(),
    assignments:
      role === "teacher"
        ? [
            { courseId: "c-fun", seats: 25, usedSeats: 0 },
            { courseId: "c-skin", seats: 10, usedSeats: 0 },
          ]
        : undefined,
    teacherId: role === "student" ? "u-teacher-1" : undefined,
    status: "ACTIVE",
  };
  users.push(user);
  return user;
}

export function updateTeacherPassword(id: string, password: string) {
  const user = findUserById(id);
  if (!user) return null;
  user.password = password;
  return publicUser(user);
}

export function assignCourses(teacherId: string, assignments: CourseAssignment[]) {
  const user = findUserById(teacherId);
  if (!user) return null;
  user.assignments = assignments.map((a) => ({
    ...a,
    usedSeats: a.usedSeats ?? user.assignments?.find((x) => x.courseId === a.courseId)?.usedSeats ?? 0,
  }));
  return publicUser(user);
}

export function inviteStudent(teacherId: string, input: { firstName: string; lastName: string; email: string; password: string }) {
  const teacher = findUserById(teacherId);
  if (!teacher) return { error: "Teacher not found" };
  const totalSeats = (teacher.assignments ?? []).reduce((sum, a) => sum + a.seats, 0);
  const used = users.filter((u) => u.role === "student" && u.teacherId === teacherId).length;
  if (used >= totalSeats) return { error: "No student seats remaining" };
  const user: AppUser = {
    _id: `u-student-${Date.now()}`,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: input.password,
    role: "student",
    teacherId,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  const first = teacher.assignments?.[0];
  if (first) first.usedSeats += 1;
  return { user: enrichPerson(user) };
}

export function deleteStudent(teacherId: string, studentId: string) {
  const index = users.findIndex((u) => u._id === studentId && u.teacherId === teacherId);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

export function updateStudentPassword(teacherId: string, studentId: string, password: string) {
  const user = users.find((u) => u._id === studentId && u.teacherId === teacherId);
  if (!user) return null;
  user.password = password;
  return publicUser(user);
}

export function updateProfile(id: string, patch: Partial<AppUser>) {
  const user = findUserById(id);
  if (!user) return null;
  Object.assign(user, patch);
  return publicUser(user);
}

export function changeOwnPassword(id: string, current: string, next: string) {
  const user = findUserById(id);
  if (!user) return { error: "User not found" };
  if (user.password !== current) return { error: "Current password is incorrect" };
  user.password = next;
  return { user: publicUser(user) };
}

export function setOtp(email: string) {
  otpByEmail.set(email.toLowerCase(), DEMO_OTP);
  return DEMO_OTP;
}

export function verifyOtp(email: string, code: string) {
  return otpByEmail.get(email.toLowerCase()) === code;
}

export function resetPassword(email: string, code: string, password: string) {
  if (!verifyOtp(email, code)) return null;
  const user = findUserByEmail(email);
  if (!user) return null;
  user.password = password;
  otpByEmail.delete(email.toLowerCase());
  return publicUser(user);
}

export function persistSession(user: AppUser) {
  const token = makeToken(user);
  Cookies.set("accessToken", token, { expires: 30 });
  return token;
}

export function clearSession() {
  Cookies.remove("accessToken");
}

export function appendMessage(threadId: string, text: string): ChatMessage {
  const msg: ChatMessage = {
    _id: `cm-${Date.now()}`,
    threadId,
    fromMe: true,
    text,
    createdAt: new Date().toISOString(),
  };
  chatMessages.push(msg);
  return msg;
}

export function listMessages(threadId: string) {
  return chatMessages.filter((m) => m.threadId === threadId);
}

export function listModules(courseId?: string) {
  return courseId ? moduleList.filter((m) => m.courseId === courseId) : moduleList;
}

export function getModule(id: string) {
  return moduleList.find((m) => m._id === id);
}

export function createModule(input: { courseId: string; title: string; description?: string; duration?: string; order?: number }) {
  const mod: Module = {
    _id: id("m"),
    courseId: input.courseId,
    title: input.title,
    description: input.description,
    duration: input.duration,
    order: input.order ?? moduleList.filter((m) => m.courseId === input.courseId).length + 1,
    lessons: [],
  };
  moduleList.push(mod);
  return mod;
}

export function updateModule(moduleId: string, patch: Partial<Module>) {
  const mod = getModule(moduleId);
  if (!mod) return null;
  Object.assign(mod, patch);
  return mod;
}

export function deleteModule(moduleId: string) {
  const index = moduleList.findIndex((m) => m._id === moduleId);
  if (index === -1) return false;
  moduleList.splice(index, 1);
  return true;
}

export function createLesson(moduleId: string, input: Omit<Lesson, "_id">) {
  const mod = getModule(moduleId);
  if (!mod) return null;
  const lesson: Lesson = { ...input, _id: id("l") };
  mod.lessons.push(lesson);
  return lesson;
}

export function updateLesson(moduleId: string, lessonId: string, patch: Partial<Lesson>) {
  const mod = getModule(moduleId);
  const lesson = mod?.lessons.find((l) => l._id === lessonId);
  if (!lesson) return null;
  Object.assign(lesson, patch);
  return lesson;
}

export function deleteLesson(moduleId: string, lessonId: string) {
  const mod = getModule(moduleId);
  if (!mod) return false;
  const index = mod.lessons.findIndex((l) => l._id === lessonId);
  if (index === -1) return false;
  mod.lessons.splice(index, 1);
  return true;
}

export function listQuizzes(courseId?: string) {
  return courseId ? quizList.filter((q) => q.courseId === courseId) : quizList;
}

export function getQuiz(id: string) {
  return quizList.find((q) => q._id === id);
}

export function updateQuiz(quizId: string, patch: Partial<Quiz>) {
  const quiz = getQuiz(quizId);
  if (!quiz) return null;
  Object.assign(quiz, patch);
  return quiz;
}

export function listQuizQuestions(quizId: string) {
  return quizQuestionList.filter((q) => q.quizId === quizId);
}

export function createQuizQuestion(quizId: string, input: Omit<QuizQuestionItem, "_id" | "quizId">) {
  const question: QuizQuestionItem = { ...input, _id: id("qb"), quizId };
  quizQuestionList.push(question);
  const quiz = getQuiz(quizId);
  if (quiz) quiz.questions = listQuizQuestions(quizId).length;
  return question;
}

export function updateQuizQuestion(id: string, patch: Partial<QuizQuestionItem>) {
  const question = quizQuestionList.find((q) => q._id === id);
  if (!question) return null;
  Object.assign(question, patch);
  return question;
}

export function deleteQuizQuestion(id: string) {
  const index = quizQuestionList.findIndex((q) => q._id === id);
  if (index === -1) return false;
  const quizId = quizQuestionList[index].quizId;
  quizQuestionList.splice(index, 1);
  const quiz = getQuiz(quizId);
  if (quiz) quiz.questions = listQuizQuestions(quizId).length;
  return true;
}

export function listVideos() {
  return videoList;
}

export function createVideo(input: { title: string; courseId: string; duration?: string; fileName?: string }) {
  const video: VideoItem = {
    _id: id("v"),
    title: input.title,
    courseId: input.courseId,
    duration: input.duration || "0:00",
    fileName: input.fileName,
  };
  videoList.unshift(video);
  return video;
}

export function listSurveys() {
  return surveyList;
}

export function createSurvey(input: Omit<Survey, "_id" | "questions" | "responses">) {
  const survey: Survey = {
    ...input,
    _id: id("s"),
    questions: 0,
    responses: 0,
  };
  surveyList.unshift(survey);
  return survey;
}

export function getSurvey(id: string) {
  return surveyList.find((s) => s._id === id);
}

export function listSurveyQuestions(surveyId: string) {
  return surveyQuestionList.filter((q) => q.surveyId === surveyId).sort((a, b) => a.order - b.order);
}

function syncSurveyQuestionCount(surveyId: string) {
  const survey = getSurvey(surveyId);
  if (survey) survey.questions = listSurveyQuestions(surveyId).length;
}

export function createSurveyQuestion(surveyId: string, input: Omit<SurveyQuestionItem, "_id" | "surveyId">) {
  const question: SurveyQuestionItem = { ...input, _id: id("sq"), surveyId };
  surveyQuestionList.push(question);
  syncSurveyQuestionCount(surveyId);
  return question;
}

export function updateSurveyQuestion(id: string, patch: Partial<SurveyQuestionItem>) {
  const question = surveyQuestionList.find((q) => q._id === id);
  if (!question) return null;
  Object.assign(question, patch);
  return question;
}

export function deleteSurveyQuestion(id: string) {
  const index = surveyQuestionList.findIndex((q) => q._id === id);
  if (index === -1) return false;
  const surveyId = surveyQuestionList[index].surveyId;
  surveyQuestionList.splice(index, 1);
  syncSurveyQuestionCount(surveyId);
  return true;
}

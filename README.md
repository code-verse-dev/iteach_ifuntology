# iTeach iFuntology

Nonprofit LMS frontend for Funtology Career & Literacy Foundation. One React app with role-based routes for admin, teacher, and student.

## Run

```bash
npm install
npm run dev
```

Opens on [http://localhost:8080](http://localhost:8080).

## Demo accounts

Password for all roles: `Password123!`

- Admin: `admin@iteach.org`
- Teacher: `teacher@iteach.org`
- Student: `student@iteach.org`

Forgot-password demo OTP: `123456`

## Stack

Vite, React, TypeScript, Tailwind, shadcn/ui, Redux Toolkit Query, redux-persist — same patterns as the existing iFuntology teacher/student/admin apps.

UI currently uses in-memory mock APIs. Swap `queryFn` implementations in `src/redux/services/apiSlices` when the new backend is ready.

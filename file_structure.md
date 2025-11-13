EMPLOYEE_PORTAL/
│
├── __mocks__/
│   └── fileMock.js
│
├── __tests__/
│   └── smoke.test.tsx
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .vscode/
│   └── settings.json
│
├── dist/
│   ├── assets/
│   │   ├── hh_careers_logo.svg
│   │   └── vite.svg
│   ├── index.html
│   └── vite.svg
│
├── node_modules/
│
├── public/
│   ├── hh_careers_logo.svg
│   └── vite.svg
│
├── src/
│   ├── api/
│   │   ├── sendConfirmation.ts
│   │   └── sendConfirmationEmail.ts
│   │
│   ├── assets/
│   │   ├── hh_careers_logo.png
│   │   └── react.svg
│   │
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── EmployeeLayout.tsx
│   │   │   └── GuestLayout.tsx
│   │   │
│   │   ├── payroll/
│   │   │   ├── InvoiceModal.tsx
│   │   │   ├── InvoicePreview.tsx
│   │   │   ├── PayrollInvoicesTab.tsx
│   │   │   ├── PayrollItemsTab.tsx
│   │   │   ├── PayrollPeriodsTab.tsx
│   │   │   └── PayrollTabs.tsx
│   │   │
│   │   ├── quiz/
│   │   │   └── Quiz.tsx
│   │   │
│   │   ├── security/
│   │   │   ├── CameraLogs.tsx
│   │   │   ├── CashRemovalForm.tsx
│   │   │   ├── CashRemovalTab.tsx
│   │   │   ├── CCTVForm.tsx
│   │   │   ├── CCTVLogsTab.tsx
│   │   │   ├── CCTVTab.tsx
│   │   │   ├── ClockLogForm.tsx
│   │   │   ├── ClockLogsTab.tsx
│   │   │   ├── DoorLogForm.tsx
│   │   │   ├── DoorLogsTab.tsx
│   │   │   ├── EmployeeViolationForm.tsx
│   │   │   ├── EmployeeViolationsTab.tsx
│   │   │   ├── IncidentReportsTab.tsx
│   │   │   ├── IncidentReportForm.tsx
│   │   │   ├── SafeRoomForm.tsx
│   │   │   ├── SafeRoomTab.tsx
│   │   │   ├── SoldOutForm.tsx
│   │   │   ├── SoldOutTab.tsx
│   │   │   └── ...
│   │   │
│   │   ├── Button.tsx
│   │   ├── FloatingMessenger.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── hooks/
│   │   ├── useInvoice.ts
│   │   ├── useMessages.ts
│   │   ├── usePayroll.ts
│   │   ├── useQuiz.ts
│   │   ├── useSessionRedirect.ts
│   │   └── useUnreadMessages.ts
│   │
│   ├── lib/
│   │   ├── supabaseAdminClient.ts
│   │   └── supabaseClient.ts
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── EmployeeForm/
│   │   │   │   ├── EmployeeForm.tsx
│   │   │   │   ├── EmployeeTypeSection.tsx
│   │   │   │   ├── EmploymentDetailsSection.tsx
│   │   │   │   ├── PersonalInfoSection.tsx
│   │   │   │   ├── WeCardCertificationSection.tsx
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── schedule/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── ScheduleForm.tsx
│   │   │   │   ├── ScheduleListView.tsx
│   │   │   │   ├── SchedulePage.tsx
│   │   │   │   ├── ScheduleToolbar.tsx
│   │   │   │   ├── scheduleUtils.ts
│   │   │   │   ├── ScheduleWeekView.tsx
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── AdminHome.tsx
│   │   │   ├── AgreementManager.tsx
│   │   │   ├── AgreementPreview.tsx
│   │   │   ├── AgreementTracker.tsx
│   │   │   ├── AnnouncementForm.tsx
│   │   │   ├── Announcements.tsx
│   │   │   ├── Applications.tsx
│   │   │   ├── EmployeeForm.tsx   (duplicate naming but different path)
│   │   │   ├── Employees.tsx
│   │   │   ├── PayrollManager.tsx
│   │   │   ├── QuizEditor.tsx
│   │   │   ├── ShiftLogs.tsx
│   │   │   ├── TimeOff.tsx
│   │   │   ├── TimeOffForm.tsx
│   │   │   ├── TrainingManager.tsx
│   │   │   ├── TrainingPreview.tsx
│   │   │   └── TrainingTracker.tsx
│   │   │
│   │   ├── agreement/
│   │   │   ├── AgreementDetail.tsx
│   │   │   └── AgreementList.tsx
│   │   │
│   │   ├── employee/
│   │   │   ├── EmpAnnouncements.tsx
│   │   │   ├── EmpHome.tsx
│   │   │   ├── EmpPayroll.tsx
│   │   │   ├── EmpSchedule.tsx
│   │   │   ├── EmpTasks.tsx
│   │   │   ├── EmpTimeIn.tsx
│   │   │   ├── EmpTimeOff.tsx
│   │   │   ├── EmpTimeOffForm.tsx
│   │   │   └── EndOfShiftReportModal.tsx
│   │   │
│   │   ├── jobs/
│   │   │   ├── JobApplication.tsx
│   │   │   ├── JobApplicationWizard.tsx
│   │   │   ├── JobDetail.tsx
│   │   │   ├── JobList.tsx
│   │   │   ├── JobManager.tsx
│   │   │   ├── quizData.ts
│   │   │   ├── StepApplicantInfo.tsx
│   │   │   ├── StepAvailability.tsx
│   │   │   ├── StepConfirm.tsx
│   │   │   └── StepQuiz.tsx
│   │   │
│   │   ├── messaging/
│   │   │   ├── Chat.tsx
│   │   │   ├── ChatRoute.tsx
│   │   │   └── Inbox.tsx
│   │   │
│   │   ├── security/
│   │   │   └── SecurityLogsManager.tsx
│   │   │
│   │   ├── tasks/
│   │   │   ├── TaskDetail.tsx
│   │   │   └── TaskManager.tsx
│   │   │
│   │   ├── training/
│   │   │   ├── TrainingDetail.tsx
│   │   │   ├── TrainingList.tsx
│   │   │   └── TrainingQuiz.tsx
│   │   │
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Hiring.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   └── Profile.tsx
│   │
│   ├── styles/
│   │   └── layout.css
│   │
│   ├── types/
│   │   ├── payroll.ts
│   │   └── react-signature-canvas.d.ts
│   │
│   ├── utils/
│   │   ├── confirm.tsx
│   │   ├── notify.ts
│   │   └── utils.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── theme.ts
│
├── supabase/
│   ├── .temp/
│   └── functions/
│       ├── send-application-confirmation/
│       │   └── index.ts
│       ├── send-interview-confirmation/
│       │   └── index.ts
│       └── send-welcome-email/
│           └── index.ts
│
├── .env
├── .env.example
├── .eslintrc.json
├── CONTRIBUTING.md
├── employee_portal_schema.md
├── 10-27-25-employee_portal_schema.json
├── eslint.config.js
├── global.d.ts
├── index.html
├── jest.config.ts
├── jest.setup.ts
├── LICENSE
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── README.md
├── supabase_d1_db_schema.sql
├── supabase.tar.gz
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.test.json
├── vercel.json
└── vite.config.ts

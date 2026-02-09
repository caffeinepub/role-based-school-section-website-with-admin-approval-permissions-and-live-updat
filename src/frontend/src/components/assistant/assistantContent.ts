// Role-specific guidance content for the assistant
export type UserRole = 'admin' | 'student' | 'visitor';

export interface GuidanceContent {
  intent: string;
  keywords: string[];
  response: string;
  role?: UserRole[];
}

export const guidanceContent: GuidanceContent[] = [
  // Admin-only guidance
  {
    intent: 'approve_applications',
    keywords: ['approve', 'application', 'accept', 'student request', 'pending'],
    response: 'To approve student applications:\n1. Go to the Admin Dashboard\n2. Find the "Pending Applications" section\n3. Review each application\n4. Click "Approve" to accept or "Reject" to decline\n\nApproved students can then log in with their credentials.',
    role: ['admin']
  },
  {
    intent: 'promote_editor',
    keywords: ['promote', 'editor', 'permission', 'role', 'upgrade'],
    response: 'To promote a student to editor:\n1. Go to the Admin Dashboard\n2. Find the "Approved Students" section\n3. Locate the student you want to promote\n4. Click "Promote to Editor"\n\nEditors can create and edit notices, homework, routines, and schedules.',
    role: ['admin']
  },
  {
    intent: 'demote_editor',
    keywords: ['demote', 'remove editor', 'downgrade', 'revoke permission'],
    response: 'To demote an editor back to student:\n1. Go to the Admin Dashboard\n2. Find the "Approved Students" section\n3. Locate the editor you want to demote\n4. Click "Demote to Student"\n\nThey will lose editing permissions but can still view all content.',
    role: ['admin']
  },
  {
    intent: 'master_lock',
    keywords: ['master lock', 'lock everything', 'freeze all', 'global lock'],
    response: 'The Master Lock prevents ALL editing across the entire system:\n1. Go to the Admin Dashboard\n2. Find the "Lock Controls" section\n3. Toggle "Master Lock"\n\nWhen enabled, no one (including editors) can create, edit, or delete any content.',
    role: ['admin']
  },
  {
    intent: 'section_lock',
    keywords: ['section lock', 'lock notices', 'lock homework', 'lock routine', 'lock schedule'],
    response: 'Section Locks prevent editing in specific areas:\n1. Go to the Admin Dashboard\n2. Find the "Lock Controls" section\n3. Toggle locks for Notices, Homework, Routine, or Class Schedule\n\nSection locks only affect that specific section, not the entire system.',
    role: ['admin']
  },
  {
    intent: 'item_lock',
    keywords: ['item lock', 'lock single', 'lock specific', 'individual lock'],
    response: 'Item Locks prevent editing of individual items:\n1. Go to the specific page (Notices, Homework, etc.)\n2. Find the item you want to lock\n3. Click the lock icon next to that item\n\nItem locks only affect that one item, not the entire section.',
    role: ['admin']
  },
  
  // Student/Visitor guidance
  {
    intent: 'find_notices',
    keywords: ['notice', 'announcement', 'news', 'updates', 'where find'],
    response: 'To view notices and announcements:\n1. Click "Notices" in the navigation menu\n2. You\'ll see all recent notices and announcements\n3. The latest notices appear at the top\n\nNotices are visible to everyone, including visitors.',
    role: ['student', 'visitor']
  },
  {
    intent: 'find_homework',
    keywords: ['homework', 'assignment', 'task', 'due date'],
    response: 'To view homework assignments:\n1. Click "Homework" in the navigation menu\n2. You\'ll see all homework with due dates, subjects, and teachers\n3. Assignments are sorted by due date\n\nHomework is visible to everyone, including visitors.',
    role: ['student', 'visitor']
  },
  {
    intent: 'find_routine',
    keywords: ['routine', 'class routine', 'schedule', 'timetable', 'periods'],
    response: 'To view the class routine:\n1. Click "Class Routine" in the navigation menu\n2. You\'ll see the weekly routine with all periods\n3. Each day shows subjects, teachers, and timings\n\nThe routine is visible to everyone, including visitors.',
    role: ['student', 'visitor']
  },
  {
    intent: 'find_schedule',
    keywords: ['class schedule', 'class time', 'when class', 'timing'],
    response: 'To view class schedules:\n1. Click "Class Schedule" in the navigation menu\n2. You\'ll see all classes organized by day\n3. Each entry shows the subject, teacher, and time\n\nThe schedule is visible to everyone, including visitors.',
    role: ['student', 'visitor']
  },
  {
    intent: 'login_help',
    keywords: ['login', 'sign in', 'how to login', 'access'],
    response: 'To log in:\n• Students: Use your approved username and password\n• Visitors: Enter the visitor password\n• Admins: Use the admin password\n\nIf you\'re a new student, you need to apply first and wait for admin approval.',
    role: ['student', 'visitor']
  },
  {
    intent: 'logout_help',
    keywords: ['logout', 'sign out', 'exit', 'leave'],
    response: 'To log out:\n1. Click the "Logout" button in the top-right corner\n2. You\'ll be returned to the role selection page\n\nYour session will be cleared and you\'ll need to log in again to access the portal.',
    role: ['student', 'visitor', 'admin']
  },
  
  // General help
  {
    intent: 'navigation',
    keywords: ['navigate', 'menu', 'how to use', 'where is'],
    response: 'Navigation:\n• Use the menu at the top to access different sections\n• On mobile, tap the menu icon (☰) to see all options\n• The Home page shows a quick overview of everything\n\nAll main features are accessible from the navigation menu.',
    role: ['student', 'visitor', 'admin']
  },
  {
    intent: 'home_page',
    keywords: ['home', 'dashboard', 'overview', 'main page'],
    response: 'The Home page shows:\n• Welcome message with your role\n• Latest notices\n• Today\'s routine\n• Quick access cards to all sections\n• Admin-only sections (if you\'re an admin)\n\nClick "Home" in the menu to return to the main dashboard.',
    role: ['student', 'visitor', 'admin']
  }
];

export const exampleQuestions: Record<UserRole, string[]> = {
  admin: [
    'How do I approve student applications?',
    'How do I promote a student to editor?',
    'How do master locks work?',
    'How do I lock a specific section?'
  ],
  student: [
    'Where can I find notices?',
    'How do I view homework?',
    'Where is the class routine?',
    'How do I log out?'
  ],
  visitor: [
    'Where can I find notices?',
    'How do I view the class schedule?',
    'Where is the class routine?',
    'How do I log in?'
  ]
};

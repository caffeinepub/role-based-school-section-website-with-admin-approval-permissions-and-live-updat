import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet, redirect, ErrorComponent } from '@tanstack/react-router';
import { AuthProvider, useAuth } from './auth/AuthContext';
import RuntimeErrorBoundary from './components/RuntimeErrorBoundary';
import RuntimeErrorFallback from './components/RuntimeErrorFallback';
import RoleSelectPage from './pages/RoleSelectPage';
import VisitorLoginPage from './pages/VisitorLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import StudentApplyPage from './pages/StudentApplyPage';
import StudentLoginPage from './pages/StudentLoginPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HomePage from './pages/HomePage';
import NoticesPage from './pages/NoticesPage';
import HomeworkPage from './pages/HomeworkPage';
import ClassRoutinePage from './pages/ClassRoutinePage';
import ClassTimeSchedulePage from './pages/ClassTimeSchedulePage';
import AppLayout from './components/AppLayout';

function RootComponent() {
  const { sessionRole } = useAuth();
  
  // If authenticated, show app layout with navigation
  if (sessionRole && sessionRole !== 'pending' && sessionRole !== 'unauthenticated') {
    return <AppLayout><Outlet /></AppLayout>;
  }
  
  // Otherwise show page without layout
  return <Outlet />;
}

const rootRoute = createRootRoute({
  component: RootComponent,
  errorComponent: ({ error }) => {
    console.error('Router error:', error);
    return <RuntimeErrorFallback error={error as Error} />;
  }
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RoleSelectPage,
  beforeLoad: ({ context }) => {
    const auth = context as { sessionRole?: string };
    // Redirect authenticated users to home
    if (auth.sessionRole && auth.sessionRole !== 'pending' && auth.sessionRole !== 'unauthenticated') {
      throw redirect({ to: '/home' });
    }
  }
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: HomePage,
  beforeLoad: ({ context }) => {
    const auth = context as { sessionRole?: string };
    if (!auth.sessionRole || auth.sessionRole === 'pending' || auth.sessionRole === 'unauthenticated') {
      throw redirect({ to: '/' });
    }
  }
});

const visitorLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/visitor-login',
  component: VisitorLoginPage
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-login',
  component: AdminLoginPage
});

const studentApplyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-apply',
  component: StudentApplyPage
});

const studentLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-login',
  component: StudentLoginPage
});

const pendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pending',
  component: PendingApprovalPage,
  beforeLoad: ({ context }) => {
    const auth = context as { sessionRole?: string };
    if (auth.sessionRole !== 'pending') {
      throw redirect({ to: '/' });
    }
  }
});

const pendingApprovalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pending-approval',
  component: PendingApprovalPage,
  beforeLoad: ({ context }) => {
    const auth = context as { sessionRole?: string };
    if (auth.sessionRole !== 'pending') {
      throw redirect({ to: '/' });
    }
  }
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
  beforeLoad: ({ context }) => {
    const auth = context as { sessionRole?: string };
    if (auth.sessionRole !== 'admin') {
      throw redirect({ to: '/' });
    }
  }
});

const noticesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notices',
  component: NoticesPage,
  beforeLoad: ({ context }) => {
    const auth = context as { sessionRole?: string };
    if (!auth.sessionRole || auth.sessionRole === 'pending' || auth.sessionRole === 'unauthenticated') {
      throw redirect({ to: '/' });
    }
  }
});

const homeworkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/homework',
  component: HomeworkPage,
  beforeLoad: ({ context }) => {
    const auth = context as { sessionRole?: string };
    if (!auth.sessionRole || auth.sessionRole === 'pending' || auth.sessionRole === 'unauthenticated') {
      throw redirect({ to: '/' });
    }
  }
});

const routineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/routine',
  component: ClassRoutinePage,
  beforeLoad: ({ context }) => {
    const auth = context as { sessionRole?: string };
    if (!auth.sessionRole || auth.sessionRole === 'pending' || auth.sessionRole === 'unauthenticated') {
      throw redirect({ to: '/' });
    }
  }
});

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedule',
  component: ClassTimeSchedulePage,
  beforeLoad: ({ context }) => {
    const auth = context as { sessionRole?: string };
    if (!auth.sessionRole || auth.sessionRole === 'pending' || auth.sessionRole === 'unauthenticated') {
      throw redirect({ to: '/' });
    }
  }
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  homeRoute,
  visitorLoginRoute,
  adminLoginRoute,
  studentApplyRoute,
  studentLoginRoute,
  pendingRoute,
  pendingApprovalRoute,
  adminDashboardRoute,
  noticesRoute,
  homeworkRoute,
  routineRoute,
  scheduleRoute
]);

const router = createRouter({ 
  routeTree,
  context: {
    sessionRole: undefined
  },
  defaultErrorComponent: ({ error }) => {
    console.error('Default router error:', error);
    return <RuntimeErrorFallback error={error as Error} />;
  }
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppWithAuth() {
  const { sessionRole } = useAuth();
  
  return <RouterProvider router={router} context={{ sessionRole }} />;
}

export default function App() {
  return (
    <RuntimeErrorBoundary>
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </RuntimeErrorBoundary>
  );
}

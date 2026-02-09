import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { BackgroundMusicProvider } from './music/BackgroundMusicProvider';

import RoleSelectPage from './pages/RoleSelectPage';
import VisitorLoginPage from './pages/VisitorLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import StudentApplyPage from './pages/StudentApplyPage';
import StudentLoginPage from './pages/StudentLoginPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NoticesPage from './pages/NoticesPage';
import HomeworkPage from './pages/HomeworkPage';
import ClassRoutinePage from './pages/ClassRoutinePage';
import ClassTimeSchedulePage from './pages/ClassTimeSchedulePage';
import HomePage from './pages/HomePage';
import AppLayout from './components/AppLayout';
import RuntimeErrorBoundary from './components/RuntimeErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function RootComponent() {
  const { sessionRole } = useAuth();
  const isAuthenticated = sessionRole !== 'unauthenticated';
  
  return (
    <RuntimeErrorBoundary>
      {isAuthenticated ? (
        <BackgroundMusicProvider>
          <AppLayout>
            <Outlet />
          </AppLayout>
        </BackgroundMusicProvider>
      ) : (
        <Outlet />
      )}
    </RuntimeErrorBoundary>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RoleSelectPage,
  beforeLoad: ({ context }) => {
    const auth = (context as any).auth;
    const isAuthenticated = auth?.sessionRole && auth.sessionRole !== 'unauthenticated';
    if (isAuthenticated) {
      throw redirect({ to: '/home' });
    }
  },
});

const visitorLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/visitor-login',
  component: VisitorLoginPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-login',
  component: AdminLoginPage,
});

const studentApplyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-apply',
  component: StudentApplyPage,
});

const studentLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-login',
  component: StudentLoginPage,
});

const pendingApprovalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pending-approval',
  component: PendingApprovalPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: HomePage,
  beforeLoad: ({ context }) => {
    const auth = (context as any).auth;
    const isAuthenticated = auth?.sessionRole && auth.sessionRole !== 'unauthenticated';
    if (!isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

const noticesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notices',
  component: NoticesPage,
  beforeLoad: ({ context }) => {
    const auth = (context as any).auth;
    const isAuthenticated = auth?.sessionRole && auth.sessionRole !== 'unauthenticated';
    if (!isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

const homeworkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/homework',
  component: HomeworkPage,
  beforeLoad: ({ context }) => {
    const auth = (context as any).auth;
    const isAuthenticated = auth?.sessionRole && auth.sessionRole !== 'unauthenticated';
    if (!isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

const routineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/routine',
  component: ClassRoutinePage,
  beforeLoad: ({ context }) => {
    const auth = (context as any).auth;
    const isAuthenticated = auth?.sessionRole && auth.sessionRole !== 'unauthenticated';
    if (!isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedule',
  component: ClassTimeSchedulePage,
  beforeLoad: ({ context }) => {
    const auth = (context as any).auth;
    const isAuthenticated = auth?.sessionRole && auth.sessionRole !== 'unauthenticated';
    if (!isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
  beforeLoad: ({ context }) => {
    const auth = (context as any).auth;
    const isAuthenticated = auth?.sessionRole && auth.sessionRole !== 'unauthenticated';
    if (!isAuthenticated) {
      throw redirect({ to: '/' });
    }
    if (!auth?.isAdmin) {
      throw redirect({ to: '/home' });
    }
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  visitorLoginRoute,
  adminLoginRoute,
  studentApplyRoute,
  studentLoginRoute,
  pendingApprovalRoute,
  homeRoute,
  noticesRoute,
  homeworkRoute,
  routineRoute,
  scheduleRoute,
  adminRoute,
]);

const router = createRouter({
  routeTree,
  context: { auth: undefined },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ auth }} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

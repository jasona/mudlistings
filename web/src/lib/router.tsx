import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { ProtectedRoute, AdminRoute, SiteAdminRoute } from '@/components/features/protected-route';
import { Layout } from '@/components/features/layout';

// Loading fallback
function PageLoader() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/home'));
const BrowsePage = lazy(() => import('@/pages/browse'));
const MudDetailPage = lazy(() => import('@/pages/mud-detail'));
const ProfilePage = lazy(() => import('@/pages/profile'));
const FavoritesPage = lazy(() => import('@/pages/favorites'));

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/login'));
const RegisterPage = lazy(() => import('@/pages/auth/register'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/verify-email'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password'));

// MUD Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/dashboard'));
const EditMudPage = lazy(() => import('@/pages/admin/edit-mud'));
const MudAnalyticsPage = lazy(() => import('@/pages/admin/analytics'));
const ClaimMudPage = lazy(() => import('@/pages/admin/claim-mud'));

// Site Admin pages
const ModerationPage = lazy(() => import('@/pages/site-admin/moderation'));
const ImportPage = lazy(() => import('@/pages/site-admin/import'));
const FeaturedManagementPage = lazy(() => import('@/pages/site-admin/featured'));
const UserManagementPage = lazy(() => import('@/pages/site-admin/users'));
const AuditLogPage = lazy(() => import('@/pages/site-admin/audit-log'));

// Static pages
const AboutPage = lazy(() => import('@/pages/static/about'));
const WhatIsMudPage = lazy(() => import('@/pages/static/what-is-mud'));
const FaqPage = lazy(() => import('@/pages/static/faq'));
const TermsPage = lazy(() => import('@/pages/static/terms'));
const PrivacyPage = lazy(() => import('@/pages/static/privacy'));
const NotFoundPage = lazy(() => import('@/pages/not-found'));

// Wrapper for lazy-loaded pages
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <SuspenseWrapper>
          <Outlet />
        </SuspenseWrapper>
      </Layout>
    ),
    children: [
      // Public routes
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'browse',
        element: <BrowsePage />,
      },
      {
        path: 'muds/:slug',
        element: <MudDetailPage />,
      },
      {
        path: 'users/:userId',
        element: <ProfilePage />,
      },
      {
        path: 'genres/:genreSlug',
        element: <BrowsePage />,
      },

      // Auth routes
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },

      // Protected routes (requires authentication)
      {
        path: 'favorites',
        element: (
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'muds/:slug/claim',
        element: (
          <ProtectedRoute>
            <ClaimMudPage />
          </ProtectedRoute>
        ),
      },

      // MUD Admin routes
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <Outlet />
          </AdminRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: 'muds/:mudId/edit',
            element: <EditMudPage />,
          },
          {
            path: 'muds/:mudId/analytics',
            element: <MudAnalyticsPage />,
          },
        ],
      },

      // Site Admin routes
      {
        path: 'site-admin',
        element: (
          <SiteAdminRoute>
            <Outlet />
          </SiteAdminRoute>
        ),
        children: [
          {
            path: 'moderation',
            element: <ModerationPage />,
          },
          {
            path: 'import',
            element: <ImportPage />,
          },
          {
            path: 'featured',
            element: <FeaturedManagementPage />,
          },
          {
            path: 'users',
            element: <UserManagementPage />,
          },
          {
            path: 'audit-log',
            element: <AuditLogPage />,
          },
        ],
      },

      // Static pages
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'what-is-mud',
        element: <WhatIsMudPage />,
      },
      {
        path: 'faq',
        element: <FaqPage />,
      },
      {
        path: 'terms',
        element: <TermsPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
      },

      // 404
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

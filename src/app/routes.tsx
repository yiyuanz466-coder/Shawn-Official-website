import { createBrowserRouter } from 'react-router'
import { LangLayout } from '../layout/LangLayout/LangLayout'
import { AboutPage } from '../pages/AboutPage/AboutPage'
import { HomePage } from '../pages/HomePage/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage'
import { RootRedirect } from './RootRedirect'
import { RouteError } from './RouteError/RouteError'

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  {
    path: '/:lang',
    element: <LangLayout />,
    errorElement: <RouteError />,
    children: [
      {
        // 沒有 path 的外層：頁面出錯時保留 Header / Footer
        errorElement: <RouteError />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: 'work/:slug',
            lazy: async () => ({ Component: (await import('../pages/CaseStudyPage/CaseStudyPage')).CaseStudyPage }),
          },
          { path: 'about', element: <AboutPage /> },
          {
            path: 'design-system',
            lazy: async () => ({
              Component: (await import('../pages/DesignSystemPage/DesignSystemPage')).DesignSystemPage,
            }),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])

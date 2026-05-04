import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, Switch } from 'wouter';
import './index.css';

import Home from './pages/Home';
import ProjectPage from './pages/Project';
import Settings from './pages/Settings';
import Preview from './pages/Preview';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/project/:id" component={ProjectPage} />
      <Route path="/settings" component={Settings} />
      <Route path="/preview/:type/:id" component={Preview} />
      <Route>
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-gray-500">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-400 mb-4">404</h1>
            <p>Page Not Found</p>
            <a href="/" className="mt-8 px-6 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors">Return Home</a>
        </div>
      </Route>
    </Switch>
  </StrictMode>,
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { LessonProvider } from "./components/LessonContext.jsx";
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <BrowserRouter>
    <LessonProvider>
      <App />
    </LessonProvider>
  </BrowserRouter>
</React.StrictMode>

);

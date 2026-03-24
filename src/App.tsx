/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentFlow from './pages/StudentFlow';
import AdminDashboard from './pages/AdminDashboard';
import StudentSuccess from './pages/StudentSuccess';
import SearchPage from './pages/SearchPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to CSE ICP */}
        <Route path="/" element={<Navigate to="/cseicp" replace />} />

        {/* CSE ICP routes */}
        <Route path="/cseicp" element={<StudentFlow stream="CSE ICP" />} />
        <Route path="/cseicp/success" element={<StudentSuccess />} />

        {/* AIML ICP routes */}
        <Route path="/aimlicp" element={<StudentFlow stream="AIML ICP" />} />
        <Route path="/aimlicp/success" element={<StudentSuccess />} />

        {/* Legacy routes — redirect to new structure */}
        <Route path="/submit" element={<Navigate to="/cseicp" replace />} />
        <Route path="/success" element={<Navigate to="/cseicp/success" replace />} />

        {/* Admin dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Public Search Page */}
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </BrowserRouter>
  );
}

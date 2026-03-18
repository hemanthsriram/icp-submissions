/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudentFlow from './pages/StudentFlow';
import AdminDashboard from './pages/AdminDashboard';
import StudentSuccess from './pages/StudentSuccess';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentFlow />} />
        <Route path="/submit" element={<StudentFlow />} />
        <Route path="/success" element={<StudentSuccess />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

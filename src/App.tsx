import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import DetailPage from './components/VideoDetail/DetailPage';
import Header from './components/Layout/Header';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/video/:videoId" element={<DetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

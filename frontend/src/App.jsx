import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import Plans from './pages/Plans';
import Training from './pages/Training';
import Progress from './pages/Progress';
import Share from './pages/Share';

export default function App() {
  const [currentPage, setCurrentPage] = useState('/');

  const renderPage = () => {
    switch (currentPage) {
      case '/':
        return <Dashboard />;
      case '/exercises':
        return <Exercises />;
      case '/plans':
        return <Plans />;
      case '/training':
        return <Training />;
      case '/progress':
        return <Progress />;
      case '/share':
        return <Share />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="max-w-7xl mx-auto">
        {renderPage()}
      </main>
    </div>
  );
}

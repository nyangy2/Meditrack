import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
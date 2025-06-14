// components/SidebarLayout.jsx
import Sidebar from './Sidebar';
import Footer from './Footer';

function SidebarLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* 왼쪽에 Sidebar */}
      <Sidebar />

      {/* 오른쪽에 Main + Footer 세로 배치 */}
      <div className="flex flex-col flex-1">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export default SidebarLayout;

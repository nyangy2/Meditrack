// components/HeaderFooterLayout.jsx
import Header from './Header';
import Footer from './Footer';

function HeaderFooterLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default HeaderFooterLayout;

import { useEffect } from 'react';
import '../styles/styles.css';

function OtcMeds() {
  useEffect(() => {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const cards = document.querySelectorAll('.medication-card');

    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.getAttribute('data-category');

        cards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          card.style.display = category === 'all' || category === cardCategory ? 'flex' : 'none';
        });
      });
    });
  }, []);

  return (
    <div className="dashboard-layout">
      <main className="main-content">
        <header className="content-header">
          <button className="sidebar-toggle">
            <i className="fas fa-bars"></i>
          </button>
          <h1>상비약 구비</h1>
          <div className="header-actions">
            <button className="btn icon-btn"><i className="fas fa-bell"></i></button>
            <button className="btn icon-btn"><i className="fas fa-cog"></i></button>
          </div>
        </header>

        <div className="content-body">
          <div className="card">
            <div className="card-header">
              <h3>필수 상비약 추천</h3>
            </div>
            <div className="card-body">
              <p className="info-text">가정에서 구비하면 좋은 필수 상비약을 추천해 드립니다.</p>

              <div className="category-filter">
                {['all', 'cold', 'digestive', 'pain', 'wound', 'allergy'].map((cat) => (
                  <button key={cat} className={`category-btn${cat === 'all' ? ' active' : ''}`} data-category={cat}>
                    {categoryLabel(cat)}
                  </button>
                ))}
              </div>

              <div className="medication-grid">
                {dummyMeds.map((med, i) => (
                  <div key={i} className="medication-card" data-category={med.category}>
                    <div className="medication-image">
                      <img src={med.image} alt={med.name} />
                    </div>
                    <div className="medication-info">
                      <h4>{med.name}</h4>
                      <p>{med.desc}</p>
                      <div className="medication-tags">
                        {med.tags.map((tag, j) => (
                          <span key={j} className={`tag ${tag.type}`}>{tag.label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="medication-actions">
                      <button className="btn text-btn">상세정보</button>
                      <button className="btn primary-btn small-btn">구매하기</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>맞춤형 상비약 키트</h3>
            </div>
            <div className="card-body">
              <p className="info-text">건강 상태와 생활 패턴에 맞는 맞춤형 키트를 추천해 드립니다.</p>

              <div className="kit-cards">
                {kits.map((kit, i) => (
                  <div key={i} className={`kit-card${kit.recommended ? ' recommended' : ''}`}>
                    {kit.recommended && <div className="kit-badge">추천</div>}
                    <div className="kit-header">
                      <h4>{kit.title}</h4>
                      <span className="kit-price">{kit.price}</span>
                    </div>
                    <div className="kit-content">
                      <ul className="kit-items">
                        {kit.items.map((item, j) => <li key={j}>{item}</li>)}
                      </ul>
                      <button className="btn primary-btn full-width">구매하기</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const categoryLabel = (key) => {
  const labels = {
    all: '전체',
    cold: '감기약',
    digestive: '소화제',
    pain: '진통제',
    wound: '상처치료',
    allergy: '알레르기'
  };
  return labels[key];
};

const dummyMeds = [
  {
    name: '판콜에이',
    desc: '감기 증상 완화',
    category: 'cold',
    image: 'https://placehold.co/150',
    tags: [{ label: '안전', type: 'safe' }, { label: '감기약', type: '' }]
  },
  {
    name: '타이레놀',
    desc: '두통, 근육통, 생리통',
    category: 'pain',
    image: 'https://placehold.co/150',
    tags: [{ label: '안전', type: 'safe' }, { label: '진통제', type: '' }]
  }
  // 실제 데이터는 더 추가 가능
];

const kits = [
  {
    title: '기본 키트',
    price: '35,000원',
    items: ['타이레놀', '베아제', '판콜에이', '후시딘', '밴드 세트']
  },
  {
    title: '고혈압 환자용 키트',
    price: '45,000원',
    recommended: true,
    items: ['타이레놀', '베아제', '콜대원', '후시딘', '알레그라', '혈압 측정기']
  },
  {
    title: '여행용 키트',
    price: '40,000원',
    items: ['타이레놀', '베아제', '판콜에이', '멀미약', '후시딘', '밴드 세트', '소독제']
  }
];

export default OtcMeds;

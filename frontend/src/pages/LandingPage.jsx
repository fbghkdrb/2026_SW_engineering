import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import happyChar from "../assets/character/happy.png";
import attendanceChar from "../assets/character/attendance.png";
import "./LandingPage.css";

// Pre-computed from original JS: (10 + (i*7)%80), (10 + (i*11)%70)
const SPARKLES = Array.from({ length: 12 }, (_, i) => ({
  left: `${10 + (i * 7) % 80}%`,
  top: `${10 + (i * 11) % 70}%`,
  animationDelay: `${i * 0.3}s`,
}));

const TAGS = [
  { label: "📖 vocabulary", style: { left: "calc(50% + -180px)", top: "calc(50% + -110px)", animationDelay: "0s, .5s" } },
  { label: "📝 TOEIC",      style: { left: "calc(50% + 160px)",  top: "calc(50% + -120px)", animationDelay: ".15s, .65s" } },
  { label: "🔥 스트릭",     style: { left: "calc(50% + -210px)", top: "calc(50% + 20px)",   animationDelay: ".3s, .8s" } },
  { label: "🪙 코인",       style: { left: "calc(50% + 200px)",  top: "calc(50% + 30px)",   animationDelay: ".45s, .95s" } },
  { label: "🎯 퀴즈",       style: { left: "calc(50% + -160px)", top: "calc(50% + 140px)",  animationDelay: ".6s, 1.1s" } },
  { label: "📚 단어장",     style: { left: "calc(50% + 160px)",  top: "calc(50% + 140px)",  animationDelay: ".75s, 1.25s" } },
];

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const navRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);

  useEffect(() => {
    if (user) navigate("/main", { replace: true });
  }, [user, navigate]);

  // Navbar scroll effect
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () =>
      nav.classList.toggle("lp-scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-reveal with stagger
  useEffect(() => {
    const els = document.querySelectorAll(".lp-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const siblings = [...e.target.parentElement.querySelectorAll(".lp-reveal")];
          e.target.style.transitionDelay = `${siblings.indexOf(e.target) * 0.1}s`;
          e.target.classList.add("lp-in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollTo = (ref) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const goLogin = () => navigate("/login");

  return (
    <div className="lp-root">
      {/* ===== Navbar ===== */}
      <nav className="lp-nav" ref={navRef}>
        <div className="lp-nav-inner">
          <span className="lp-brand">WordTama</span>
          <div className="lp-nav-right">
            <div className="lp-nav-links">
              <button onClick={() => scrollTo(featuresRef)}>기능 소개</button>
              <button onClick={() => scrollTo(howItWorksRef)}>사용법</button>
            </div>
            <button className="lp-btn lp-btn-outline" onClick={goLogin}>로그인</button>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="lp-hero">
        <div className="lp-cloud lp-c1" />
        <div className="lp-cloud lp-c2" />
        <div className="lp-cloud lp-c3" />
        <div className="lp-sparkles">
          {SPARKLES.map((s, i) => (
            <span key={i} className="lp-sparkle" style={{ left: s.left, top: s.top, animationDelay: s.animationDelay }}>✦</span>
          ))}
        </div>

        <div className="lp-hero-inner">
          <div className="lp-mascot-wrap">
            {TAGS.map((t) => (
              <div key={t.label} className="lp-tag" style={t.style}>{t.label}</div>
            ))}
            <div className="lp-mascot-bg">
              <img src={happyChar} alt="WordTama 캐릭터" width="340" height="340" />
            </div>
          </div>

          <h1>토익 단어, 재미있게 끝내자</h1>
          <p className="lp-sub">매일 학습하고 캐릭터를 키워보세요</p>
          <div className="lp-cta-wrap">
            <button className="lp-btn lp-btn-primary" onClick={goLogin}>시작하기</button>
          </div>
          <div className="lp-stats">
            <div className="lp-stat-pill">1,000+ 단어</div>
            <div className="lp-stat-pill">4가지 퀴즈</div>
            <div className="lp-stat-pill">귀여운 다마고치</div>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="lp-feature" id="features" ref={featuresRef}>
        <h2 className="lp-section-title lp-reveal">이런 기능이 있어요</h2>
        <div className="lp-feature-grid">
          {[
            {
              title: "단어장",
              desc: "1,000개 토익 단어를 매일 학습해요. DAY별로 나눠서 체계적으로 공부할 수 있어요.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              ),
            },
            {
              title: "퀴즈",
              desc: "객관식, 주관식, 빈칸채우기 4가지 모드로 실력을 확인해요. 타이머 모드로 실전 감각도 키울 수 있어요.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                </svg>
              ),
            },
            {
              title: "다마고치",
              desc: "학습할수록 캐릭터가 성장해요. 매일 돌봐주지 않으면 활력도가 떨어지니 꾸준히 학습해요.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c-4.97 0-9-3.918-9-8.75C3 7.504 7.03 2 12 2s9 5.504 9 11.25C21 18.082 16.97 22 12 22z" />
                </svg>
              ),
            },
            {
              title: "출석",
              desc: "매일 출석하고 코인을 모아요. 7일 연속 출석하면 보너스 코인을 받을 수 있어요.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              ),
            },
          ].map((f) => (
            <div key={f.title} className="lp-feature-card lp-reveal">
              <div className="lp-feature-ico">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="lp-steps" id="how-it-works" ref={howItWorksRef}>
        <h2 className="lp-section-title lp-lg lp-reveal">이렇게 공부해요</h2>
        <div className="lp-steps-row">
          <div className="lp-step lp-reveal">
            <div className="lp-step-ico-wrap">
              <div className="lp-step-ico">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <span className="lp-step-num">1</span>
            </div>
            <h3>단어 학습</h3>
            <p>매일 새로운 단어를 학습해요</p>
            <p className="lp-step-sub">하루 20개씩 꾸준히 학습해요</p>
          </div>

          <div className="lp-arrow lp-reveal"><ChevronIcon /></div>

          <div className="lp-step lp-reveal">
            <div className="lp-step-ico-wrap">
              <div className="lp-step-ico">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
                </svg>
              </div>
              <span className="lp-step-num">2</span>
            </div>
            <h3>퀴즈 풀기</h3>
            <p>다양한 퀴즈로 복습해요</p>
            <p className="lp-step-sub">학습한 단어를 퀴즈로 복습해요</p>
          </div>

          <div className="lp-arrow lp-reveal"><ChevronIcon /></div>

          <div className="lp-step lp-reveal">
            <div className="lp-step-ico-wrap">
              <div className="lp-step-ico">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <span className="lp-step-num">3</span>
            </div>
            <h3>캐릭터 성장</h3>
            <p>학습 보상으로 캐릭터가 자라요</p>
            <p className="lp-step-sub">코인으로 아이템도 구매할 수 있어요</p>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="lp-cta-section">
        <div className="lp-mascot-bg lp-reveal">
          <img src={attendanceChar} alt="WordTama 캐릭터" width="200" height="200" />
        </div>
        <h2 className="lp-section-title lp-reveal">지금 바로 시작하세요</h2>
        <div className="lp-stars lp-reveal">
          <div className="lp-stars-row">
            {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
          </div>
          <span className="lp-stars-label">4.9/5</span>
        </div>
        <div className="lp-testimonials">
          {[
            { text: '"토익 800점 달성했어요!"', by: "— 김**님" },
            { text: '"매일 하다보니 어느새 습관이 됐어요"', by: "— 이**님" },
            { text: '"캐릭터 키우는 게 너무 귀여워요"', by: "— 박**님" },
          ].map((t) => (
            <div key={t.by} className="lp-tcard lp-reveal">
              <p>{t.text}</p>
              <small>{t.by}</small>
            </div>
          ))}
        </div>
        <div className="lp-users-badge lp-reveal">1,000명+ 학습 중</div>
        <div className="lp-reveal">
          <button className="lp-btn lp-btn-primary" style={{ padding: "22px 48px" }} onClick={goLogin}>
            시작하기
          </button>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="lp-footer">
        <span className="lp-brand">WordTama</span>
        <p>© 2026 상명대학교 소프트웨어공학 3조</p>
      </footer>
    </div>
  );
};

export default LandingPage;

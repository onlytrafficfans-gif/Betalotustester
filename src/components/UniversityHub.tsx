import React, { useState, useEffect } from 'react';

export default function UniversityHub() {
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showCertDisplay, setShowCertDisplay] = useState(false);
  const [certName, setCertName] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    setCompletedLessons(saved);
    if (saved.length >= 10) setShowCertModal(true);
  }, []);

  const completedCount = completedLessons.length;
  const progressPct = (completedCount / 10) * 100;

  const handleStartLesson = (i: number) => {
    window.location.href = '/university/assessment.html';
  };

  const generateCert = () => {
    if (certName.trim()) {
      setShowCertModal(false);
      setShowCertDisplay(true);
    }
  };

  const lessons = [];
  for (let i = 1; i <= 10; i++) {
    const isCompleted = completedLessons.includes(i);
    const isUnlocked = i === 1 || completedLessons.includes(i - 1);
    const icon = isCompleted ? '✅' : isUnlocked ? '🎓' : '🔒';
    const statusText = isCompleted ? 'Completed' : isUnlocked ? 'Ready to start' : 'Locked';
    const statusColor = isCompleted ? '#00ff88' : '#aaa';
    const btnBg = isCompleted ? '#555' : isUnlocked ? '#00ff88' : '#333';
    const btnColor = isCompleted ? '#ccc' : isUnlocked ? '#001b0d' : '#666';
    const btnText = isCompleted ? 'Review' : isUnlocked ? 'Start Lesson' : 'Locked';

    lessons.push(
      <div
        key={i}
        className="lesson-card"
        style={{
          background: 'rgba(12,12,12,0.88)',
          borderRadius: '20px',
          padding: '24px',
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
          border: `1.5px solid ${isCompleted ? 'rgba(0,255,120,0.5)' : isUnlocked ? 'rgba(0,255,120,0.25)' : 'rgba(255,255,255,0.1)'}`,
          opacity: isUnlocked ? 1 : 0.5,
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: '#fff' }}>Lesson {i}</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: statusColor }}>{statusText}</p>
        <button
          disabled={!isUnlocked}
          onClick={() => handleStartLesson(i)}
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: isUnlocked ? 'pointer' : 'not-allowed',
            background: btnBg,
            color: btnColor,
            fontFamily: 'inherit',
          }}
        >
          {btnText}
        </button>
      </div>
    );
  }

  return (
    <section className="public-route-page" style={{ padding: 'clamp(20px, 5vw, 40px) 20px', minHeight: '100vh' }}>
      <button
        className="public-brand"
        type="button"
        onClick={() => window.location.href = '/'}
      >
        LOTUS
      </button>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <img src="/university/lotus-logo.png" alt="Lotus" style={{ height: 'clamp(44px, 10vw, 60px)', width: 'auto' }} />
            <h1 style={{ fontSize: 'clamp(28px, 6vw, 44px)', fontWeight: 800, color: '#00ff88', margin: 0 }}>Lotus University</h1>
          </div>
          <p style={{ fontSize: 'clamp(14px, 4vw, 18px)', color: '#aaa' }}>AI Foundations 101</p>
        </div>

        <div style={{ background: 'rgba(12,12,12,0.88)', border: '1px solid rgba(0,255,120,0.25)', borderRadius: '20px', padding: '20px', marginBottom: '28px', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#aaa', fontSize: '12px', letterSpacing: '2px' }}>PROGRESS</p>
          <h2 style={{ margin: 0, fontSize: 'clamp(20px, 5vw, 30px)', color: '#00ff88' }}>
            {completedCount} / 10 Lessons Completed
          </h2>
          <div style={{ height: '6px', background: '#1b1b1b', borderRadius: '20px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #00ff88, #caff7a)', transition: '0.3s' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {lessons}
        </div>
      </div>

      {showCertModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'rgba(12,12,12,0.95)', border: '1px solid rgba(0,255,120,0.25)', borderRadius: '20px', padding: 'clamp(20px, 5vw, 40px)', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
            <h2 style={{ color: '#00ff88', margin: '0 0 16px 0', fontSize: 'clamp(24px, 6vw, 32px)' }}>🎉 Congratulations!</h2>
            <p style={{ color: '#aaa', margin: '0 0 20px 0', fontSize: 'clamp(14px, 4vw, 16px)' }}>You've completed all 10 lessons. Enter your name to receive your certificate.</p>
            <input
              type="text"
              placeholder="Enter your full name"
              value={certName}
              onChange={(e) => setCertName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid rgba(0,255,120,0.25)',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '14px',
                marginBottom: '16px',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={generateCert}
              style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '12px', background: '#00ff88', color: '#001b0d', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Generate My Certificate
            </button>
          </div>
        </div>
      )}

      {showCertDisplay && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', zIndex: 1001, overflowY: 'auto', padding: '16px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button
              onClick={() => setShowCertDisplay(false)}
              style={{ marginBottom: '16px', padding: '10px 16px', border: 'none', borderRadius: '12px', background: '#00ff88', color: '#001b0d', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}
            >
              ← Back to Lessons
            </button>
            <div style={{ background: 'white', borderRadius: '12px', padding: 'clamp(20px, 5vw, 40px)', textAlign: 'center', color: '#333' }}>
              <h1 style={{ fontSize: 'clamp(28px, 6vw, 44px)', fontWeight: 800, color: '#003d1f', margin: '0 0 24px 0' }}>Certificate of Achievement</h1>
              <p>This certificate is proudly presented to</p>
              <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', color: '#00aa55', margin: '16px 0', fontWeight: 700 }}>{certName}</h2>
              <p>In recognition of successfully completing Lotus University AI Foundations 101 and demonstrating the knowledge and skills required to begin building AI-powered applications with confidence.</p>
              <p style={{ fontWeight: 700 }}>Welcome, Certified Lotus Builder.</p>
              <p style={{ fontSize: '12px', color: '#999', margin: '24px 0' }}>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <button
                onClick={() => window.print()}
                style={{ padding: '14px 24px', border: 'none', borderRadius: '12px', background: '#00aa55', color: 'white', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                🖨️ Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import { useRef, useState } from 'react';
import { ChevronLeft, CirclePlay, Folder, Settings } from 'lucide-react';
import lotusFlower from '@/assets/lotus-flower.png';
import lotusLogo from '@/assets/lotus-logo.png';
import './App.css';

type ScreenName = 'home' | 'projects' | 'preview' | 'settings';

const screens: ScreenName[] = ['home', 'projects', 'preview', 'settings'];

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenName>('home');
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const go = (screen: ScreenName) => {
    setActiveScreen(screen);
  };

  const handleHomeTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      go(dx < 0 ? 'projects' : 'preview');
    }
  };

  return (
    <main className="lotus-page">
      <div className="lotus-app" data-active-screen={activeScreen}>
        <section
          id="home"
          className={`lotus-screen ${activeScreen === 'home' ? 'active' : ''}`}
          aria-hidden={activeScreen !== 'home'}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStart.current = { x: touch.clientX, y: touch.clientY };
          }}
          onTouchEnd={handleHomeTouchEnd}
        >
          <div className="toprow">
            <button className="iconbtn plain" type="button" aria-label="Settings" onClick={() => go('settings')}>
              <Settings aria-hidden="true" />
            </button>
            <button className="iconbtn" type="button" aria-label="Preview" onClick={() => go('preview')}>
              <CirclePlay aria-hidden="true" fill="currentColor" strokeWidth={0} />
            </button>
          </div>
          <div className="home-hero">
            <img src={lotusLogo} alt="LOTUS" />
          </div>
        </section>

        <section
          id="projects"
          className={`lotus-screen ${activeScreen === 'projects' ? 'active' : ''}`}
          aria-hidden={activeScreen !== 'projects'}
        >
          <div className="pagehead">
            <h1 className="serif title">Projects</h1>
          </div>
        </section>

        <section
          id="preview"
          className={`lotus-screen ${activeScreen === 'preview' ? 'active' : ''}`}
          aria-hidden={activeScreen !== 'preview'}
        >
          <div className="toprow">
            <button className="iconbtn plain" type="button" aria-label="Settings" onClick={() => go('settings')}>
              <Settings aria-hidden="true" />
            </button>
            <button className="iconbtn" type="button" aria-label="Preview">
              <CirclePlay aria-hidden="true" fill="currentColor" strokeWidth={0} />
            </button>
          </div>
          <div className="headtext">
            <h2 className="serif">Preview</h2>
          </div>
        </section>

        <section
          id="settings"
          className={`lotus-screen ${activeScreen === 'settings' ? 'active' : ''}`}
          aria-hidden={activeScreen !== 'settings'}
        >
          <div className="toprow">
            <button className="iconbtn" type="button" aria-label="Back" onClick={() => go('home')}>
              <ChevronLeft aria-hidden="true" />
            </button>
          </div>
          <div className="settings-head">
            <div>
              <h1 className="serif">Settings</h1>
            </div>
            <img src={lotusLogo} alt="" aria-hidden="true" />
          </div>
        </section>

        <nav id="nav" aria-label="Primary">
          {screens.map((screen) => (
            <button
              key={screen}
              type="button"
              className={`nav-item ${activeScreen === screen ? 'active' : ''}`}
              onClick={() => go(screen)}
              aria-current={activeScreen === screen ? 'page' : undefined}
            >
              {screen === 'home' && <img src={lotusFlower} alt="" aria-hidden="true" />}
              {screen === 'projects' && <Folder aria-hidden="true" strokeWidth={1.8} />}
              {screen === 'preview' && <CirclePlay aria-hidden="true" strokeWidth={1.8} />}
              {screen === 'settings' && <Settings aria-hidden="true" strokeWidth={1.8} />}
              {screen[0].toUpperCase() + screen.slice(1)}
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}

export default App;

import { useState, useEffect, useRef } from 'react';
import './App.css';
import StatusBar from "./StatusBar";

const images = import.meta.glob('/src/assets/monsters/*.jpg', { eager: true }) as Record<string, { default: string }>;
const allIcons = Object.values(images).map((mod) => mod.default);
const basePoint = 10;

interface Card {
  id: number,
  icon: string,
  flipped: boolean,
  matched: boolean,
}

const createShuffledCards = (): Card[] => {
  const icons = allIcons.sort(() => Math.random() - 0.5).slice(0, 8); 
  const shuffled = [...icons, ...icons].sort(() => Math.random() - 0.5);
  return shuffled.map((icon, index) => ({
    id: index,
    icon,
    flipped: false,
    matched: false,
  }));
};

function App() {
  useEffect(() => {
    allIcons.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);
  
  const shuffledCardsRef = useRef(createShuffledCards());
  const [cards, setCards] = useState(shuffledCardsRef.current);
  const [selected, setSelected] = useState<number[]>([]);
  const [point, setPoint] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [countdown, setCountdown] = useState<number | string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isViewResult, setIsViewResult] = useState(false);
  const [isViewRules, setIsViewRules] = useState(false);

  useEffect(() => {
    setCards(shuffledCardsRef.current);
  }, []);

  const flipCard = (index: number) => {
    if (isResetting) return; // リセット中は何もしない
    if (cards[index].flipped || cards[index].matched || selected.length === 2) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [i1, i2] = newSelected;
      if (cards[i1].icon === cards[i2].icon) {
        // 一致
        const addingPoints = basePoint + comboCount * basePoint;
        const newCombo = comboCount + 1;
        setPoint((prev) => prev + addingPoints); // ポイント加算
        setComboCount(newCombo);
        if(maxCombo < newCombo) setMaxCombo(newCombo);
        setTimeout(() => {
          const updated = [...cards];
          updated[i1].matched = true;
          updated[i2].matched = true;
          setCards(updated);
          setSelected([]);
        }, 600);
      } else {
        // 不一致→元に戻す
        setComboCount(0);
        setTimeout(() => {
          const updated = [...cards];
          updated[i1].flipped = false;
          updated[i2].flipped = false;
          setCards(updated);
          setSelected([]);
        }, 600);
      }
    }

    checkFinished();
  };

  const checkFinished = () => {
    if (!cards.find(card => card.flipped == false)) {
      setIsFinished(true);
      setTimeout(() => {
        setIsViewResult(true);
      }, 1000)
    }
  }

  const resetGame = () => {
    if (isResetting) return; // リセット中は何もしない
    setCountdown('ready...');
    setIsResetting(true);
    resetParameter();

    shuffledCardsRef.current = createShuffledCards();

    const hiddenCards = shuffledCardsRef.current.map(card => {
      if(!card.flipped) return card; 
      return {
        ...card,
        flipped: false
      };
    });
    setCards(hiddenCards);

    let counter = 3;
    const interval = setInterval(() => {
      if (counter === 0) {
        clearInterval(interval);
        setCountdown(null);
        showCards();

      } else {
        setCountdown(counter);
      }
      counter--;
    }, 1000);
  };

  const closeResult = () => {
    setIsViewResult(false)
  }

  const openResult = () => {
    setIsViewResult(true)
  }

  const closeRules = () => {
    setIsViewRules(false)
  }

  const openRules = () => {
    setIsViewRules(true)
  }

  const resetParameter = () => {
    setSelected([]);
    setPoint(0);
    setComboCount(0);
    setMaxCombo(0);
    setIsFinished(false);
  }

  const showCards = () => {
    const newCards = shuffledCardsRef.current.map((card) => ({
      ...card,
      flipped: true, // 一旦すべて表向きに
    }));

    setCards(newCards);
    setTimeout(() => {
      const hiddenCards = shuffledCardsRef.current.map((card) => ({
        ...card,
        flipped: false,
      }));
      setCards(hiddenCards);
      setIsResetting(false);
    }, 5000); // 5秒（5000ミリ秒）
  }

  return (
    <div className="container">
      { countdown !== null && (
        <div className="shadow-overlay">
          <span className="countdown-text">{countdown}</span>
        </div>
      )}
      {isViewResult && (
        <div className="shadow-overlay">
          <div className="result-overlay">
            <div className="title-box">
              <span className="title">RESULT</span>
            </div>
            <div className="result-row">
              <span className="result-text">POINT: {point}</span>
              <span className="result-text">MAX COMBO: {maxCombo}</span>
            </div>
            <div className="record-box">
            </div>
            <button className="close-button" onClick={closeResult}>
              ❎
            </button>
          </div>
        </div>
      )}
      {isViewRules && (
        <div className="shadow-overlay">
          <div className="rules-overlay">
            <div className="title-box">
              <span className="title">RULES</span>
            </div>
            <div className="rules-row">
              <ul>
                <li>ゲーム開始後の５秒間は絵柄を覚えるチャンス！</li>
                <li>同じ絵柄をそろえてポイントゲット！</li>
                <li>連続で正解するとコンボボーナス加算！</li>
                <li>📋：ルール表示</li>
                <li>🔁：ゲーム開始/リセット</li>
                <li>🏁：リザルト画面を表示</li>
              </ul>
            </div>
            <button className="close-button" onClick={closeRules}>
              ❎
            </button>
          </div>
        </div>
      )}
    <header className="header">
      <h1>Match Monster</h1>
    </header>    
      <StatusBar point={point} comboCount={comboCount} />
      <div className="grid">
        {cards.map((card, i) => (
          <button
            key={card.id}
            onClick={() => flipCard(i)}
            disabled={card.flipped || card.matched}
            className="card"
          >
            <img src={card.icon} alt="monster" className="card-image" />
            <img
              src="/card-back.png"
              alt="back"
              className={`card-back-image ${card.flipped ? "hidden" : ""}`}
            />
          </button>
        ))}
      </div>
      <footer className="footer">
        <div className="footer-buttons">
          <button className="footer-button" onClick={openRules}>📋</button>
        <button className="footer-button" onClick={resetGame}>🔁</button>
          <button className={`footer-button ${isFinished ? "" : "disabled"}`} onClick={openResult}>🏁</button>
        </div>
      </footer>
    </div>
  );
}

export default App;

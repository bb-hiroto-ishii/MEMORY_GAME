import { useState, useEffect, useRef } from 'react';
import './App.css';
import StatusBar from "./StatusBar";

const images = import.meta.glob('/src/assets/monsters/*.jpg', { eager: true }) as Record<string, { default: string }>;

const allIcons = Object.values(images).map((mod) => mod.default);

interface Card {
  id: number,
  icon: string,
  flipped: boolean,
  matched: boolean,
}

const createShuffledCards = (): Card[] => {
  const icons = allIcons.sort(() => Math.random() - 0.5).slice(0, 8); // 8種類のカードをランダムに選出
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
  const [isResetting, setIsResetting] = useState(false);
  const [countdown, setCountdown] = useState<number | string | null>(null);

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
        setPoint((prev) => prev + 10 + comboCount * 10); // ポイント加算
        setComboCount((prev) => prev + 1);
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
  };

  const resetGame = () => {
    if (isResetting) return; // リセット中は何もしない
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

  const resetParameter = () => {
    setSelected([]);
    setPoint(0);
    setComboCount(0);
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
        <div className="countdown-overlay">
          <span className="countdown-text">{countdown}</span>
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
        <button className="reset-button" onClick={resetGame}>
          🔁 
        </button>
      </footer>

    </div>

    
  );
  
}

export default App;

import { useState, useEffect } from 'react';
import './App.css';
import StatusBar from "./StatusBar";

const images = import.meta.glob('/src/assets/monsters/*.jpg', { eager: true }) as Record<string, { default: string }>;

const icons = Object.values(images).map((mod) => mod.default);

const createShuffledCards = () => {
  const cardTypes = icons.sort(() => Math.random() - 0.5).slice(0, 8); // 6種類のカードをランダムに選出
  const shuffled = [...cardTypes, ...cardTypes].sort(() => Math.random() - 0.5);
  return shuffled.map((icon, index) => ({
    id: index,
    icon,
    flipped: false,
    matched: false,
  }));
};

function App() {
  useEffect(() => {
    resetGame(); // 初期化
  }, []);

  const [cards, setCards] = useState(createShuffledCards());
  const [selected, setSelected] = useState<number[]>([]);
  const [point, setPoint] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [countdown, setCountdown] = useState<number | string | null>(null);

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
    setIsResetting(true);

    let counter = 3;
    const interval = setInterval(() => {
      if (counter === 0) {
        clearInterval(interval);
        setCountdown(null);

        const newCards = createShuffledCards().map((card) => ({
          ...card,
          flipped: true, // 一旦すべて表向きに
        }));

        setCards(newCards);
        setSelected([]);
        setPoint(0);
        setComboCount(0);

        setTimeout(() => {
          const hiddenCards = newCards.map((card) => ({
            ...card,
            flipped: false,
          }));
          setCards(hiddenCards);
          setIsResetting(false);
        }, 5000); // 5秒（5000ミリ秒）
      } else {
        setCountdown(counter);
  }
      counter--;
    }, 1000);
  };

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
          disabled={card.matched}
          className={`card ${!card.flipped && !card.matched ? 'back' : 'front'}`}
        >
          {card.flipped || card.matched ? (
            <img src={card.icon} alt="monster" className='card-image'/>
          ) : null}
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

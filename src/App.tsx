import { useState } from 'react';
import './App.css';

// const icons = ['🍎', '🍇', '🍓', '🍋', '🥝', '🍌'];
const images = import.meta.glob('/src/assets/monsters/*.jpg', { eager: true }) as Record<string, { default: string }>;

const icons = Object.values(images).map((mod) => mod.default);

const createShuffledCards = () => {
  const cardTypes = icons.sort(() => Math.random() - 0.5).slice(0, 6); // 6種類のカードをランダムに選出
  const shuffled = [...cardTypes, ...cardTypes].sort(() => Math.random() - 0.5);
  return shuffled.map((icon, index) => ({
    id: index,
    icon,
    flipped: false,
    matched: false,
  }));
};

function App() {
  const [cards, setCards] = useState(createShuffledCards());
  const [selected, setSelected] = useState<number[]>([]);

  const flipCard = (index: number) => {
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
        setTimeout(() => {
          const updated = [...cards];
          updated[i1].matched = true;
          updated[i2].matched = true;
          setCards(updated);
          setSelected([]);
        }, 600);
      } else {
        // 不一致→元に戻す
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
    setCards(createShuffledCards());
    setSelected([]);
  };

  return (
    <div className="container">
    <header className="header">
      <h1>Memory Game</h1>
      <p>Match the pairs of cards!</p>
    </header>
    <div className="grid">
      {cards.map((card, i) => (
        <button
          key={card.id}
          onClick={() => flipCard(i)}
          disabled={card.matched}
          className={`card ${!card.flipped && !card.matched ? 'back' : 'front'}`}
        >
          {/* {card.flipped || card.matched ? card.icon : ''} */}
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

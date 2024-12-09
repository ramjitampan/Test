import React, { useState, useRef, useEffect } from 'react';
import './SlotMachine.css';

const SlotMachine = () => {
  const symbols = ['🍒', '🍋', '🍊', '🍉', '🍇', '💲', '🔔', '😜'];
  const symbolPoints = {
    '🍒': 20,
    '🍋': 10,
    '🍊': 5,
    '🍉': 15,
    '🍇': 25,
    '💲': 50,
    '🔔': 30,
    '😜': -70
  };

  const [reels, setReels] = useState([[], [], []]);
  const [balance, setBalance] = useState(300);
  const [bet, setBet] = useState(10);
  const [message, setMessage] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  const reelRefs = [useRef(), useRef(), useRef()];

  const audioRef = useRef(null);

  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(error => console.log('Autoplay prevented: ', error));
      }
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  const spinReels = () => {
    if (balance < bet) {
      setMessage('Saldo Anda tidak cukup! Turunkan taruhan Anda atau isi ulang saldo.');
      return;
    }

    setIsSpinning(true);
    setBalance(balance - bet);

    const newReels = [[], [], []];
    const result = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 20; j++) {
        newReels[i].push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
      // Masukkan simbol acak ke posisi tengah
      const middleIndex = Math.floor(newReels[i].length / 2);
      const randSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      newReels[i][middleIndex] = randSymbol;
      result.push(randSymbol);
    }

    setReels(newReels);

    reelRefs.forEach(ref => {
      ref.current.style.transition = 'none';
      ref.current.style.transform = `translateY(0px)`;
    });

    setTimeout(() => {
      reelRefs.forEach((ref, index) => {
        ref.current.style.transition = `transform 1s cubic-bezier(0.5, 0.05, 0.1, 0.3)`;
        ref.current.style.transform = `translateY(-${Math.floor(newReels[index].length / 2) * 80}px)`;
      });

      setTimeout(() => {
        checkResult(result);
        setIsSpinning(false);
      }, 1000);
    }, 100);
  };

  const checkResult = (result) => {
    const [r1, r2, r3] = result;

    if (r1 === r2 && r2 === r3) {
      const payout = symbolPoints[r1] * (r1 !== '😜' ? bet : 1);
      setBalance(balance + payout);
      setMessage(r1 === '😜' ? 'Sayang sekali, Anda kehilangan 70 poin!' : `Selamat! Anda menang ${payout} poin!`);
    } else {
      setMessage('Anda kalah. Coba lagi!');
    }
  };

  return (
    <div className="slot-machine">
      <h1>MEDAN GAMBLING</h1>
      <p>Saldo: <span className="balance">{balance}</span></p>
      <div className="bet-container">
        <label>Taruhan: </label>
        <input
          type="number"
          value={bet}
          onChange={(e) => setBet(Math.max(1, Math.min(balance, parseInt(e.target.value, 10))))}
        />
      </div>
      <div className="reels">
        {reels.map((reel, index) => (
          <div key={index} className="reel-container">
            <div ref={reelRefs[index]} className="reel">
              {reel.map((symbol, idx) => (
                <span key={idx}>{symbol}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={spinReels} className="spin-button" disabled={isSpinning}>
        {isSpinning ? 'Spinning...' : 'Spin'}
      </button>
      <p className="message">{message}</p>
      <audio ref={audioRef} src="/background-music.mp3" loop />
    </div>
  );
};

export default SlotMachine;

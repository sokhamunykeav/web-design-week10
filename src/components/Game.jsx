import React, { useState } from "react";

// Generates a random integer in the range [min, max]
function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Creates a damage log entry
function createDamageLog(target, damage) {
  return {
    type: target,
    isDamage: true,
    text: ` takes ${damage} damage`,
  };
}

// Creates a healing log entry
function createHealLog(amount) {
  return {
    type: "player",
    isDamage: false,
    text: ` heals ${amount} HP`,
  };
}

function Game() {
  const [playerHealth, setPlayerHealth] = useState(100);
  const [monsterHealth, setMonsterHealth] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [battleLog, setBattleLog] = useState([]);
  const [specialCooldown, setSpecialCooldown] = useState(0);

  // Handles monster's turn to attack the player
  function monsterAttack(currentPlayerHealth) {
    const damage = getRandomValue(5, 12);
    const newHealth = Math.max(0, currentPlayerHealth - damage);
    setPlayerHealth(newHealth);
    setBattleLog((prev) => [{ ...createDamageLog("player", damage) }, ...prev]);

    if (newHealth <= 0) {
      setGameOver(true);
      setPlayerWon(false);
    }
  }

  // Player performs a basic attack (5-12 damage)
  function handleAttack() {
    const damage = getRandomValue(5, 12);
    const newMonsterHealth = Math.max(0, monsterHealth - damage);
    setMonsterHealth(newMonsterHealth);
    setBattleLog((prev) => [{ ...createDamageLog("monster", damage) }, ...prev]);

    if (specialCooldown > 0) setSpecialCooldown(specialCooldown - 1);

    if (newMonsterHealth <= 0) {
      setGameOver(true);
      setPlayerWon(true);
      return;
    }

    monsterAttack(playerHealth);
  }

  // Player heals themselves (8-15 HP), then monster attacks
  function handleHeal() {
    const healAmount = getRandomValue(8, 15);
    const newHealth = Math.min(100, playerHealth + healAmount);
    const actualHeal = newHealth - playerHealth;

    if (actualHeal > 0) {
      setPlayerHealth(newHealth);
      setBattleLog((prev) => [{ ...createHealLog(healAmount) }, ...prev]);
      monsterAttack(newHealth);
    } else {
      setBattleLog((prev) => [
        { type: "player", isDamage: false, text: ` is already at full health!` },
        ...prev,
      ]);
      monsterAttack(playerHealth);
    }

    if (specialCooldown > 0) setSpecialCooldown(specialCooldown - 1);
  }

  // Player performs a special attack (10-20 damage), sets 3-turn cooldown
  function handleSpecialAttack() {
    if (specialCooldown > 0) return;

    const damage = getRandomValue(10, 20);
    const newMonsterHealth = Math.max(0, monsterHealth - damage);
    setMonsterHealth(newMonsterHealth);
    setBattleLog((prev) => [{ ...createDamageLog("monster", damage) }, ...prev]);
    setSpecialCooldown(3);

    if (newMonsterHealth <= 0) {
      setGameOver(true);
      setPlayerWon(true);
      return;
    }

    monsterAttack(playerHealth);
  }

  // Resets all game state for a new game
  function handleRestart() {
    setPlayerHealth(100);
    setMonsterHealth(100);
    setGameOver(false);
    setPlayerWon(false);
    setBattleLog([]);
    setSpecialCooldown(0);
  }

  // Player deals 100 damage to themselves (instant death)
  function handleSuicide() {
    setPlayerHealth(0);
    setBattleLog((prev) => [{ ...createDamageLog("player", 100) }, ...prev]);
    setGameOver(true);
    setPlayerWon(false);
  }

  return (
    <>
      <section className="container">
        <h2>Monster Health</h2>
        <div className="healthbar">
          <div style={{ width: `${monsterHealth}%` }} className="healthbar__value"></div>
        </div>
      </section>
      <section className="container">
        <h2>Your Health</h2>
        <div className="healthbar">
          <div style={{ width: `${playerHealth}%` }} className="healthbar__value"></div>
        </div>
      </section>
      {gameOver && (
        <section className="container">
          <h2>Game Over!</h2>
          <h3>{playerWon ? "You won!" : "You lost!"}</h3>
          <button onClick={handleRestart}>Start New Game</button>
        </section>
      )}
      <section id="controls">
        <button onClick={handleAttack} disabled={gameOver}>
          ATTACK
        </button>
        <button onClick={handleSpecialAttack} disabled={gameOver || specialCooldown > 0}>
          SPECIAL! {specialCooldown > 0 && `(${specialCooldown})`}
        </button>
        <button onClick={handleHeal} disabled={gameOver}>
          HEAL
        </button>
        <button onClick={handleSuicide} disabled={gameOver}>
          KILL YOURSELF
        </button>
      </section>
      <section id="log" className="container">
        <h2>Battle Log</h2>
        <ul>
          {battleLog.map((log, index) => (
            <li key={index}>
              <span className={log.type === "player" ? "log--player" : "log--monster"}>
                {log.type === "player" ? "Player" : "Monster"}
              </span>
              <span className={log.isDamage ? "log--damage" : "log--heal"}>{log.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default Game;

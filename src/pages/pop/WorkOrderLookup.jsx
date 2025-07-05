import React, { useState } from 'react';

const MesPopScreen = () => {
  const [goodQty, setGoodQty] = useState(0);
  const [badQty, setBadQty] = useState(0);
  const [totalQty, setTotalQty] = useState(0);

  const handleStart = () => {
    alert("작업 시작!");
  };

  const handleComplete = () => {
    alert("작업 완료!");
  };

  const handleSubmit = () => {
    setTotalQty(goodQty + badQty);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', height: '100vh' }}>
      <h2 style={{ marginBottom: 20 }}>MES 작업자 POP</h2>

      <div style={{ border: '1px solid #333', padding: 15, marginBottom: 20, backgroundColor: '#fff' }}>
        <h3>작업지시 정보</h3>
        <p>작업지시번호: <strong>2025010714</strong></p>
        <p>작업시작: <strong>2025-02-04 08:16:02</strong></p>
        <p>품목명: <strong>test</strong></p>
        <p>규격: <strong>PLA(내외) / 흑색 / 0.90 x 730</strong></p>
        <p>목표수량: <strong>8,400 EA</strong></p>
      </div>

      <div style={{ border: '1px solid #333', padding: 15, marginBottom: 20, backgroundColor: '#fff' }}>
        <h3>생산 실적 입력</h3>

        <div style={{ marginBottom: 10 }}>
          <label>양품수량: </label>
          <input type="number" value={goodQty} onChange={(e) => setGoodQty(Number(e.target.value))} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>불량수량: </label>
          <input type="number" value={badQty} onChange={(e) => setBadQty(Number(e.target.value))} />
        </div>

        <button onClick={handleSubmit} style={{ marginTop: 10 }}>실적 등록</button>

        <div style={{ marginTop: 15 }}>
          <p>누적생산: <strong>{totalQty}</strong> EA</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button onClick={handleStart} style={{ fontSize: 20, padding: '20px 40px', backgroundColor: '#4caf50', color: '#fff' }}>작업시작</button>
        <button onClick={handleComplete} style={{ fontSize: 20, padding: '20px 40px', backgroundColor: '#f44336', color: '#fff' }}>작업완료</button>
      </div>
    </div>
  );
};

export default MesPopScreen;

import React, { useState } from 'react';
import BarcodeScanner from 'components/BarcodeScanner';

const MesPop = () => {
  const [operator, setOperator] = useState('홍길동');  // 작업자
  const [orderNo, setOrderNo] = useState('WO20240612001');  // 작업지시번호
  const [lotList, setLotList] = useState([]);  // 투입 LOT 목록
  const [scanLog, setScanLog] = useState([]);
  const [outputQty, setOutputQty] = useState(0);
  const [badQty, setBadQty] = useState(0);


  const handleSubmit = () => {
    console.log('실적 등록');
    console.log('작업자:', operator);
    console.log('작업지시:', orderNo);
    console.log('투입 LOT:', lotList);
    console.log('양품:', outputQty);
    console.log('불량:', badQty);

    alert('생산실적이 등록되었습니다.');
    // 여기에 서버 API 호출 가능
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>MES 작업자 POP 불량등록</h2>

      <div style={{ marginBottom: '20px' }}>
        <p>작업자: <strong>{operator}</strong></p>
        <p>작업지시: <strong>{orderNo}</strong></p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>투입 LOT 스캔</h3>
        <ul>
          {lotList.map((lot, idx) => <li key={idx}>{lot}</li>)}
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>생산 실적</h3>
        
        <label>불량 수량: </label>
        <input type="number" value={badQty} onChange={(e) => setBadQty(e.target.value)} /><br />
      </div>

      <button onClick={handleSubmit} style={{ fontSize: '18px' }}>생산실적 등록</button>

      <hr />
      <h3>스캔 로그</h3>
      <ul>{scanLog.map((code, idx) => <li key={idx}>{code}</li>)}</ul>

    </div>
  );
};

export default MesPop;

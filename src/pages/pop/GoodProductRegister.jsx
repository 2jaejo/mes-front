import React, { useState } from 'react';
import { MainContentStyle, MainContentStyle2 } from "css/CommonStyle";
import BarcodeScanner from 'components/BarcodeScanner';


const MesPop = () => {
  const [operator, setOperator] = useState('홍길동');  // 작업자
  const [orderNo, setOrderNo] = useState('WO20240612001');  // 작업지시번호
  const [lotList, setLotList] = useState([]);  // 투입 LOT 목록
  const [scanLog, setScanLog] = useState([]);
  const [outputQty, setOutputQty] = useState(0);
  const [badQty, setBadQty] = useState(0);

  const handleBarcodeScan = (barcode) => {
    console.log('스캔:', barcode);
    setScanLog(prev => [...prev, barcode]);

    if (barcode.startsWith('LOT')) {
      if (lotList.includes(barcode)) {
        alert('이미 투입된 LOT입니다.');
      } else {
        setLotList(prev => [...prev, barcode]);
      }
    } else {
      alert('지원하지 않는 바코드입니다.');
    }
  };

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
    <div style={MainContentStyle}>
      <BarcodeScanner />
    </div>
  );
};

export default MesPop;

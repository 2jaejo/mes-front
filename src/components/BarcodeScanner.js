// BarcodeScanner.jsx
import React, { useState, useRef } from 'react';
import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import Barcode from 'react-barcode';


const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('1250509000003');
  const [barcodeValue2, setBarcodeValue2] = useState('1250509000005');
  const [barcodeValue3, setBarcodeValue3] = useState('02250509000001');

  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const modalRef = useRef();

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && barcode.trim() !== '') {
      try {
        setProduct([]);
        
        const params = {
          barcode: barcode,
        }
        
        axiosInstance
        .post(`/api/scanBarcode`, JSON.stringify(params))
        .then((res) => {
          
          setProduct(res.data);

        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
        })
        .finally(() =>{
          setBarcode('');
        });

        // const response = await fetch(`/api/product/search_by_barcode?barcode=${barcode}`);
        // const data = await response.json();

        // if (data.success) {
        //   setProduct(data.data);
        //   setError('');
        // } else {
        //   setProduct(null);
        //   setError(data.message);
        // }

        // setBarcode(''); // 입력창 초기화
      } catch (err) {
        console.error(err);
        setError('서버 오류 발생');
      }
    }
  };

  const handleNewProduct = () => {
    alert('신규 등록 화면을 띄웁니다 (Modal 등 구현 필요)');
    // 여기서 신규 등록 modal 등 추가 구현 가능
  };

  return (
    <div style={{ padding: '20px' }}>
      <Modal ref={modalRef} />

      <Barcode value={barcodeValue} format="CODE128" lineColor="#000" width={2} height={60} displayValue={false}/>
      <p>{barcodeValue}</p>

      <Barcode value={barcodeValue2} format="CODE128" lineColor="#000" width={2} height={60} displayValue={false}/>
      <p>{barcodeValue2}</p>

      <Barcode value={barcodeValue3} format="CODE128" lineColor="#000" width={2} height={60} displayValue={false}/>
      <p>{barcodeValue3}</p>

      <h2>바코드 스캔</h2>
      <Form.Control 
        type="text"
        name="barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={handleKeyPress}
        size="sm" 
        className="w-auto"
        placeholder="바코드를 스캔하세요"
        autoFocus
      />

      <div style={{ marginTop: '20px' }}>
        {product && (
          <div style={{ border: '1px solid #ccc', padding: '10px' }}>
            <h3>상품 정보</h3>
            <p>{product.barcode}</p>
            <p>{product.item_id}</p>
            <p>{product.item_code}</p>
            <p>{product.item_name}</p>
            <p>{product.base_unit}</p>
            <p>{product.purchase_unit}</p>
            <p>{JSON.stringify(product)}</p>
          </div>
        )}

        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            <p>{error}</p>
            <button onClick={handleNewProduct}>신규 등록</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;

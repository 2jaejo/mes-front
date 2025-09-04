import React, { useState, useRef } from "react";

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { Row, Col, Form, Button } from 'react-bootstrap';
import { MainContentStyle } from "css/CommonStyle";

const LoginHistory = () => {
  const gridRef = useRef();  
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState();
  const [columnDefs] = useState([
    { headerName: "아이디", field: "user_id", sortable: true, filter: true, },
    { headerName: "아이피", field: "ip_address", sortable: true, },
    { headerName: "접속정보", field: "user_agent", sortable: true, minWidth:800 },
    { headerName: "접속시간", field: "login_dt", sortable: true, },
    { headerName: "성공여부", field: "success", sortable: true, },
  ]);


  const [form, setForm] = useState({
      user_id: '',
      ip_address: '',
      login_dt: '',
    });
  
    const handleChange = (e) => {
      console.log(e.target.name, e.target.value);
      setForm({ ...form, [e.target.name]: e.target.value });
    };
    


  // 조회
  const getData = (params) => {
    console.log("getData");

    setLoading(true);
    
    const startTime = Date.now(); // 요청 전 시간 기록
    axiosInstance
    .post(`/api/getOsmStockItemStorageList`, JSON.stringify(form))
    .then((res) => {
      const endTime = Date.now(); // 응답 시간을 측정
      const responseTime = endTime - startTime; // 응답 시간 (밀리초)
      const delay = responseTime < 300 ? 300 - responseTime : 0; // 응답 시간이 0.5초보다 빠르면 남은 시간만큼 지연
      
      // 지연 후 응답을 출력
      setTimeout(async () => {
        setRowData(res.data);
        setLoading(false);
      }, delay);
        
    })
    .catch((error) => console.error("Error fetching data:", error));
    

  };
  const getData2 = (params) => {
    console.log("getData2");

    setLoading(true);
    
    const startTime = Date.now(); // 요청 전 시간 기록
    axiosInstance
    .post(`/api/getOsmOrderCustItemOrderList`, JSON.stringify(form))
    .then((res) => {
      const endTime = Date.now(); // 응답 시간을 측정
      const responseTime = endTime - startTime; // 응답 시간 (밀리초)
      const delay = responseTime < 300 ? 300 - responseTime : 0; // 응답 시간이 0.5초보다 빠르면 남은 시간만큼 지연
      
      // 지연 후 응답을 출력
      setTimeout(async () => {
        setRowData(res.data);
        setLoading(false);
      }, delay);
        
    })
    .catch((error) => console.error("Error fetching data:", error));
    
  };



  // onGridReady에서 이벤트 리스너 추가
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장
    getData();

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      
      
    });
    
    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      
    });

  };

  
  return (
    <div style={MainContentStyle}>

      <div className="p-2 mb-2 border bg-light">
       
        <Row className="">
          <Col className="d-flex gap-2">
            <Form.Control 
              type="text"
              size="sm" 
              className="w-auto"
              name="user_id" 
              value={form.user_id}
              onChange={handleChange}
              placeholder="아이디" 
              maxLength={50}
            />
            <Form.Control
              type="text" 
              size="sm" 
              className="w-auto" 
              name="ip_address"
              value={form.ip_address}
              onChange={handleChange}
              placeholder="아이피" 
              maxLength={50}
            />
            <Form.Control 
              type="date"
              size="sm" 
              className="w-auto" 
              name="login_dt"
              value={form.login_dt}
              onChange={handleChange}
              placeholder="접속일자"
              maxLength={50}
            />
            <Button size="sm" variant="secondary" onClick={getData}>재고조회 테스트</Button>
            <Button size="sm" variant="secondary" onClick={getData2}>주문조회 테스트</Button>
          </Col>
          
        </Row>

      </div>
      
      {/* <GridExample 
        columnDefs={columnDefs}
        rowData={rowData}
        onGridReady={onGridReady} 
        loading={loading}
        rowNum={true}
        rowSel={"singleRow"}
      /> */}
      
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      {
        JSON.stringify(rowData)
      }
    </div>
  );
}

export default LoginHistory;

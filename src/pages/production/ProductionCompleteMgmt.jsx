import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { MainContentStyle } from "css/CommonStyle";
import dayjs from "dayjs";
import {comm} from "utils/CommonFunctions";

const Main = ({ props={}, isActive }) => {

  // 컴포넌트로 사용했을때 ref 받기
  const [modalForm, setModalForm] = useState(props.current);
  const modalFormChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
    if(props.current){
      props.current[name] = value;
    }
  };

  // 모달 ref
  const modalRef = useRef();  
  const modalRef2 = useRef();  
  const modalRef3 = useRef();  

  // selectbox
  const selectBox = useRef({}); 
  

  // grid cell code_name 변환
  const commonTypeFormatter = (params, cd) => {
    const arr_client_type = selectBox.current.common?.[cd] || [];
    const item = arr_client_type.find(el => el.code === params.value);
    return item ? item.code_name : params.value; 
  };

  // grid cell code_name 변환
  const moneyFormatter = (params, digit=0) => {
    if (params.value == null) return '';
    const num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: digit});
    return num;
  };

  // 그리드 설정 시작 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const gridRef = useRef();  
  const selectedRow = useRef(0);
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  


  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      
      selectedRow.current = ev.rowIndex; 

    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      
      const selectedRows = ev.api.getSelectedRows();
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){

      };

    });

  };


  // 그리드 설정 종료 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // 초기화
  useEffect(()=>{
    console.log("useEffect");

    if( !isActive ) return;
    
    const init = {
      category: '',
      code: ['cd010', 'cd016', 'cd013', 'cd014']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;


      // 그리드 설정
      setColumnDefs([
        { headerName: "완료일자", field: "production_dt", filter: "agTextColumnFilter", align:"center"},
        { headerName: "바코드", field: "bar_code", filter: "agTextColumnFilter",  align:"center"},
        { headerName: "제품코드", field: "item_dotno", filter: "agTextColumnFilter", align:"left" },
        { headerName: "제품명", field: "item_name", filter: "agTextColumnFilter", align:"left", width:300 },
        { headerName: "완료수량", field: "quantity", align:"right", cellDataType:'number',
          valueFormatter:(params)=> moneyFormatter(params)
        },
        { headerName: "비고", field: "remark", align:"left", width:300},
        { headerName: "등록일", field: "created_at", filter: "agDateColumnFilter",  align:"center", width:120},
        { headerName: "등록자", field: "created_by", filter: "agTextColumnFilter",  align:"left"},
        { headerName: "수정일", field: "updated_at", filter: "agDateColumnFilter",  align:"center", width:120},
        { headerName: "수정자", field: "updated_by", filter: "agTextColumnFilter",  align:"left"},
      ]);
      
      getData();

    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    });  

  },[isActive]);



  // 검색창 입력필드
  const [form, setForm] = useState({
    start_date : ''
    , end_date : ''
    , worker_id : ''
    , item_code:''
    , item_name:''
    , client_code : ''
    , client_name : ''
    , status : ''
  });

  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  }; 




  // 조회
  const getData = (params) => {
    console.log("getData");

    setRowData([]);
    setLoading(true);
    
    axiosInstance
    .post(`/api/getProductionLog`, JSON.stringify(form))
    .then((res) => {
      setRowData(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
    })
    .finally(() =>{
      setLoading(false);
    
    });
    
  };


  

 

  
  return (
    <div style={MainContentStyle}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />
      <Modal ref={modalRef3} />

      <div className="bg-light">
        <Row className="">
          <Col className="overflow-auto">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">등록일자</th>
                  <td className="">
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control 
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                        maxLength={50}
                      />
                      <span className="fw-bold"> ~ </span>
                      <Form.Control 
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="NAME"
                        maxLength={50}
                      />
                      <Button size="sm" variant="secondary" onClick={()=> { comm.changeDate(handleChange, "start_date", "end_date", 0); }}>당일</Button>
                      <Button size="sm" variant="secondary" onClick={()=> { comm.changeDate(handleChange, "start_date", "end_date", -3); }}>3일</Button>
                      <Button size="sm" variant="secondary" onClick={()=> { comm.changeDate(handleChange, "start_date", "end_date", -7); }}>7일</Button>
                      <Button size="sm" variant="secondary" onClick={()=> { comm.changeDate(handleChange, "start_date", "end_date", -30); }}>30일</Button>
                    </div>
                  </td>
                 
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-search"></i></Button>
                  </td>
                  
                </tr>
              </tbody>
            </Table>

          </Col>
        </Row>
      </div>

      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 d-flex flex-column gap-2" xs={12} md={12}>
            <div>
              <span className="py-1 fw-bold">생산완료 목록</span>
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pageSize={10}
            />

  
          </Col>
        </Row>


      </div>

    </div>
  );
}

export default Main;



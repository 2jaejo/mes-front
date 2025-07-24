import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { MainContentStyle } from "css/CommonStyle";




const Main = () => {

  // 모달 ref
  const modalRef = useRef();  
  const modalRef2 = useRef();  
  const modalRef3 = useRef();  

  // selectbox
  const selectBox = useRef({}); 
  
  // grid cell code_name 변환
  const categoryAFormatter = (params) => {
    const arr_client_type = selectBox.current.category?.item_group_a || [];
    const item = arr_client_type.find(el => el.category_id === params.value);
    return item ? item.category_nm : params.value; 
  };

  // grid cell code_name 변환
  const categoryBFormatter = (params) => {
    
    const arr_client_type = selectBox.current.category?.item_group_b[params.data.item_group_a] || [];
    const item = arr_client_type.find(el => el.category_id === params.value);
    return item ? item.category_nm : params.value; 
  };

  // grid cell code_name 변환
  const commonTypeFormatter = (params, cd) => {
    const arr_client_type = selectBox.current.common?.[cd] || [];
    const item = arr_client_type.find(el => el.code === params.value);
    return item ? item.code_name : params.value; 
  };

  // grid cell code_name 변환
  const moneyFormatter = (params) => {
    if (params.value == null) return '';
    const num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
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
      const node = ev.node;
      if (!node.isSelected()) {
        node.setSelected(true);
      }
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


  const pinnedBottomRowData = [{
    order_date: '합계',
    supply_price: '',
    tax: '',
    total_price: '',
  }];

  const pinnedBottomRowData2 = [{
    purchase_unit: '합계',
    quantity: '',
    unit_price: '',
    supply_price: '',
    tax: '',
    total_price: '',
    incoming_inspection: '',
  }];


  const rowPin = (params, type='sum') => {
    const arr_values = [];
    params.api.forEachNodeAfterFilterAndSort((node) => {
      if (node.data && node.data[params.column.colId] != null) {
        arr_values.push(node.data[params.column.colId]);
      }
    });

    let result = null;
    const sum = arr_values.reduce((sum, current) => sum + Number(current), 0);
    const cnt = arr_values.length;
    const avg = sum / cnt;
  
    if(type === 'sum'){
      result = sum;
    }
    else if(type === 'avg'){
      result = avg;
    }
    else if(type === 'cnt'){
      result = cnt;
    }
    else{

    }

    return result;
  }

  // 그리드 설정 종료 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      category: '',
      code: ['cd010', 'cd012','cd013']
    };

    axiosInstance
      .post(`/api/getDropDown`, JSON.stringify(init))
      .then((res) => {
        selectBox.current = res.data;

        // 그리드 설정
        setColumnDefs([
          { headerName: "출고마감일시", field: "receipt_date", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
          { headerName: "출고번호", field: "receipt_id", sortable: false, editable: false, align:"center", width:200},
          { headerName: "자재코드", field: "raw_code", sortable: false, editable: false, align:"center"},
          { headerName: "자재명", field: "raw_name", sortable: false, editable: false, align:"left", width:300}, 
          { headerName: "변경수량", field: "changed_quantity", sortable: false, editable: false, align:"left"},         
        ]);
        

        getData();


      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });  

  },[]);



  // 검색창 입력필드
  const [form, setForm] = useState({
     start_date : ''
    , end_date : ''
    , receipt_id : ''
    , raw_code : ''
    , raw_name : ''
    , status : ''
    , change_type: 'OUT'
  });


  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }; 


  // 조회
  const getData = (params) => {
    console.log("getData");

    setRowData([]);
    setLoading(true);
    
    axiosInstance
    .post(`/api/getReceiptLog`, JSON.stringify(form))
    .then((res) => {
      setRowData(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
    })
    .finally(() =>{
      setLoading(false);
      
      // 그리드 행 선택
      let sel = selectedRow.current;
      
      if(typeof params === "number") sel = params;
      
      gridRef.current.forEachNode((node) => {
        if (node.rowIndex === sel) {
          node.setSelected(true);
        }
      });
    });
    
  };

  
  return (
    <div style={MainContentStyle}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />
      <Modal ref={modalRef3} />

      <div className="bg-light">
        <Row className="">
          <Col className="">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">출고일자</th>
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
                    </div>
                  </td>
                  <th className="bg-light text-end align-middle">출고번호</th>
                  <td className="">
                      <Form.Control 
                        type="text"
                        name="receipt_id"
                        value={form.receipt_id}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        maxLength={50}
                      />
                  </td>
                  <th className="bg-light text-end align-middle">품목</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="item_code"
                        value={form.item_code}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                        maxLength={50}
                      />
                      <Form.Control 
                        type="text"
                        name="item_name"
                        value={form.item_name}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="NAME"
                        maxLength={50}
                      />
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
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">입고 이력</span>              
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              // pageSize={10}
              // pinnedBottomRowData={pinnedBottomRowData}  
            />
          </Col>
        </Row>

      </div>
    

    </div>
  );
}

export default Main;





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



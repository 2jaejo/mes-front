import React, { useState, useRef, useEffect } from "react";

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';
import { MainContentStyle } from "css/CommonStyle";


const Main = () => {



  // 검색창 입력필드
  const [form, setForm] = useState({
     item_code : ''
    , item_name : ''
  });

  // 검색창 입력필드 변경 저장
  const formChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }; 
  

  // 모달 ref
  const modalRef = useRef();  
  const modalRef2 = useRef();  
  
  // selectbox
  const selectBox = useRef({}); 

  // grid
  const gridRef = useRef();  
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  // 그리드 onGridReady
  const onGridReady = (params) => {
    console.log("onGridReady");
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      console.log(ev);
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      console.log(ev);
      setData(ev.data);

    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      console.log(ev);
      
      const selectedRows = ev.api.getSelectedRows();
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){

      };

    });
  };


  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      code: ['cd010']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      setColumnDefs([
        { headerName: "자재코드", field: "item_code", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
        { headerName: "자재명", field: "item_name", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "창고", field: "warehouse_id", sortable: true, editable: false, align:"center"},
        { headerName: "LOT", field: "lot_no", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "단위", field: "unit", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center"},
        { headerName: "수량", field: "quantity", sortable: false, editable: true, align:"right", valueFormatter: (params) => moneyFormatter(params)},
        { headerName: "비고", field: "comment", sortable: false, editable: true, align:"left"},
      ]);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);
  

  // 그리드 데이터 변경 감지
  // useEffect(()=>{
  //   form.current['sel_row'] = rowData;
  // }, [rowData])

  
  // grid cell code_name 변환
  const moneyFormatter = (params) => {
    if (params.value == null) return '';
    const num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
    return num;
  };


  // 조회
  const getData = (params) => {
    console.log("getData");

    setRowData([]);
    setLoading(true);
    
    axiosInstance
    .post(`/api/getInventory`, JSON.stringify(form))
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
      // let sel = selectedRow.current;
      // if(typeof params === "number") sel = params;
      // gridRef.current.forEachNode((node) => {
      //   if (node.rowIndex === sel) {
      //     node.setSelected(true);
      //   }
      // });
    });
    
  };


  // 수정
  const setData = (params) => {
    console.log("setData");

    axiosInstance
      .post("api/setInventory", JSON.stringify(params))
      .then((res) => {
        getData();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
      });   
  };



  return (
    <div style={MainContentStyle}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="bg-light">
        <Row className="">
          <Col className="">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">자재</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="item_code"
                        value={form.item_code}
                        onChange={formChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                      />
                      <Form.Control 
                        type="text"
                        name="item_name"
                        value={form.item_name}
                        onChange={formChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="NAME"
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
              <span className="fw-bold">자재 목록</span>
              
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={true}
              // pageSize={10}
              // pinnedBottomRowData={pinnedBottomRowData}  
            />
          </Col>

        </Row>
      </div>

    </div>
  );
};


export default Main;

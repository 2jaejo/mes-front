import React, { useState, useRef, useEffect, useMemo } from "react";

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';
import { MainContentStyle } from "css/CommonStyle";
import { ContentSteeringController } from "hls.js";


const Main = () => {

  const selectedRow = useRef(0);

  // 검색창 입력필드
  const [form, setForm] = useState({
     raw_code : ''
    , raw_name : ''
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

  const gridRef2 = useRef();  
  const [loading2, setLoading2] = useState(false);
  const [rowData2, setRowData2] = useState([]);
  const [columnDefs2, setColumnDefs2] = useState([]);

  const getRowClass = (params) => {
    const r_qty = params.data.right_qty;
    const ratio = params.data.stock_ratio;
    if(r_qty !== 0 && ratio < 30){
      return 'bg-red';
    }else if (r_qty !== 0 && ratio >= 30 && ratio < 60){
      return 'bg-orange';
    }else if (r_qty !== 0 && ratio >= 60 && ratio < 80){
      return 'bg-yellow';
    }else if (r_qty !== 0 && ratio >= 80 && ratio < 100){
      return 'bg-green';
    }

    return '';
  };

  // 그리드 onGridReady
  const onGridReady = (params) => {
    console.log("onGridReady");
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      console.log(ev);
    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      console.log(ev);

      const selectedRows = ev.api.getSelectedRows();
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){
        getData2(selectedRows[0]);
      };

    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      console.log(ev);
    });
  };

  // 그리드 onGridReady2
  const onGridReady2 = (params) => {
    console.log("onGridReady2");
    gridRef2.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      console.log(ev);
    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      console.log(ev);
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      console.log(ev);
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
        { headerName: "운영상품코드", field: "item_usr_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "바코드", field: "bar_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "품번", field: "raw_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:150 },
        { headerName: "품명", field: "raw_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:200 },
        { headerName: "단위", field: "base_unit", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "규격", field: "unit_size", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "매입가", field: "buyprice", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "분류", field: "type_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "상태", field: "status_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "매입처", field: "supply_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "안전재고", field: "right_qty", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params)},
        { headerName: "재고수량", field: "quantity", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params)},
        { headerName: "재고비율", field: "stock_ratio", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params, '%')},
        { headerName: "부족수량", field: "chk_cnt", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params)},
      ]);

      setColumnDefs2([
        { headerName: "변경일시", field: "created_at", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
        { headerName: "자재코드", field: "raw_code", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
        { headerName: "자재명", field: "raw_name", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "변경수량", field: "changed_quantity", sortable: false, editable: false, align:"right", valueFormatter: (params) => moneyFormatter(params)},
        { headerName: "변경타입", field: "change_type", sortable: false, editable: false, align:"center"},
      ]);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);
  

  // 그리드 데이터 변경 감지
  useEffect(()=>{
    console.log(rowData);
  }, [rowData])

  
  // grid cell code_name 변환
  const moneyFormatter = (params, suffix = '') => {
    if (params.value == null) return '';
    let num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
    if (suffix !== '') num += suffix;
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
      let sel = selectedRow.current;
      if(typeof params === "number") sel = params;
      gridRef.current.forEachNode((node) => {
        if (node.rowIndex === sel) {
          node.setSelected(true);
        }
      });
    });
    
  };

  // 조회2
  const getData2 = (params) => {
    console.log("getData2");

    setRowData2([]);
    setLoading2(true);
    
    axiosInstance
    .post(`/api/getInventoryDet`, JSON.stringify(params))
    .then((res) => {
      setRowData2(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
    })
    .finally(() =>{
      setLoading2(false);
      
      // // 그리드 행 선택
      // let sel = selectedRow.current;
      // if(typeof params === "number") sel = params;
      // gridRef.current.forEachNode((node) => {
      //   if (node.rowIndex === sel) {
      //     node.setSelected(true);
      //   }
      // });
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
                        name="raw_code"
                        value={form.raw_code}
                        onChange={formChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                      />
                      <Form.Control 
                        type="text"
                        name="raw_name"
                        value={form.raw_name}
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
          <Col className="h-100 pe-0 d-flex flex-column" xs={12} md={12}>
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
              rowClass={getRowClass}
            />
          </Col>

          {/* <Col className="h-100 d-flex flex-column" xs={12} md={6}>
            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">변경 내역</span>
              
            </div>

            <GridExample 
              columnDefs={columnDefs2}
              rowData={rowData2}
              onGridReady={onGridReady2} 
              loading={loading2}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={true}
              // pageSize={10}
              // pinnedBottomRowData={pinnedBottomRowData}  
            />
          </Col> */}

        </Row>
      </div>

    </div>
  );
};


export default Main;

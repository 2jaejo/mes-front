import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";

const Main = ({ props={}, style_props={} }) => {

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
  
  // selectbox
  const selectBox = useRef({}); 

  const selectedRow = useRef(0);
  const selectedRow2 = useRef(0);

  // grid
  const gridRef = useRef();  
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  const gridRef2 = useRef();  
  const [loading2, setLoading2] = useState(false);
  const [rowData2, setRowData2] = useState([]);
  const [columnDefs2, setColumnDefs2] = useState([]);

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

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      
      const selectedRows = ev.api.getSelectedRows();
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){
        getData2(selectedRows[0]);
        modalFormChange({ target: {name:"sel_row", value:selectedRows[0]} });
      };

    });
  };


  // 그리드 onGridReady2
  const onGridReady2 = (params) => {
    console.log("onGridReady2");

    gridRef2.current = params.api; // Grid API 저장
    
    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
    });

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


  // 초기화
  useEffect(()=>{
    const init = {
      category: '',
      code: ['']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      setColumnDefs([
        { headerName: "발주번호", field: "purchase_id", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "매입처코드", field: "client_code", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left" },
        { headerName: "매입처명", field: "client_name", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left" },
      ]);

      // 그리드 설정2
      setColumnDefs2([
        { headerName: "발주번호", field: "purchase_id", sortable: false, editable: false, align:"center", width:200},
        { headerName: "진행상태", field: "status", sortable: false, editable: false, align:"center",
          valueFormatter: (params) => {
            if( params.data.received_qty == 0){
              return '보류중';
            }else if(params.data.quantity > params.data.received_qty){
              return '부분입고';
            }else if(params.data.quantity <= params.data.received_qty){
              return '입고완료';
            }else{
              return '';
            }

          },
        },
        { headerName: "자재코드", field: "raw_code", sortable: false, editable: false, align:"center", width:200},
        { headerName: "자재명", field: "raw_name", sortable: false, editable: false, align:"left", width:300}, 
        { headerName: "기준단위", field: "base_unit", sortable: false, editable: false, align:"center"},
        { headerName: "구매단위", field: "unit_size", sortable: false, editable: false, align:"center"}, 
        { headerName: "발주수량", field: "quantity", sortable: false, editable: false , align:"right",
          valueFormatter: (params) => moneyFormatter(params)
        }, 
        { headerName: "단가", field: "unit_price", sortable: false, editable: false, align:"right", 
          valueFormatter: (params) => moneyFormatter(params)
        }, 
        { headerName: "합계", field: "total_price", sortable: false, editable: false, align:"right", 
          valueFormatter: (params) => moneyFormatter(params)
        }, 
       
      ]);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);


  // 모달에서 확인에 데이터 전달
  useEffect(()=>{
    modalFormChange({target:{name:"sel_row2", value:rowData2}});
  },[rowData2]);
  

  // 조회
  const getData = (params) => {
    setLoading(true);
    let result_len = 0;

    axiosInstance
      .post(`/api/getOrder`, JSON.stringify(modalForm))
      .then((res) => {
        result_len = res.data.length;
        setRowData(res.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
      })
      .finally(() =>{
        setLoading(false);
        
        // 그리드 행 선택
        let sel = selectedRow.current;
        // 선택된 행이 없으면 첫번째 행 선택
        if(sel >= result_len) sel = 0; 
        if(typeof params === "number") sel = params;
        gridRef.current.forEachNode((node) => {
          if (node.rowIndex === sel) {
            node.setSelected(true);
          }
        });
      });
  };

  // 조회
  const getData2 = (params) => {
    console.log("getData2");

    setRowData2([]);
    setLoading2(true);

    axiosInstance
    .post(`/api/getOrderDet`, JSON.stringify(params))
    .then((res) => {
      setRowData2(res.data);
    
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
    })
    .finally(() =>{
      setLoading2(false);
    });
    
  };


  return (
    <div style={{ height: '70vh', width:'80vw', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="">
            
            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">발주번호</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="purchase_id"
                        value={modalForm.purchase_id}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
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
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">발주 목록</span>
            </div>

            <GridExample
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={false}
            />
          </Col>


        </Row>

      </div>

      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">발주 상세</span>
              
            </div>

            <GridExample 
              columnDefs={columnDefs2}
              rowData={rowData2}
              onGridReady={onGridReady2} 
              loading={loading2}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={false}
            />
          </Col>
        </Row>

      </div>


    </div>
  );
};
  

export default Main;
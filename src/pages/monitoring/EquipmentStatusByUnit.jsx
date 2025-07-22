import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { MainContentStyle } from "css/CommonStyle";



const Main = ({ isActive }) => {
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  const gridRef = useRef();  
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(0); 
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  // selectbox
  const selectBox = useRef({}); 

  // grid cell code_name 변환
  const commonTypeFormatter = (params, cd) => {
    const arr_client_type = selectBox.current.common?.[cd] || [];
    const item = arr_client_type.find(el => el.code === params.value);
    return item ? item.code_name : params.value; 
  };

  // 초기화
  useEffect(()=>{
    console.log("useEffect");

    if( !isActive ) return;

    const init = {
      category: '',
      code: ['cd011', 'cd016']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      // 설비목록 그리드 설정
      setColumnDefs([
        { headerName: "공정코드", field: "process_code", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter"},
        { headerName: "공정명", field: "process_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter" },
        { headerName: "공정유형", field: "process_type", sortable: true, editable: false, align:"center", filter: "agTextColumnFilter", 
          valueFormatter:(params)=> commonTypeFormatter(params,'cd011')
        },
        { headerName: "할당 품번", field: "item_code", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter", width:150 },
        { headerName: "할당 품명", field: "item_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter", width:300 },
        { headerName: "작업 상태", field: "status", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd016']?.map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => commonTypeFormatter(params, 'cd016'),
        },
        
      ]);

      getData();

    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    });  

  },[isActive]);




  // 조회
  const getData = (params) => {
    console.log("getData");

    
    setRowData([]);

    axiosInstance
      .post(`/api/getProcess`, JSON.stringify({type:"status"}))
      .then((res) => {
        setRowData(res.data);

      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      })
      .finally(() =>{
        setLoading(false);

        let sel = selectedRow;
        if(typeof params === "number") sel = params;
        gridRef.current.forEachNode((node) => {
          if (node.rowIndex === sel) {
            node.setSelected(true);
          }
        });
      });
    
  };





  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      
      setSelectedRow(ev.rowIndex); 
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



  
  
  return (
    <div style={MainContentStyle}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="d-flex gap-2">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-arrow-clockwise"></i></Button>
                  </td>
                </tr>
                
              </tbody>
            </Table>

          </Col>
        </Row>
      </div>

      <div className="h-100">
        <Row  className="h-100">
          <Col className="pe-0 h-100 d-flex flex-column" xs={12} md={12}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">공정 목록</span>
              
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


    </div>
  );
}

export default Main;





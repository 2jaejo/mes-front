import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";

import dayjs from "dayjs";

import { MainContentStyle, MainContentStyle2 } from "css/CommonStyle";
import SearchableDropdown from "components/SearchableDropdown";

import ReactDataGrid from 'react-data-grid';


const Main = () => {
  // modal
  const modalRef = useRef();  
  const modalRef2 = useRef();  


  // selectbox
  const selectBox = useRef({}); 

  
  // 그리드 설정
  const gridRef = useRef();  
  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState([]);
  const [loading, setLoading] = useState(false);


  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      
      const selectedRows = params.api.getSelectedRows();
      console.log(selectedRows);
    });

  };


  const exportExcel = () =>{
    console.log("exportExcel");
    if (gridRef.current) {
      gridRef.current.exportDataAsCsv({
        fileName: `export_${dayjs().format('YYYYMMDD')}_동일프라텍_일일생산일보.csv`
      });
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // 초기화 selectbox list
  useEffect(()=>{
    console.log("useEffect");

    const init = {
      code: []
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;
    
      setColumnDefs([
        { headerName: "검사일", field: "chk_date", sortable: true, editable: false, align:"center" },
        { headerName: "검사시간", field: "chk_time", sortable: true, editable: false, align:"center" },
        { headerName: "품명", field: "item_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:300 },
        { headerName: "검사자", field: "chk_user", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left"},
        { headerName: "검사결과", field: "chk_status", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "비고", field: "chk_remarks", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", width:300 },
        { headerName: "등록일", field: "created_at", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center", width:120 },
        { headerName: "등록자", field: "created_by", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left" },
      ]);

      getData();

    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    });    

  },[]);


  const getData = () => {
    console.log("getData");
    
  }


  const columns = [
    { key: 'id', name: 'ID' },
    { key: 'title', name: '제목' },
    { key: 'count', name: '수량' }
  ];

  const rows = [
    { id: 0, title: '예시1', count: 20 },
    { id: 1, title: '예시2', count: 40 },
    { id: 2, title: '예시3', count: 60 }
  ];

  
  return (
    <div style={MainContentStyle}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <ReactDataGrid
          columns={columns}
          rows={rows}
        />


      </div>
    </div>
  );
}

export default Main;





import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";

import dayjs from "dayjs";

import { MainContentStyle, MainContentStyle2 } from "css/CommonStyle";
import SearchableDropdown from "components/SearchableDropdown";

const Main = ({ props={}, isActive }) => {

  // search
  const searchRef = useRef({
    month:'',
    start_date:'',
    end_date:'',
    item_code: "",
    item_name: "",
    process_code: "",
  });

  const [searchForm, setSearchForm] = useState({
    month:'',
    start_date:"",
    end_date:"",
    item_code: "",
    item_name: "",
    process_code: "",
  });

  const searchFormChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));

    if(searchRef.current){
      searchRef.current[name] = value;
    }
  };

  // modal
  const modalRef = useRef();  
  const modalRef2 = useRef();  


  // selectbox
  const selectBox = useRef({}); 

  
  // 그리드 설정
  const gridRef = useRef();  
  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState();
  const selectedRow = useRef(0);
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
      
      const selectedRows = ev.api.getSelectedRows();
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){
        searchRef.current.process_code = selectedRows[0].process_code;
        getData2();
      };
    });

  };

  // 그리드 설정2
  const gridRef2 = useRef();  
  const [columnDefs2, setColumnDefs2] = useState([]);
  const [rowData2, setRowData2] = useState();
  const selectedRow2 = useRef(0);
  const [loading2, setLoading2] = useState(false);


  // 그리드2 onGridReady
  const onGridReady2 = (params) => {
    gridRef2.current = params.api; // Grid API 저장

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

  // grid cell code_name 변환
  const moneyFormatter = (params) => {
    if (params.value == null) return '';
    const num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
    return num;
  };


  const exportExcel = () =>{
    console.log("exportExcel");
    if (gridRef2.current) {
      gridRef2.current.exportDataAsCsv({
        fileName: `export_${dayjs().format('YYYYMMDD')}_동일프라텍_공정별불량현황.csv`
      });
    }
  };

  const setMonth = (date) => {
    const dt = dayjs(date);
    searchFormChange({ target:{ name:"month", value:dayjs(dt).format('YYYY-MM') } });
    searchFormChange({ target:{ name:"start_date", value:dayjs(dt).startOf('month').format('YYYY-MM-DD') } });
    searchFormChange({ target:{ name:"end_date", value:dayjs(dt).endOf('month').format('YYYY-MM-DD') } });
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(()=>{
    // 날짜 기본 세팅
    setMonth(new Date());
  },[]);    


  // 초기화 selectbox list
  useEffect(()=>{
    console.log("useEffect");

    if( !isActive ) return;

    const init = {
      code: []
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;
    
      // setColumnDefs([
      //   { headerName: "공정코드", field: "process_code", sortable: true, editable: false, align:"center" },
      //   { headerName: "공정명", field: "process_name", sortable: true, editable: false, align:"center", flex:1},
      // ]);
      
      setColumnDefs2([
        // { headerName: "수주번호", field: "sales_id", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
        // { headerName: "작업지시코드", field: "work_id", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center", width:140 },
        // { headerName: "제품코드", field: "item_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "공정명", field: "process_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center"},
        { headerName: "제품명", field: "item_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", width:300 },
        // { headerName: "지시시간", field: "range", sortable: true, editable: false, align:"left",width:220 },
        { headerName: "작업시작", field: "start_dttm", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center",width:120},
        { headerName: "작업종료", field: "end_dttm", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center",width:120},
        { headerName: "지시수량", field: "order_qty", sortable: false, editable: false, align:"right", cellDataType:'number', width:70,
          valueFormatter:(params)=> moneyFormatter(params)
        },
        { headerName: "양품수량(ea)", field: "result_qty", sortable: false, editable: false, align:"right", cellDataType:'number',
          valueFormatter:(params)=> moneyFormatter(params)
        },
        { headerName: "불량(g)", field: "defect_qty", sortable: false, editable: false, align:"right", cellDataType:'number',
          valueFormatter:(params)=> moneyFormatter(params, 2)
        },
        { headerName: "비고", field: "remark", sortable: false, editable: false, align:"left", width:300},
      ]);

      getData2();

    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    });    

  },[isActive]);


  const getData = (params) => {
    console.log("getData");

    setRowData([]);
    setLoading(true);

    axiosInstance
    .post(`/api/getProcess`, JSON.stringify({type:"list"}))
    .then((res) => {
      if (res.data.length <= selectedRow.current){
        selectedRow.current = 0;
      } 

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
  }

  const getData2 = (params) => {
    console.log("getData2");

    setRowData2([]);
    setLoading2(true);

    console.log(searchRef.current);
    
    axiosInstance
    .post(`/api/getWorkResult`, JSON.stringify(searchRef.current))
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
  }


  
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

                  <th className="bg-light text-end align-middle">생산월</th>
                  <td className="">
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control 
                        type="month"
                        name="month"
                        value={searchForm.month}
                        onChange={(e)=>setMonth(e.target.value)}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                        maxLength={50}
                      />
                      <Form.Control 
                        type="date"
                        name="start_date"
                        value={searchForm.start_date}
                        onChange={searchFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                        maxLength={50}
                        hidden
                      />
                      <Form.Control 
                        type="date"
                        name="end_date"
                        value={searchForm.end_date}
                        onChange={searchFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="NAME"
                        maxLength={50}
                        hidden
                      />
                    </div>
                  </td>

                  
                  <th className="bg-light text-end align-middle">품목</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="item_code"
                        value={searchForm.item_code}
                        onChange={searchFormChange}
                        onKeyUp={(e)=>{if(e.code === 'Enter') getData2()}}
                        size="sm" 
                        className="w-auto"
                        placeholder="품번"
                        maxLength={50}
                      />
                      <Form.Control 
                        type="text"
                        name="item_name"
                        value={searchForm.item_name}
                        onChange={searchFormChange}
                        onKeyUp={(e)=>{if(e.code === 'Enter') getData2()}}
                        size="sm" 
                        className="w-auto"
                        placeholder="품명"
                        maxLength={50}
                      />
                    </div>
                  </td>
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData2}><i className="bi bi-search"></i></Button>
                  </td>

                </tr>
    
              </tbody>
            </Table>


          </Col>
        </Row>
      </div>

      <div className="h-100">
        <Row  className="h-100">
          {/* <Col className="h-100 d-flex flex-column" xs={12} md={3}>
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
          </Col> */}

          <Col className="h-100 ps-0 d-flex flex-column" xs={12} md={12}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">현황 목록</span>
              
              <Button size="sm" variant="secondary" onClick={exportExcel}>csv 다운로드</Button>
              
            </div>

            <GridExample
              columnDefs={columnDefs2}
              rowData={rowData2}
              onGridReady={onGridReady2}
              loading={loading2}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={true}
            />
          </Col>


        </Row>

      </div>
    </div>
  );
}

export default Main;





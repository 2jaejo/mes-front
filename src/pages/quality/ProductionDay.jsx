import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";

import dayjs from "dayjs";

import { MainContentStyle, MainContentStyle2 } from "css/CommonStyle";
import SearchableDropdown from "components/SearchableDropdown";

import PrintProductionDayPage from "components/PrintProductionDayPage";
import { useReactToPrint } from "react-to-print"
import { get, set } from "lodash";

const Main = ({ props={}, isActive }) => {

  // search
  const searchRef = useRef({
    month:'',
    start_date:'',
    end_date:'',
  });
  
  const [text, setText] = useState('');
  const [searchForm, setSearchForm] = useState({
    month:'',
    start_date:"",
    end_date:"",
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

  // print
  const contentRef = useRef(null);
  const printRef = useRef();
  const [printState, setPrintState] = useState({});
  const [printOrder, setPrintOrder] = useState();
  
  const [printItems, setPrintItems] = useState();
  const [printItems2, setPrintItems2] = useState();
  const [printItems3, setPrintItems3] = useState();
  const [printItems4, setPrintItems4] = useState();
  const [printItems5, setPrintItems5] = useState();

  const reactToPrintFn = useReactToPrint({ contentRef });

  const print = () => {
    console.log("print");


    // const rows = gridRef2.current.getSelectedRows();
    // if(rows.length <= 0) {
    //   modalRef.current.open({ title:"알림", message:"발주를 선택하세요.", cancelText:"" });
    //   return;
    // }
    // printRef.current = rows[0];

    reactToPrintFn();
  }

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

    // 정렬 변경 이벤트
    params.api.addEventListener("sortChanged", (ev) => {
      console.log("sortChanged");
      const newSortedData = [];
      params.api.forEachNodeAfterFilterAndSort((node) => newSortedData.push(node.data));

      // rowData를 새 정렬 순서로 갱신
      setPrintItems2([...newSortedData]);
    });

  };
  // 그리드 설정3
  const gridRef3 = useRef();  
  const [columnDefs3, setColumnDefs3] = useState([]);
  const [rowData3, setRowData3] = useState();
  const selectedRow3 = useRef(0);
  const [loading3, setLoading3] = useState(false);


  // 그리드3 onGridReady
  const onGridReady3 = (params) => {
    gridRef3.current = params.api; // Grid API 저장

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

    // 정렬 변경 이벤트
    params.api.addEventListener("sortChanged", (ev) => {
      console.log("sortChanged");
      const newSortedData = [];
      params.api.forEachNodeAfterFilterAndSort((node) => newSortedData.push(node.data));

      // rowData를 새 정렬 순서로 갱신
      setPrintItems3([...newSortedData]);
    });

  };

  // 그리드 설정4
  const gridRef4 = useRef();  
  const [columnDefs4, setColumnDefs4] = useState([]);
  const [rowData4, setRowData4] = useState();
  const selectedRow4 = useRef(0);
  const [loading4, setLoading4] = useState(false);


  // 그리드4 onGridReady
  const onGridReady4 = (params) => {
    gridRef4.current = params.api; // Grid API 저장

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

    // 정렬 변경 이벤트
    params.api.addEventListener("sortChanged", (ev) => {
      console.log("sortChanged");
      const newSortedData = [];
      params.api.forEachNodeAfterFilterAndSort((node) => newSortedData.push(node.data));

      // rowData를 새 정렬 순서로 갱신
      setPrintItems4([...newSortedData]);
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
    searchFormChange({ target:{ name:"month", value:dayjs(dt).format('YYYY-MM-DD') } });
    searchFormChange({ target:{ name:"start_date", value:dayjs(dt).format('YYYY-MM-DD') } });
    searchFormChange({ target:{ name:"end_date", value:dayjs(dt).format('YYYY-MM-DD') } });
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


      setColumnDefs3([
        { headerName: "바코드", field: "bar_code", filter: "agTextColumnFilter",  align:"center"},
        { headerName: "제품코드", field: "item_dotno", filter: "agTextColumnFilter", align:"left" },
        { headerName: "제품명", field: "item_name", filter: "agTextColumnFilter", align:"left", width:300 },
        { headerName: "완료수량", field: "quantity", align:"right", cellDataType:'number',
          valueFormatter:(params)=> moneyFormatter(params)
        },
        { headerName: "비고", field: "remark", align:"left", width:300},
        // { headerName: "등록일", field: "created_at", filter: "agDateColumnFilter",  align:"center", width:120},
        // { headerName: "등록자", field: "created_by", filter: "agTextColumnFilter",  align:"left"},
        // { headerName: "수정일", field: "updated_at", filter: "agDateColumnFilter",  align:"center", width:120},
        // { headerName: "수정자", field: "updated_by", filter: "agTextColumnFilter",  align:"left"},
      ]);


      setColumnDefs4([
        { headerName: "변경일시", field: "receipt_date", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center", width:120},
        { headerName: "입/출고 번호", field: "receipt_id", sortable: false, editable: false, align:"center", width:120},
        { headerName: "자재코드", field: "raw_code", sortable: false, editable: false, align:"center"},
        { headerName: "자재명", field: "raw_name", sortable: false, editable: false, align:"left", width:300}, 
        { headerName: "입/출고", field: "change_type", sortable: false, editable: false, align:"center", 
          valueFormatter:(params)=>{
            if (params.value === 'IN') return '입고';
            else if (params.value === 'OUT') return '출고';
            else return params.value;
          }
        }, 
        { headerName: "변경수량", field: "requested_quantity", sortable: false, editable: false, align:"right"}, 
        { headerName: "환산후 변경수량", field: "changed_quantity", sortable: false, editable: false, align:"right"}, 
        { headerName: "등록자", field: "created_by", sortable: false, editable: false, align:"left"},        
        { headerName: "비고", field: "remarks", sortable: false, editable: false, align:"left", width:300},  
      ]);




      getData2();
      getData3();
      getData4();

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

      setPrintItems(res.data);
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

      setPrintItems2(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
    })
    .finally(() =>{
      setLoading2(false);
    
    });
  }
  const getData3 = (params) => {
    console.log("getData3");

    setRowData3([]);
    setLoading3(true);

    console.log(searchRef.current);
    
    axiosInstance
    .post(`/api/getProductionLog`, JSON.stringify(searchRef.current))
    .then((res) => {
      setRowData3(res.data);

      setPrintItems3(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
    })
    .finally(() =>{
      setLoading3(false);

    });
  }

  const getData4 = (params) => {
    console.log("getData4");

    setRowData4([]);
    setLoading4(true);

    console.log(searchRef.current);
    
    axiosInstance
    .post(`/api/getReceiptLog`, JSON.stringify(searchRef.current))
    .then((res) => {
      setRowData4(res.data);

      setPrintItems4(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
    })
    .finally(() =>{
      setLoading4(false);

    });
  }

  const searchData = () => {
    console.log("searchData");
  
    getData2();
    getData3();
    getData4();
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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

                  <th className="bg-light text-end align-middle">생산일</th>
                  <td className="">
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control 
                        type="date"
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
  
                  {/* <th className="bg-light text-end align-middle">품목</th>
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
                  </td> */}
                  <td className="">
                    <Button size="sm" variant="primary" onClick={searchData}><i className="bi bi-search"></i></Button>
                  </td>

                </tr>
    
              </tbody>
            </Table>


          </Col>
        </Row>
      </div>

      <div className="h-100">

        <Row  className="h-25">
        
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">생산 목록</span>
              
              {/* <Button size="sm" variant="secondary" onClick={exportExcel}>csv 다운로드</Button> */}
              <Button size="sm" variant="secondary" onClick={print}>일일생산일보 인쇄</Button>
              <div className="print-only" ref={contentRef}>
                <PrintProductionDayPage info={searchRef.current.month} items={printItems} items2={printItems2} items3={printItems3} items4={printItems4} items5={printItems5} />
              </div>

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

        <Row  className="h-25">
        
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">완제품출고 목록</span>
              
              {/* <Button size="sm" variant="secondary" onClick={exportExcel}>csv 다운로드</Button> */}
              
            </div>

            <GridExample
              columnDefs={columnDefs3}
              rowData={rowData3}
              onGridReady={onGridReady3}
              loading={loading3}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={false}
            />
          </Col>

        </Row>

        <Row  className="h-25">
        
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">자재 입/출고 목록</span>
              
              {/* <Button size="sm" variant="secondary" onClick={exportExcel}>csv 다운로드</Button> */}
              
            </div>

            <GridExample
              columnDefs={columnDefs4}
              rowData={rowData4}
              onGridReady={onGridReady4}
              loading={loading4}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={false}
            />
          </Col>


        </Row>

        <Row  className="h-25">
        
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">특이사항</span>
              
              {/* <Button size="sm" variant="secondary" onClick={exportExcel}>csv 다운로드</Button> */}
            </div>

            <Form>
              <Form.Group controlId="exampleTextarea">
                {/* <Form.Label>내용 입력</Form.Label> */}
                <Form.Control
                  as="textarea"
                  rows={7}
                  placeholder="여기에 입력하세요..."
                  value={printItems5}
                  onChange={(e) => setPrintItems5(e.target.value)}
                  style={{ resize: "none" }} // 크기 조절 불가능
                />
              </Form.Group>
            </Form>
          </Col>


        </Row>

      </div>
    </div>
  );
}

export default Main;





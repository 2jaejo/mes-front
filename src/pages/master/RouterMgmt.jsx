import React, { useState, useEffect, useRef } from "react";
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


  // 그리드 설정 시작 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  const gridRef = useRef();  
  const [selectedRow, setSelectedRow] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  

  const col_a = [
    { headerName: "품목명", field: "item_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter"},
    { headerName: "라우터코드", field: "router_code", sortable: true, editable: false, align:"center", filter: "agTextColumnFilter"},
    { headerName: "라우터명", field: "router_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter" },
    // { headerName: "버전", field: "version", sortable: true, editable: false, align:"center", filter: "agTextColumnFilter"},
    { headerName: "사용여부", field: "use_yn", sortable: true, editable: false, align:"center",
      backgroundColor: "#a7d1ff29",
      cellRenderer: 'agCheckboxCellRenderer',
      cellRendererParams: {
        disabled: false,
      },
      // Y/N 값을 true/false로 변환하여 체크박스 표시
      valueGetter: (params) => {
        return params.data.use_yn === 'Y';
      },

      // 체크박스 변경 시 true/false → Y/N 으로 반영
      valueSetter: (params) => {
        const newValue = params.newValue ? 'Y' : 'N';
        if (params.data.use_yn !== newValue) {
          params.data.use_yn = newValue;
          return true; // 값이 바뀐 경우만 true
        }
        return false; // 변경 없음
      },
    },
    { headerName: "비고", field: "comment", sortable: false, editable: true, align:"left", minWidth:500 },
  ];


  let grid_col2 = [
    { headerName: "순서", field: "sort", sortable: false, editable: false, align:"center"},
    { headerName: "공정코드", field: "process_code", sortable: false, editable: false, align:"center"},
    { headerName: "공정명", field: "process_name", sortable: false, editable: false, align:"left"}, 
    { headerName: "소요시간", field: "expected_time_min", sortable: false, editable: true, align:"right"}, 
    { headerName: "필수여부", field: "is_optional", sortable: false, editable: true, align:"center",
      backgroundColor: "#a7d1ff29",
      cellRenderer: 'agCheckboxCellRenderer',
      cellRendererParams: {
        disabled: false,
      },
      // Y/N 값을 true/false로 변환하여 체크박스 표시
      valueGetter: (params) => {
        return params.data.is_optional === 'Y';
      },

      // 체크박스 변경 시 true/false → Y/N 으로 반영
      valueSetter: (params) => {
        const newValue = params.newValue ? 'Y' : 'N';
        if (params.data.is_optional !== newValue) {
          params.data.is_optional = newValue;
          return true; // 값이 바뀐 경우만 true
        }
        return false; // 변경 없음
      },
    },
    { headerName: "비고", field: "comment", sortable: false, editable: true, align:"center"}, 
  ];

  const gridRef2 = useRef();  
  const [loading2, setLoading2] = useState(false);
  const [rowData2, setRowData2] = useState([]);
  const [columnDefs2] = useState(grid_col2);


  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      console.log(ev);
      setSelectedRow(ev.rowIndex); 

      const node = ev.node;
      if (!node.isSelected()) {
        node.setSelected(true);
      }
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
        getData2();
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
      console.log(ev);
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      console.log(ev);
      setData2(ev.data);
    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      console.log(ev);
    });

  };
  
  

  

  // 그리드 설정 종료 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      category: '',
      code: ['cd010', 'cd011']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      // 그리드 설정
      setColumnDefs(col_a);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);


  // selectbox
  const selectBox = useRef({}); 


  // 검색창 입력필드
  const [form, setForm] = useState({
     router_code: ''
    , router_name: ''
    , use_yn: ''
  });

  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // 추가 모달 폼 초기화
  const DEFAULT_FORM = (init={}) => ({
     router_code: ''
    , router_name: ''
    , item_dotno: ''
    , item_name: ''
    , use_yn : 'Y'
    , comment: ''
    , version: '1.0'
    , ...init
  });
  
  // 추가 모달 폼 ref
  const formRef = useRef();

  // 추가 모달 폼 ref 변경
  const formRefChange = (name, value) => {
    formRef.current[name] = value;
  };


  // 조회
  const getData = (params) => {
    console.log("getData");

    setRowData([]);

    setLoading(true);

    axiosInstance
    .post(`/api/getRouter`, JSON.stringify(form))
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
      let sel = selectedRow;
      if(typeof params === "number") sel = params;
      gridRef.current.forEachNode((node) => {
        if (node.rowIndex === sel) {
          node.setSelected(true);
        }
      });
    });
    
  };

  // 조회2
  const getData2 = () => {
    console.log("getData2");

    const sel_rows = gridRef.current.getSelectedRows();

    setRowData2([]);
    setLoading2(true);

    axiosInstance
    .post(`/api/getRouterStep`, JSON.stringify(sel_rows[0]))
    .then((res) => {
      setRowData2(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
    })
    .finally(() =>{
      setLoading2(false);

      // 그리드 행 선택
      // let sel = selectedRow;
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
      .post("api/setRouter", JSON.stringify(params))
      .then((res) => {
       
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
      });   
  };

  // 수정2
  const setData2 = (params) => {
    console.log("setData2");

    axiosInstance
      .post("api/setRouterStep", JSON.stringify(params))
      .then((res) => {
       
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
      });   
  };



  // 추가
  const addData = (params) => {
    console.log("addData");

    // 폼 초기화
    formRef.current = DEFAULT_FORM();

    modalRef.current.open({
      title: "라우터 추가",
      message: "추가하시겠습니까?",
      content: <ModalForm form={formRef.current} onChangeHandler={formRefChange} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        
        if(formRef.current.item_dotno === "" || formRef.current.item_dotno === undefined){
          modalRef2.current.open({ title:"알림", message:"품목을 선택하세요.", cancelText:"" });
          return;
        }
        
        if(formRef.current.router_code === ""|| formRef.current.router_code === undefined){
          modalRef2.current.open({ title:"알림", message:"라우터코드를 입력하세요.", cancelText:"" });
          return;
        }

        if(formRef.current.router_name === ""|| formRef.current.router_name === undefined){
          modalRef2.current.open({ title:"알림", message:"라우터명을 입력하세요.", cancelText:"" });
          return;
        }

        if(formRef.current.arr_proc.length === 0){
          modalRef2.current.open({ title:"알림", message:"공정이 존재하지 않습니다.", cancelText:"" });
          return;
        }

        axiosInstance
          .post(`/api/addRouter`, JSON.stringify(formRef.current))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef2.current.open({ title:"알림", message:error.response.data.message, cancelText:"" });
          });   


      }, 
    });

  };




  // 삭제
  const delData = (params) => {
    console.log("delData");
    
    const sel_rows = gridRef.current.getSelectedRows();
    
    if(sel_rows.length === 0) {
      modalRef.current.open({ title:"알림", message:"선택된 항목이 없습니다.", cancelText:"" });
      return;
    }
    
    // 모달 열기
    modalRef.current.open({
      title:"삭제",
      message:`선택된 행을 삭제하시겠습니까?`,
      confirmText:"삭제",
      confirmClass:"btn btn-danger",
      onCancel:()=>{
        modalRef.current.close();
      },
      onConfirm:(res) => {
        console.log(res);
        
        axiosInstance
          .post(`/api/delRouter`, JSON.stringify(sel_rows))
          .then((res) => {
            getData();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef2.current.open({ title:"알림", message:error.response.data.message, cancelText:"" });
          })
          .finally(() =>{
            modalRef.current.close();
            setLoading(false);
          });
      },
    });
    
  };

  
  return (
    <div style={MainContentStyle}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />
      <Modal ref={modalRef3} />

      <div className="bg-light">
        <Row className="">
          <Col className="d-flex gap-2">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  
                  <th className="bg-light text-end align-middle">라우터코드</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="router_code"
                      value={form.router_code}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                    />
                  </td>     
                  <th className="bg-light text-end align-middle">라우터명</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="router_name"
                      value={form.router_name}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                    />
                  </td>     

                  <th className="bg-light text-end align-middle">사용여부</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Select 
                        name="use_yn" 
                        value={form.use_yn} 
                        onChange={handleChange}
                        size="sm"
                        className="w-auto"
                        style={{minWidth: '100px'}}
                      >
                        <option value="">전체</option>
                        {(selectBox.current.common?.['cd010'] || [])
                          .filter(opt => opt.use_yn === 'Y')
                          .map(opt => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code_name}
                            </option>
                        ))}
                        
                      </Form.Select>
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
              <span className="fw-bold">라우터 목록</span>
              <Button size="sm" variant="success" onClick={addData}>추가</Button>
              <Button size="sm" variant="danger" onClick={delData}>삭제</Button>
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

      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">라우팅 절차</span>
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
}

export default Main;




// 추가 모달 폼
const ModalForm = ({ form={}, onChangeHandler }) => {
  console.log("ModalForm");
  
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  // selectbox
  const selectBox = useRef({}); 

  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      category: '',
      code: ['cd010', 'cd011']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);


  const [modalForm, setModalForm] = useState(form);

  const modalFormChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
    onChangeHandler(name, value);

    if (name !== "arr_proc"){
      onChangeHandler("arr_proc", rowData);
    }
  };


  // 추가 모달 폼 초기화
  const DEFAULT_FORM = (init={}) => ({
    item_dotno: ''
    , item_name: ''
    , ...init
  });

  // 추가 모달 폼 ref
  const formRef = useRef();

  // 추가 모달 폼 ref 변경
  const formRefChange = (params) => {
    formRef.current = params;
  };

  // grid cell code_name 변환
  const typeFormatter = (params, cd) => {
    const arr_client_type = selectBox.current.common?.[cd] || [];
    const item = arr_client_type.find(el => el.code === params.value);
    return item ? item.code_name : params.value; 
  };
  

  let test = [
    { headerName: "공정코드", field: "process_code", sortable: false, editable: false, align:"left"},
    { headerName: "공정명", field: "process_name", sortable: false, editable: false, align:"left" },
    { headerName: "공정유형", field: "process_type", sortable: false, editable: false, align:"center", 
      valueFormatter:(params)=> typeFormatter(params,'cd011')
    },
  ];
  
  
  const gridRef = useRef();  
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState();
  const [columnDefs] = useState(test);

  // 그리드 onGridReady
  const onGridReady = (params) => {
    console.log("onGridReady");
    console.log(params);

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
    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      console.log(ev);

    });

    // 드래그 종료 이벤트
    params.api.addEventListener("rowDragEnd", (ev) => {
      console.log("rowDragEnd");
      console.log(ev);

      // 새로운 순서로 rowData 업데이트
      const rowCount = ev.api.getDisplayedRowCount();
      const updatedData = [];
      for (let i = 0; i < rowCount; i++) {
        const rowNode = ev.api.getDisplayedRowAtIndex(i);
        if (rowNode && rowNode.data) {
          updatedData.push(rowNode.data);
        }
      }
      modalFormChange( {target:{name:"arr_proc",value:updatedData}} );

      // 옵션: 셀 강제 새로고침 (No 컬럼 갱신용)
      setTimeout(() => {
        ev.api.refreshCells({ force: true });
      }, 0);
    });



  };


  // 조회
  const getData = () => {
    console.log("getData");

    setRowData([]);
    setLoading(true);

    axiosInstance
    .post(`/api/getProcess`, JSON.stringify({}))
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

  // 추가
  const addData = (params) => {
    console.log("addData");

    // 폼 초기화
    formRef.current = DEFAULT_FORM();

    modalRef.current.open({
      title: "품목 조회",
      content: <ModalForm2 form={formRef.current} onChangeHandler={formRefChange} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-success",
      onConfirm: (res) => { 
        const sel_row = formRef.current;
        if(sel_row.length > 0){
          modalFormChange( {target:{name:"item_dotno",value:sel_row[0].item_dotno}} );
          modalFormChange( {target:{name:"item_name",value:sel_row[0].item_name}} );
          modalRef.current.close();
        }
        else{
          modalRef2.current.open({ title:"알림", message:"선택된 항목이 없습니다.", cancelText:"" });
        }
    
      }, 
    });

  };

  const delData = () => {
    const selectedNodes = gridRef.current.getSelectedNodes();
    const selectedIds = selectedNodes.map(node => node.data.process_code);
    const updatedData = rowData.filter(row => !selectedIds.includes(row.process_code));
    modalFormChange( {target:{name:"arr_proc",value:updatedData}} );
    setRowData(updatedData);
  };


  return (
    <div style={{ height: '50vh', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
        <tbody>
          <tr>
            <th className="bg-light text-end align-middle">품목코드</th>
            <td className="">
              <Form.Control 
                type="text"
                name="item_dotno"
                value={modalForm.item_dotno}
                onChange={modalFormChange}
                size="sm" 
                className="w-auto"
                disabled
              />
            </td>                    
            <th className="bg-light text-end align-middle">품목명</th>
            <td className="">
              <Form.Control 
                type="text"
                name="item_name"
                value={modalForm.item_name}
                onChange={modalFormChange}
                size="sm" 
                className="w-auto"
                disabled
              />
            </td>
            <td className="" colSpan={2}>
              <Button size="sm" variant="primary" onClick={addData}><i className="bi bi-search"></i> 품목조회</Button>
            </td>
          </tr>
          <tr>
            <th className="bg-light text-end align-middle">라우터코드</th>
            <td className="">
              <Form.Control 
                type="text"
                name="router_code"
                value={modalForm.router_code}
                onChange={modalFormChange}
                size="sm" 
                className="w-auto"
              />
            </td>                    
            <th className="bg-light text-end align-middle">라우터명</th>
            <td className="">
              <Form.Control 
                type="text"
                name="router_name"
                value={modalForm.router_name}
                onChange={modalFormChange}
                size="sm" 
                className="w-auto"
              />
            </td>
            <th className="bg-light text-end align-middle">사용여부</th>
            <td className="">
              <Form.Select 
                name="use_yn" 
                value={modalForm.use_yn} 
                onChange={modalFormChange}
                size="sm"
                className="w-100"
              >
                {(selectBox.current.common?.['cd010'] || [])
                  .filter(opt => opt.use_yn === 'Y')
                  .map(opt => (
                    <option key={opt.code} value={opt.code}>
                      {opt.code_name}
                    </option>
                ))}
              </Form.Select>
            </td>
          </tr>
          <tr>
            <th className="bg-light text-end align-middle">비고</th>
            <td className="" colSpan={5}>
              <Form.Control 
                type="text"
                name="comment"
                value={modalForm.comment}
                onChange={modalFormChange}
                size="sm" 
                className="w-100"
              />
            </td>
            {/* <th className="bg-light text-end align-middle">버전</th>
            <td className="">
              <Form.Control 
                type="text"
                name="version"
                value={modalForm.version}
                onChange={modalFormChange}
                size="sm" 
                className="w-100"
              />
            </td> */}
          </tr>
         
        </tbody>
      </Table>

      <div className="h-100">
      <Row  className="h-100">
        <Col className="h-100 d-flex flex-column" xs={12} md={12}>
          <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
            <span className="fw-bold">라우터 절차</span>
            <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-arrow-clockwise"></i></Button>
            <Button size="sm" variant="danger" onClick={delData}>공정 선택삭제</Button>
          </div>

          <GridExample 
            columnDefs={columnDefs}
            rowData={rowData}
            onGridReady={onGridReady} 
            loading={loading}
            rowNum={true}
            rowSel={"multiRow"}
            pagination={false}
            rowDrag={true}
          />
        </Col>
      </Row>

    </div>

    </div>
  );
};





// 추가 모달 폼
const ModalForm2 = ({ form={}, onChangeHandler }) => {
  console.log("ModalForm");

  const modalRef = useRef();
  const [modalForm, setModalForm] = useState(form);

  const modalFormChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));

  };


  let grid_col4 = [
    { headerName: "품목코드", field: "item_dotno", sortable: true, editable: false, align:"center"},
    { headerName: "품목명", field: "item_name", sortable: true, editable: false, align:"left"},
  ];
  
  
  const gridRef = useRef();  
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState();
  const [columnDefs] = useState(grid_col4);

  // 그리드 onGridReady
  const onGridReady = (params) => {
    console.log("onGridReady");

    gridRef.current = params.api; // Grid API 저장
    getData();

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      console.log(ev);
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      console.log(ev);
    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      console.log(ev);

      const selectedRows = ev.api.getSelectedRows();
      if( ev.source === 'rowClicked'){
        onChangeHandler(selectedRows);
      };

    });

  };


  // 조회
  const getData = () => {
    console.log("getData");

    setRowData([]);
    setLoading(true);

    axiosInstance
    .post(`/api/getItem`, JSON.stringify(modalForm))
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
      // let sel = selectedRow;
      // if(typeof params === "number") sel = params;
      // gridRef.current.forEachNode((node) => {
      //   if (node.rowIndex === sel) {
      //     node.setSelected(true);
      //   }
      // });
    });
    
  };




  return (
    <div style={{ height: '40vh', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <Modal ref={modalRef} />

      <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
        <tbody>
          <tr>
            <th className="bg-light text-end align-middle">품목코드</th>
            <td className="">
              <Form.Control 
                type="text"
                name="item_dotno"
                value={modalForm.item_dotno}
                onChange={modalFormChange}
                size="sm" 
                className="w-auto"
              />
            </td>                    
            <th className="bg-light text-end align-middle">품목명</th>
            <td className="">
              <Form.Control 
                type="text"
                name="item_name"
                value={modalForm.item_name}
                onChange={modalFormChange}
                size="sm" 
                className="w-auto"
              />
            </td>
            <td className="" colSpan={2}>
              <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-search"></i> </Button>
            </td>
          </tr>
          
         
        </tbody>
      </Table>

      <div className="h-100">
      <Row  className="h-100">
        <Col className="h-100 d-flex flex-column" xs={12} md={12}>
          <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
            <span className="fw-bold">품목 목록</span>
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
};
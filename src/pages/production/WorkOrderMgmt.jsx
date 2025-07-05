import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { MainContentStyle2 } from "css/CommonStyle";

import SearchItemComponent from "components/SearchItemComponent";
import SearchClientComponent from "components/SearchClientComponent";
import SearchUserComponent from "components/SearchUserComponent";
import { all } from "axios";


const Main = ({ props={} }) => {

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
  
  const gridRef2 = useRef();  
  const selectedRow2 = useRef(0);
  const [loading2, setLoading2] = useState(false);
  const [rowData2, setRowData2] = useState([]);
  const [columnDefs2, setColumnDefs2] = useState([]);


  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      console.log(ev);
      selectedRow.current = ev.rowIndex; 

      const node = ev.node;
      if (!node.isSelected()) {
        node.setSelected(true);
      }
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
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){
        getData2(selectedRows[0]);
      };

    });

  };

  // 그리드 onGridReady2
  const onGridReady2 = (params) => {
    gridRef2.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      console.log(ev);
      selectedRow2.current = ev.rowIndex; 

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
      };

    });

  };



  // 그리드 설정 종료 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      category: '',
      code: ['cd010', 'cd012', 'cd013', 'cd014']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      // 그리드 설정
      setColumnDefs([
        { headerName: "등록일자", field: "created_at", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "수주번호", field: "sales_id", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
        { headerName: "작업지시코드", field: "work_id", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "제품코드", field: "item_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "제품명", field: "item_name", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
      ]);

      // 그리드 설정
      setColumnDefs2([
        { headerName: "공정코드", field: "process_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "공정명", field: "process_name", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "지시수량", field: "order_qty", sortable: false, editable: true, align:"right", cellDataType:'number',
          valueFormatter:(params)=> moneyFormatter(params)
        },
        { headerName: "상태", field: "status", sortable: true, editable: true, filter: "agTextColumnFilter",  align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd012']?.map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => commonTypeFormatter(params, 'cd012'),
        },
        { headerName: "시작일자", field: "start_date", sortable: false, editable: true, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "시작시간", field: "start_time", sortable: false, editable: true, align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd014'].map((item) => item.code) ?? [],
          },
          valueFormatter:(params)=> commonTypeFormatter(params,'cd014')
        },
        { headerName: "종료일자", field: "end_date", sortable: false, editable: true, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "종료시간", field: "end_time", sortable: false, editable: true, align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd014'].map((item) => item.code) ?? [],
          },
          valueFormatter:(params)=> commonTypeFormatter(params,'cd014')
        },
        { headerName: "비고", field: "remark", sortable: false, editable: true, align:"left"},
        { headerName: "담당자", field: "worker_id", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "등록자", field: "created_by", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "수정자", field: "updated_by", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "수정일", field: "updated_at", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
      ]);
      
      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);



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
    setForm({ ...form, [e.target.name]: e.target.value });
  }; 


  // 추가 모달 입력필드 저장
  const formRef = useRef();

  // 추가 모달 입력필드 변경
  const formRefChange = (name, value) => {
    formRef.current[name] = value;
  };

  // 추가 모달 기본값
  const DEFAULT_FORM = (init={}) => ({
    client_code:'',
    client_name:'',
    user_id:'',
    user_nm:'',
    request_date:'',
    tax_yn: '',
    comment: '',
    ...init
  });


  // 조회
  const getData = (params) => {
    console.log("getData");

    setRowData([]);
    setLoading(true);
    let result_len = 0;

    axiosInstance
    .post(`/api/getWorkOrder`, JSON.stringify(form))
    .then((res) => {
      result_len = res.data.length;
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

  // 조회2
  const getData2 = (params) => {
    console.log("getData2");

    setRowData2([]);
    setLoading2(true);
    
    axiosInstance
    .post(`/api/getWorkOrderDet`, JSON.stringify(params))
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


  // 수정
  const setData = (params) => {
    console.log("setData");

    axiosInstance
      .post("api/setWorkOrder", JSON.stringify(params))
      .then((res) => {
        getData();
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
    formRef.current = DEFAULT_FORM({
      order_id:'',
      item_code:'',
      item_name:'',
      base_unit:'',
      purchase_unit:'',
      quantity:'',
      request_date: new Date().toISOString().split('T')[0],
      stock_qty:'',
      allocated_qty:'',
    });

    modalRef.current.open({
      title: "작업지시 등록",
      content: <ModalComponent form={formRef}  />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"등록",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        
        console.log(formRef.current);
        console.log(formRef.current.sel_row);

        const hasEmptyFields = formRef.current.sel_row.some(row => {
          return (
            row.user_id === undefined || row.user_id === '' ||
            row.quantity === undefined || row.quantity === '' ||
            row.start_date === undefined || row.start_date === '' ||
            row.start_time === undefined || row.start_time === '' ||
            row.end_date === undefined || row.end_date === '' ||
            row.end_time === undefined || row.end_time === ''
          );
        });

        if (hasEmptyFields) {
          modalRef2.current.open({
            title: "알림",
            message: "입력되지 않은 항목이 있습니다.",
            cancelText: ""
          });
          return;
        }
        
        axiosInstance
          .post(`/api/addWorkOrder`, JSON.stringify(formRef.current))
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

  // 추가2
  const addData2 = (params) => {
    console.log("addData");

    // 폼 초기화
    formRef.current = DEFAULT_FORM({
      order_id:'',
      item_code:'',
      item_name:'',
      base_unit:'',
      purchase_unit:'',
      quantity:'',
      request_date: new Date().toISOString().split('T')[0],
      stock_qty:'',
      allocated_qty:'',
    });

    modalRef.current.open({
      title: "작업지시 등록",
      content: <ModalComponent form={formRef}  />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"등록",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        
        console.log(formRef.current);
        console.log(formRef.current.sel_row);

        const hasEmptyFields = formRef.current.sel_row.some(row => {
          return (
            row.quantity === undefined || row.quantity === '' ||
            row.start_date === undefined || row.start_date === '' ||
            row.start_time === undefined || row.start_time === '' ||
            row.end_date === undefined || row.end_date === '' ||
            row.end_time === undefined || row.end_time === ''
          );
        });

        if (hasEmptyFields) {
          modalRef2.current.open({
            title: "알림",
            message: "입력되지 않은 항목이 있습니다.",
            cancelText: ""
          });
          return;
        }
        
        axiosInstance
          .post(`/api/addWorkOrder`, JSON.stringify(formRef.current))
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

   // 삭제2
  const delData2 = (params) => {
    console.log("delData");

    const selectRows = gridRef2.current.getSelectedRows();
    
    if(selectRows.length === 0) {
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
          .post("api/delWorkOrder", JSON.stringify(selectRows))
          .then((res) => {
            getData();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef2.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
          })
          .finally(() =>{
            modalRef.current.close();            
          });
        
      },
    });

     
  };
  
  return (
    <div style={MainContentStyle2}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />
      <Modal ref={modalRef3} />

      <div className="bg-light">
        <Row className="">
          <Col className="">
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
                      />
                    </div>
                  </td>
                  <th className="bg-light text-end align-middle">상태</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Select 
                        name="item_type" 
                        value={form.item_type} 
                        onChange={handleChange}
                        size="sm"
                        className="w-auto"
                        style={{minWidth:100}}
                      >
                        <option value="">전체</option>
                        {(selectBox.current.common?.['cd012'] || [])
                          .filter(opt => opt.use_yn === 'Y' )
                          .map(opt => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code_name}
                            </option>
                        ))}
                      </Form.Select>               
                    </div>
                  </td>
                  
                </tr>
              </tbody>
            </Table>
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">작업지시코드</th>
                  <td className="">
                      <Form.Control 
                        type="text"
                        name="work_id"
                        value={form.work_id}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
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
                      />
                      <Form.Control 
                        type="text"
                        name="item_name"
                        value={form.item_name}
                        onChange={handleChange}
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
        <Row  className="pb-1">
          <Col className="d-flex gap-2 align-items-center" xs={12} md={4}>
              <span className="py-1 fw-bold">작업지시 목록</span>
              <Button size="sm" variant="success" onClick={addData}>등록</Button>
          </Col>

          <Col className="d-flex gap-2 align-items-center" xs={12} md={8}>
              <span className="py-1 fw-bold">작업지시 상세</span>
              {/* <Button size="sm" variant="success" onClick={addData2}>추가</Button> */}
              <Button size="sm" variant="danger" onClick={delData2}>삭제</Button>
          </Col>
        </Row>

        <Row  className="h-100">
          <Col className="h-100 d-flex flex-column" xs={12} md={4}>
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
          
          <Col className="h-100 d-flex flex-column" xs={12} md={8}>
            <GridExample 
              columnDefs={columnDefs2}
              rowData={rowData2}
              onGridReady={onGridReady2} 
              loading={loading2}
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





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




const ModalComponent = ({ form }) => {
  console.log("ModalComponent");

  // form
  const [modalForm, setModalForm] = useState(form.current);
  const modalFormChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
    form.current[name] = value;
  };

    // grid cell code_name 변환
  const categoryAFormatter = (params) => {
    const arr_type = selectBox.current.category?.item_group_a || [];
    const item = arr_type.find(el => el.category_id === params.value);
    return item ? item.category_nm : params.value; 
  };

  // grid cell code_name 변환
  const categoryBFormatter = (params) => {
    const arr_type = selectBox.current.category?.item_group_b[params.data.item_group_a] || [];
    const item = arr_type.find(el => el.category_id === params.value);
    return item ? item.category_nm : params.value; 
  };

  // grid cell code_name 변환
  const commonTypeFormatter = (params, cd) => {
    const arr_type = selectBox.current.common?.[cd] || [];
    const item = arr_type.find(el => el.code === params.value);
    return item ? item.code_name : params.value; 
  };

  // grid cell code_name 변환
  const moneyFormatter = (params) => {
    if (params.value == null) return '';
    const num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
    return num;
  };

  const ButtonRenderer = (props) => {
    const handleClick = () => {
      console.log("ButtonRenderer clicked");
      getData4(props);
    };

    return (
      <div style={{ width:'100%', display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{props.value}</span>
        <Button size="sm" variant="primary" onClick={handleClick}><i className="bi bi-search"></i></Button>
      </div>
    ); 
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
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      console.log(ev);

      const col = ev.colDef.field;
      if(col === "quantity" || col === "unit_price"){
        const supply = parseInt(ev.data.quantity) * parseInt(ev.data.unit_price);
        const tax = supply * 0.1 ;
        const total = supply + tax ;

        ev.node.setDataValue("supply_price", supply);
        ev.node.setDataValue("tax", tax);
        ev.node.setDataValue("total_price", total);
      }

      if(col === "tax"){
        const total = parseInt(ev.data.supply_price) + parseInt(ev.data.tax);
        ev.node.setDataValue("total_price", total);
      }

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
      category: '',
      code: ['cd010', 'cd011', 'cd014']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;


      const col_b = [
        { headerName: "품목코드", field: "item_code", sortable: true, editable: false, align:"center", filter: "agTextColumnFilter" },
        { headerName: "품목명", field: "item_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter" },
        { headerName: "공정코드", field: "process_code", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter" },
        { headerName: "공정명", field: "process_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter" },
        { headerName: "작업자ID", field: "user_id", sortable: true, editable: false },
        { headerName: "작업자명", field: "user_nm", sortable: true, editable: false, cellRenderer: ButtonRenderer },
        { headerName: "지시수량", field: "quantity", sortable: true, editable: true, align:"right",
          valueFormatter:(params)=> moneyFormatter(params)
        },
        { headerName: "작업시작일자", field: "start_date", sortable: true, editable: true, align:"center", cellDataType:'dateString'},
        { headerName: "작업시작시간", field: "start_time", sortable: true, editable: true, align:"center", 
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd014'].map((item) => item.code) ?? [],
          },
          valueFormatter:(params)=> commonTypeFormatter(params,'cd014')
        },
        { headerName: "작업종료일자", field: "end_date", sortable: true, editable: true, align:"center", cellDataType:'dateString'},
        { headerName: "작업종료시간", field: "end_time", sortable: true, editable: true, align:"center", 
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd014'].map((item) => item.code) ?? [],
          },
          valueFormatter:(params)=> commonTypeFormatter(params,'cd014')
        },
        { headerName: "비고", field: "comment2", sortable: false, editable: true, align:"left" },
      ];

      const col_a = [
        { headerName: "공정코드", field: "process_code", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter"},
        { headerName: "공정명", field: "process_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter" },
        { headerName: "공정유형", field: "process_type", sortable: true, editable: false, align:"center", filter: "agTextColumnFilter", 
          valueFormatter:(params)=> commonTypeFormatter(params,'cd011')
        },
        { headerName: "검사여부", field: "check_yn", sortable: true, editable: false, align:"center",
          // backgroundColor: "#a7d1ff29",
          cellRenderer: 'agCheckboxCellRenderer',
          cellRendererParams: {
            disabled: true,
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
        { headerName: "사용여부", field: "use_yn", sortable: true, editable: false, align:"center",
          // backgroundColor: "#a7d1ff29",
          cellRenderer: 'agCheckboxCellRenderer',
          cellRendererParams: {
            disabled: true,
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
        { headerName: "비고", field: "comment", sortable: false, editable: false, align:"left", minWidth:500 },
      ];

      // 공정목록 그리드 설정
      setColumnDefs(col_a);
      setColumnDefs2(col_b);

      getData();
  
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);
  

  // 제품변경시 공정목록 새로고침
  useEffect(()=>{
    getData();
  }, [modalForm])

  // 그리드 데이터 변경 감지
  useEffect(()=>{
    form.current['sel_row'] = rowData2;
  }, [rowData2])





  // 모달 입력필드
  const formRef = useRef();
  const formRef2 = useRef();
  const formRef3 = useRef();
  const formRef4 = useRef();


  // 조회
  const getData = (params) => {
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


  // 조회2
  const getData2 = (params) => {

    formRef2.current = {
      sel_row:{},
    };

    modalRef.current.open({
      title: "수주 조회",
      content: <ModalSalesOrderComponent props={formRef2} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        const row = formRef2.current.sel_row;
        console.log(row);
        if(!row || Object.keys(row).length === 0){
          modalRef2.current.open({ title:"알림", message:"수주의 상세품목을 선택하세요.", cancelText:"" });
          return;
        }

        modalFormChange({target:{name:'order_id', value:row.order_id}});
        modalFormChange({target:{name:'item_code', value:row.item_code}});
        modalFormChange({target:{name:'item_name', value:row.item_name}});
        modalFormChange({target:{name:'base_unit', value:row.base_unit}});
        modalFormChange({target:{name:'purchase_unit', value:row.purchase_unit}});
        modalFormChange({target:{name:'quantity', value:row.quantity}});
        
        modalRef.current.close();

      }, 
    });
    
  };

  // 조회3
  const getData3 = (params) => {

    formRef3.current = {
      sel_row:{},
    };

    modalRef.current.open({
      title: "품목 조회",
      content: <SearchItemComponent form={formRef3} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        const row = formRef3.current.sel_row;
        console.log(row);
        if(!row || Object.keys(row).length === 0){
          modalRef2.current.open({ title:"알림", message:"수주의 상세품목을 선택하세요.", cancelText:"" });
          return;
        }

        modalFormChange({target:{name:'item_code', value:row.item_code}});
        modalFormChange({target:{name:'item_name', value:row.item_name}});
        modalFormChange({target:{name:'base_unit', value:row.base_unit}});
        modalFormChange({target:{name:'purchase_unit', value:row.purchase_unit}});
        modalFormChange({target:{name:'quantity', value:row.quantity}});
        
        modalRef.current.close();

      }, 
    });
    
  };

  // 조회4
  const getData4 = (params) => {
    console.log("getData4");
    console.log(params);

    formRef4.current = {
      sel_row:{},
    };

    modalRef.current.open({
      title: "사용자 조회",
      content: <SearchUserComponent form={formRef4} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        const row = formRef4.current.sel_row;
        console.log(row);
        if(!row || Object.keys(row).length === 0){
          modalRef2.current.open({ title:"알림", message:"사용자를 선택하세요.", cancelText:"" });
          return;
        }
        
        // 기존 데이터 가져오기
        const oldData = params.node.data;
        // 기존 데이터에 새로운 필드 추가 (immutable 방식 권장)
        const newData = {
          ...oldData,
          user_id: row.user_id,
          user_nm: row.user_nm,
        };

        setRowData2(prev => prev.map(row => 
          row.process_code === params.node.data.process_code ? newData : row
        ));

        modalRef.current.close();

      }, 
    });
    
  };




  const id_cnt = useRef(1);
  const addData = () => {
    console.log("addData");
    
    console.log(form.current);
    if(!form.current.item_code || form.current.item_code === ''){
      modalRef2.current.open({ title:"알림", message:"제품을 입력하세요.", cancelText:"" });
      return;
    }
    
    const sel_rows = gridRef.current.getSelectedRows();
    console.log(sel_rows);
    if(sel_rows.length === 0){
      modalRef2.current.open({ title:"알림", message:"공정을 선택하세요.", cancelText:"" });
      return;
    }
    
    const updatedRows = sel_rows.map(item => {
      const newItem = { ...item };  // 얕은 복사
      newItem.id = `${Date.now()}_${id_cnt.current++}`;
      newItem.order_id = modalForm.order_id;
      newItem.item_code = modalForm.item_code;
      newItem.item_name = modalForm.item_name;
      newItem.base_unit = modalForm.base_unit;
      newItem.purchase_unit = modalForm.purchase_unit;
      newItem.quantity = modalForm.quantity;
      newItem.start_date = '';
      newItem.start_time = '';
      newItem.end_date = '';
      newItem.end_time = '';
      newItem.remark = '';

      return newItem;
    });

    console.log(rowData2);
    console.log(updatedRows);

    setRowData2(prev => {
      const existingIds = new Set(prev.map(row => row.process_code));
      const nonDuplicateRows = updatedRows.filter(row => !existingIds.has(row.process_code));
      return [...prev, ...nonDuplicateRows];
    });

  };

  const delData = () => {
    console.log("delData");
    console.log(rowData2);
    const sel_rows = gridRef2.current.getSelectedRows();
    const sel_row_ids = sel_rows.map(item => item.id);
    setRowData2(prev => prev.filter(item => !sel_row_ids.includes(item.id)));
  };



  return (
    <div style={{ height: '60vh', width:'80vw', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="">
            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">수주번호</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="order_id"
                      value={modalForm.order_id}
                      onChange={modalFormChange}
                      size="sm" 
                      className="w-100"
                      disabled
                      /> 
                  </td>
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData2}><i className="bi bi-search"></i></Button>
                  </td>
                  <th className="bg-light text-end align-middle">제품코드</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="item_code"
                      value={modalForm.item_code}
                      onChange={modalFormChange}
                      size="sm" 
                      className="w-100"
                      disabled
                      /> 
                  </td>
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData3}><i className="bi bi-search"></i></Button>
                  </td>
                </tr>
                </tbody>
            </Table>

            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  
                  <th className="bg-light text-end align-middle">제품명</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="item_name"
                      value={modalForm.item_name}
                      onChange={modalFormChange}
                      size="sm" 
                      className="w-100"
                      disabled
                      /> 
                  </td>
                  <th className="bg-light text-end align-middle">규격</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="base_unit"
                      value={modalForm.base_unit}
                      onChange={modalFormChange}
                      size="sm" 
                      className="w-100"
                      disabled
                      /> 
                  </td>
                  <th className="bg-light text-end align-middle">단위</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="purchase_unit"
                      value={modalForm.purchase_unit}
                      onChange={modalFormChange}
                      size="sm" 
                      className="w-100"
                      disabled
                      /> 
                  </td>
                </tr>

                <tr>
                  <th className="bg-light text-end align-middle">수주량</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="quantity"
                      value={modalForm.quantity}
                      onChange={modalFormChange}
                      size="sm" 
                      className="w-100"
                      disabled
                      /> 
                  </td>
                  <th className="bg-light text-end align-middle">재고수량</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="stock_qty"
                      value={modalForm.stock_qty}
                      onChange={modalFormChange}
                      size="sm" 
                      className="w-100"
                      disabled
                      /> 
                  </td>
                  <th className="bg-light text-end align-middle">할당재고</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="allocated_qty"
                      value={modalForm.allocated_qty}
                      onChange={modalFormChange}
                      size="sm" 
                      className="w-100"
                      disabled
                      /> 
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
              <span className="fw-bold my-2">공정 목록</span>
              <Button size="sm" variant="primary" onClick={addData}>공정추가</Button>
            </div>

            <GridExample
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              // pageSize={10}  
              pagination={false}
            />
          </Col>


        </Row>

      </div>

      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 pt-2 d-flex flex-column" xs={12} md={12}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">작업지시 목록</span>
              <Button size="sm" variant="danger" onClick={delData}>선택삭제</Button>
            </div>

            <GridExample
              columnDefs={columnDefs2}
              rowData={rowData2}
              onGridReady={onGridReady2} 
              loading={loading2}
              rowNum={true}
              rowSel={"singleRow"}
              // pageSize={10}  
              pagination={false}
            />
          </Col>


        </Row>

      </div>


    </div>
  );
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




const ModalSalesOrderComponent = ({ props={} }) => {

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
  const categoryAFormatter = (params) => {
    const arr_client_type = selectBox.current.category?.item_group_a || [];
    const item = arr_client_type.find(el => el.category_id === params.value);
    return item ? item.category_nm : params.value; 
  };

  // grid cell code_name 변환
  const categoryBFormatter = (params) => {
    console.log(params);
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
      console.log(ev);
      selectedRow.current = ev.rowIndex; 

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
        getData2(selectedRows[0]);
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
    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      console.log(ev);
      const selectedRows = ev.api.getSelectedRows();
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){
        modalFormChange({ target: {name:"sel_row", value:selectedRows[0]} });
      }else{
        modalFormChange({ target: {name:"sel_row", value:{}} });
      }
     
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
        { headerName: "등록일자", field: "created_at", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "수주번호", field: "order_id", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
        { headerName: "거래처코드", field: "client_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "거래처명", field: "client_name", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "수주일자", field: "order_date", sortable: true, editable: false, filter: "agDateColumnFilter", align:"center",
          cellRendererSelector: (params) => {
            if (params.node.rowPinned) {
              return {
                component: ()=>{
                  return (
                    <span>합계</span>
                  );
                }
              };
            }
            return undefined;
          },
        },
        { headerName: "공급가", field: "supply_price", sortable: true, editable: false, align:"right",
          cellRendererSelector: (params) => {
            if (params.node.rowPinned) {
              return {
                component: ()=>{
                  return (
                    <span>{ moneyFormatter({ value: rowPin(params) }) }</span>
                  );
                }
              };
            }
            return undefined;
          },
          valueFormatter: (params) => moneyFormatter(params)
        },
        { headerName: "부가세", field: "tax", sortable: true, editable: false, align:"right",
          cellRendererSelector: (params) => {
            if (params.node.rowPinned) {
              return {
                component: ()=>{
                  return (
                    <span>{ moneyFormatter({ value: rowPin(params) }) }</span>
                  );
                }
              };
            }
            return undefined;
          },
          valueFormatter: (params) => moneyFormatter(params)
        },
        { headerName: "합계", field: "total_price", sortable: true, editable: false, align:"right",
          cellRendererSelector: (params) => {
            if (params.node.rowPinned) {
              return {
                component: ()=>{
                  return (
                    <span>{ moneyFormatter({ value: rowPin(params) }) }</span>
                  );
                }
              };
            }
            return undefined;
          },
          valueFormatter: (params) => moneyFormatter(params)
        },
        { headerName: "수주상태", field: "status", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd012']?.map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => commonTypeFormatter(params, 'cd012'),
        },
        { headerName: "비고", field: "comment", sortable: false, editable: false, align:"left"},
        { headerName: "담당자", field: "request_id", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "등록자", field: "created_by", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "수정자", field: "updated_by", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "수정일", field: "updated_at", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
      ]);
      
      // 그리드 설정2
      setColumnDefs2([
        { headerName: "수주번호", field: "order_id", sortable: false, editable: false, align:"center"},
        { headerName: "진행상태", field: "status", sortable: false, editable: false, align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd013']?.map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => commonTypeFormatter(params, 'cd013'),
        },
        { headerName: "품목코드", field: "item_code", sortable: false, editable: false, align:"center"},
        { headerName: "품목명", field: "item_name", sortable: false, editable: false, align:"left"}, 
        { headerName: "기준단위", field: "base_unit", sortable: false, editable: false, align:"center"},
        { headerName: "구매단위", field: "purchase_unit", sortable: false, editable: false, align:"center"}, 
        { headerName: "수주수량", field: "quantity", sortable: false, 
          align:"right", 
          editable: false , 
          cellRendererSelector: (params) => {
            if (params.node.rowPinned) {
              return {
                component: ()=>{
                  return (
                    <span>{ moneyFormatter({ value: rowPin(params) }) }</span>
                  );
                }
              };
            }
            return undefined;
          },
          valueFormatter: (params) => moneyFormatter(params)
        }, 
        { headerName: "단가", field: "unit_price", sortable: false, editable: false, align:"right", 
          cellRendererSelector: (params) => {
            if (params.node.rowPinned) {
              return {
                component: ()=>{
                  return (
                    <span>{ moneyFormatter({ value: rowPin(params, 'sum') }) }</span>
                  );
                }
              };
            }
            return undefined;
          },
          valueFormatter: (params) => moneyFormatter(params)
        }, 
        { headerName: "공급가", field: "supply_price", sortable: false, editable: false, align:"right",
          cellRendererSelector: (params) => {
            if (params.node.rowPinned) {
              return {
                component: ()=>{
                  return (
                    <span>{ moneyFormatter({ value: rowPin(params) }) }</span>
                  );
                }
              };
            }
            return undefined;
          },
           valueFormatter: (params) => moneyFormatter(params)
          }, 
        { headerName: "부가세", field: "tax", sortable: false, editable: false, align:"right", 
          cellRendererSelector: (params) => {
            if (params.node.rowPinned) {
              return {
                component: ()=>{
                  return (
                    <span>{ moneyFormatter({ value: rowPin(params) }) }</span>
                  );
                }
              };
            }
            return undefined;
          },
          valueFormatter: (params) => moneyFormatter(params)
        }, 
        { headerName: "합계", field: "total_price", sortable: false, editable: false, align:"right", 
          cellRendererSelector: (params) => {
            if (params.node.rowPinned) {
              return {
                component: ()=>{
                  return (
                    <span>{ moneyFormatter({ value: rowPin(params) }) }</span>
                  );
                },
              };
            } else {
              // rows that are not pinned don't use any cell renderer
              return undefined;
            }
          },
          valueFormatter: (params) => moneyFormatter(params)
        }, 
        { headerName: "입고검사여부", field: "incoming_inspection", sortable: false, editable: false, align:"center"}, 
        { headerName: "출고수량", field: "delivery_qty", sortable: false, 
          align:"right", 
          editable: false, 
          cellRendererSelector: (params) => {
            if (params.node.rowPinned) {
              return {
                component: ()=>{
                  return (
                    <span>{ moneyFormatter({ value: rowPin(params) }) }</span>
                  );
                },
                
              };
            }
            return undefined;
          },
          valueFormatter: (params) => moneyFormatter(params)
        }, 
        { headerName: "납기예정일", field: "due_date", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center", cellDataType:'dateString'},
        { headerName: "비고", field: "comment", sortable: false, editable: false, align:"left"}, 
      ]);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);



  // 검색창 입력필드
  const [form, setForm] = useState({
     start_date : ''
    , end_date : ''
    , purchase_id : ''
    , client_code : ''
    , client_name : ''
    , status : ''
  });


  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }; 


  // 추가 모달 입력필드 저장
  const formRef = useRef();

  // 추가 모달 입력필드 변경
  const formRefChange = (name, value) => {
    formRef.current[name] = value;
  };

  // 추가 모달 기본값
  const DEFAULT_FORM = (init={}) => ({
    client_code:'',
    client_name:'',
    user_id:'',
    user_nm:'',
    request_date:'',
    tax_yn: '',
    comment: '',
    ...init
  });


  // 조회
  const getData = (params) => {
    console.log("getData");

    setRowData([]);
    setLoading(true);
    
    axiosInstance
    .post(`/api/getSalesOrder`, JSON.stringify(form))
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
      console.log(sel);
      if(typeof params === "number") sel = params;
      console.log(sel);
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
    .post(`/api/getSalesOrderDet`, JSON.stringify(params))
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


  // 수정
  const setData = (params) => {
    console.log("setData");

    axiosInstance
      .post("api/setSalesOrder", JSON.stringify(params))
      .then((res) => {
        getData(selectedRow.current);
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
      .post("api/setSalesOrderDet", JSON.stringify(params))
      .then((res) => {
        getData(selectedRow.current);
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
    formRef.current = DEFAULT_FORM({
      request_date: new Date().toISOString().split('T')[0],
    });

    modalRef.current.open({
      title: "수주 추가",
      content: <ModalComponent form={formRef}  />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        
        console.log(formRef.current);

        if(!formRef.current.user_id){
          modalRef2.current.open({ title:"알림", message:"사용자를 선택하세요.", cancelText:"" });
          return;
        }

        if(!formRef.current.client_code){
          modalRef2.current.open({ title:"알림", message:"거래처를 선택하세요.", cancelText:"" });
          return;
        }

        if(!formRef.current.request_date){
          modalRef2.current.open({ title:"알림", message:"등록일을 입력하세요.", cancelText:"" });
          return;
        }

        if(formRef.current.sel_row.length === 0){
          modalRef2.current.open({ title:"알림", message:"품목이 존재하지 않습니다.", cancelText:"" });
          return;
        }

        const key = "total_price";
        const arr = formRef.current.sel_row;
        const chk = arr.some(item => !item.hasOwnProperty(key) || item[key] === '' || item[key] === null || item[key] === undefined);
        if(chk){
          modalRef2.current.open({ title:"알림", message:"수주수량을 입력하세요.", cancelText:"" });
          return ;
        }

        axiosInstance
          .post(`/api/addSalesOrder`, JSON.stringify(formRef.current))
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
  
  return (
    <div style={{ height: '70vh', width:'70vw', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />
      <Modal ref={modalRef3} />

      <div className="bg-light">
        <Row className="">
          <Col className="">
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
                      />
                    </div>
                  </td>
                  <th className="bg-light text-end align-middle">수주상태</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Select 
                        name="item_type" 
                        value={form.item_type} 
                        onChange={handleChange}
                        size="sm"
                        className="w-auto"
                        style={{minWidth:100}}
                      >
                        <option value="">전체</option>
                        {(selectBox.current.common?.['cd012'] || [])
                          .filter(opt => opt.use_yn === 'Y' )
                          .map(opt => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code_name}
                            </option>
                        ))}
                      </Form.Select>               
                    </div>
                  </td>
                  
                </tr>
              </tbody>
            </Table>
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">수주번호</th>
                  <td className="">
                      <Form.Control 
                        type="text"
                        name="purchase_id"
                        value={form.purchase_id}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                      />
                  </td>
                  <th className="bg-light text-end align-middle">거래처</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="client_code"
                        value={form.client_code}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                      />
                      <Form.Control 
                        type="text"
                        name="client_name"
                        value={form.client_name}
                        onChange={handleChange}
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
              <span className="fw-bold">수주 목록</span>
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pageSize={10}
              pinnedBottomRowData={pinnedBottomRowData}  
            />
          </Col>
        </Row>

      </div>

      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">수주 상세</span>
              
            </div>

            <GridExample 
              columnDefs={columnDefs2}
              rowData={rowData2}
              onGridReady={onGridReady2} 
              loading={loading2}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={false}
              pinnedBottomRowData={pinnedBottomRowData2}
            />
          </Col>
        </Row>

      </div>
    

    </div>
  );
}
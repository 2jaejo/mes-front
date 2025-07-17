import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { MainContentStyle2 } from "css/CommonStyle";

import SearchItemComponent from "components/SearchItemComponent";
import SearchUserComponent from "components/SearchUserComponent";
import ItemMgmtCompent from "../master/ItemMgmt";

import dayjs from 'dayjs'

const Main = ({ props={}, isActive}) => {

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
      setData(ev.data);

    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      console.log(ev);
      
      const selectedRows = ev.api.getSelectedRows();
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){
        // getData2(selectedRows[0]);
      };

    });

  };

  


  // 그리드 설정 종료 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    if( !isActive ) return;
    
    const init = {
      category: '',
      code: ['cd010', 'cd016', 'cd013', 'cd014']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      // 그리드 설정
      setColumnDefs([
        { headerName: "수주번호", field: "sales_id", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
        { headerName: "작업지시코드", field: "work_id", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center", width:150 },
        { headerName: "제품코드", field: "item_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "제품명", field: "item_name", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left", width:200 },
        { headerName: "공정명", field: "process_name", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "지시수량", field: "order_qty", sortable: false, editable: (params) => params.data.status !== 'end', align:"right", cellDataType:'number',
          valueFormatter:(params)=> moneyFormatter(params)
        },
        { headerName: "시작일자", field: "start_date", sortable: false, editable: (params) => params.data.editable, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "시작시간", field: "start_time", sortable: false, editable: (params) => params.data.editable, align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd014'].map((item) => item.code) ?? [],
          },
          valueFormatter:(params)=> commonTypeFormatter(params,'cd014')
        },
        { headerName: "종료일자", field: "end_date", sortable: false, editable: (params) => params.data.editable, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "종료시간", field: "end_time", sortable: false, editable: (params) => params.data.editable, align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd014'].map((item) => item.code) ?? [],
          },
          valueFormatter:(params)=> commonTypeFormatter(params,'cd014')
        },
        { headerName: "상태", field: "status", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd016']?.map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => commonTypeFormatter(params, 'cd016'),
        },
        { headerName: "담당자", field: "worker_id", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "등록일", field: "created_at", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "등록자", field: "created_by", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "수정일", field: "updated_at", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "수정자", field: "updated_by", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "비고", field: "remark", sortable: false, editable: true, align:"left"},
      ]);

    
      getData();
      
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[isActive]);



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


   // 삭제2
  const delData2 = (params) => {
    console.log("delData");

    const selectRows = gridRef.current.getSelectedRows();
    
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
                  {/* <th className="bg-light text-end align-middle">상태</th>
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
                        {(selectBox.current.common?.['cd016'] || [])
                          .filter(opt => opt.use_yn === 'Y' )
                          .map(opt => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code_name}
                            </option>
                        ))}
                      </Form.Select>               
                    </div>
                  </td> */}
                  
                {/* </tr>
              </tbody>
            </Table>
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr> */}
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
          <Col className="d-flex gap-2 align-items-center" xs={12} md={12}>
              <span className="py-1 fw-bold">작업지시 목록</span>
              <Button size="sm" variant="success" onClick={addData}>등록</Button>
              <Button size="sm" variant="danger" onClick={delData2}>삭제</Button>
          </Col>

          {/* <Col className="d-flex gap-2 align-items-center" xs={12} md={8}>
              <span className="py-1 fw-bold">작업지시 상세</span>
              <Button size="sm" variant="success" onClick={addData2}>추가</Button>
          </Col> */}
        </Row>

        <Row  className="h-100">
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pageSize={25}
            />
          </Col>
          
          {/* <Col className="h-100 d-flex flex-column" xs={12} md={8}>
            <GridExample 
              columnDefs={columnDefs2}
              rowData={rowData2}
              onGridReady={onGridReady2} 
              loading={loading2}
              rowNum={true}
              rowSel={"singleRow"}
              pageSize={10}
            />
          </Col> */}
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

      setColumnDefs([
        // { headerName: "공정코드", field: "process_code", sortable: false, editable: false, align:"left", width:50},
        { headerName: "공정명", field: "process_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter" },
        // { headerName: "공정유형", field: "process_type", sortable: true, editable: false, align:"center", filter: "agTextColumnFilter", 
        //   valueFormatter:(params)=> commonTypeFormatter(params,'cd011')
        // },
        // { headerName: "비고", field: "comment", sortable: false, editable: false, align:"left", minWidth:500 },
      ]);

      setColumnDefs2([
        // { headerName: "품목코드", field: "item_code", sortable: true, editable: false, align:"center", filter: "agTextColumnFilter" },
        { headerName: "품목명", field: "item_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter", width:200 },
        // { headerName: "공정코드", field: "process_code", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter" },
        { headerName: "공정명", field: "process_name", sortable: false, editable: false, align:"left", },
        { headerName: "공정유형", field: "process_type", sortable: false, editable: false, align:"center",
          valueFormatter:(params)=> commonTypeFormatter(params,'cd011')
        },
        // { headerName: "작업자ID", field: "user_id", sortable: false, editable: false },
        { headerName: "작업자명", field: "user_nm", sortable: false, editable: false, cellRenderer: ButtonRenderer },
        { headerName: "지시수량", field: "quantity", sortable: false, editable: true, align:"right",
          valueFormatter:(params)=> moneyFormatter(params)
        },
        { headerName: "작업시작일자", field: "start_date", sortable: false, editable: true, align:"center", cellDataType:'dateString'},
        { headerName: "작업시작시간", field: "start_time", sortable: false, editable: true, align:"center", 
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd014'].map((item) => item.code) ?? [],
          },
          valueFormatter:(params)=> commonTypeFormatter(params,'cd014')
        },
        { headerName: "작업종료일자", field: "end_date", sortable: false, editable: true, align:"center", cellDataType:'dateString'},
        { headerName: "작업종료시간", field: "end_time", sortable: false, editable: true, align:"center", 
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd014'].map((item) => item.code) ?? [],
          },
          valueFormatter:(params)=> commonTypeFormatter(params,'cd014')
        },
        { headerName: "비고", field: "comment2", sortable: false, editable: true, align:"left" },
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
      "intNowPage": 1,
      "maxCnt": 0,
      "dateValue": "3",
      stdate: dayjs().add(-7, 'day').format('YYYY-MM-DD'),
      endate: dayjs().format('YYYY-MM-DD'),
      "orderValue": "",
      "transType": "",
      "orderStatus": "",
      "shipedStatus": "",
      "cancelYn": "",
      "storageName": "",
      "mediaOrderNo01": "",
      "mediaName": "",
      "invoceNo": "",
      "orderCode": "",
      sel_row:[],
    };

    console.log(formRef2.current);

    modalRef.current.open({
      title: "주문 조회",
      content: <ModalSalesOrderComponent props={formRef2} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        const row = formRef2.current.sel_row[0];
        console.log(row);
        if(!row || Object.keys(row).length === 0){
          modalRef2.current.open({ title:"알림", message:"수주의 상세품목을 선택하세요.", cancelText:"" });
          return;
        }

        modalFormChange({target:{name:'order_id', value:row.orderCode}});
        modalFormChange({target:{name:'item_code', value:row.itemDotno}});
        modalFormChange({target:{name:'item_name', value:row.itemName}});
        modalFormChange({target:{name:'quantity', value:row.orderQty}});

        const params = {
          "intNowPage": 1,
          "storageName":"적성창고",
          "itemDotno":row.itemDotno
        };

        axiosInstance
          .post(`/api/getOsmStockItemStorageList`, JSON.stringify(params))
          .then((res) => {
            const row = res.data[0];
            modalFormChange({target:{name:'stock_qty', value:row.endQty}});
            modalFormChange({target:{name:'allocated_qty', value:row.endShipQty}});
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
        
        modalRef.current.close();

      }, 
    });
    
  };

  // 조회3
  const getData3 = (params) => {

    // formRef3.current = {
    //   sel_row:[],
    // };

    formRef3.current = {
      "intNowPage": 1,
      "storageName": "적성창고",
      "itemCode": "",
      "itemDotno": "",
      sel_row:[],
    };

    modalRef.current.open({
      title: "품목 조회",
      // content: <ItemMgmtCompent props={formRef3} />,
      content: <ModalStockItemComponent props={formRef3} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        const row = formRef3.current.sel_row[0];
        console.log(row);
        if(!row || Object.keys(row).length === 0){
          modalRef2.current.open({ title:"알림", message:"품목을 선택하세요.", cancelText:"" });
          return;
        }

        modalFormChange({target:{name:'order_id', value:""}});
        modalFormChange({target:{name:'quantity', value:0}});
        modalFormChange({target:{name:'item_code', value:row.itemDotno}});
        modalFormChange({target:{name:'item_name', value:row.itemName}});
        modalFormChange({target:{name:'stock_qty', value:row.endQty}});
        modalFormChange({target:{name:'allocated_qty', value:row.endShipQty}});

        // 품목 변경시 기존 지시대기 목록 삭제
        // setRowData2([]);

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
          row.process_code === params.node.data.process_code &&
          row.item_code === params.node.data.item_code ? newData : row
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
      newItem.quantity = modalForm.quantity === 0 ? 100 : modalForm.quantity;
      newItem.start_date = dayjs().add(1, 'day').format('YYYY-MM-DD');
      newItem.start_time = '09:00';
      newItem.end_date = dayjs().add(1, 'day').format('YYYY-MM-DD');
      newItem.end_time = '12:00';
      newItem.remark = '';

      return newItem;
    });

    console.log(rowData2);
    console.log(updatedRows);

    setRowData2(prev => {
      const makeKey = (row) => `${row.process_code}_${row.item_code}`;
      const existingIds = new Set(prev.map(makeKey));
      const nonDuplicateRows = updatedRows.filter(row => !existingIds.has(makeKey(row)));
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
    <div style={{ height: '80vh', width:'80vw', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="">
            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">주문번호</th>
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
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData3}><i className="bi bi-search"></i></Button>
                  </td>
                </tr>
                </tbody>
            </Table>

            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>

                <tr>
                  <th className="bg-light text-end align-middle">주문량</th>
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
                  <th className="bg-light text-end align-middle">할당가능재고</th>
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
          <Col className="h-100 d-flex flex-column" xs={12} md={2}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">공정 목록</span>
              <Button size="sm" variant="primary" onClick={addData}>선택 추가</Button>
            </div>

            <GridExample
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"multiRow"}
              // pageSize={10}  
              pagination={false}
            />
          </Col>

          <Col className="h-100 pt-2 d-flex flex-column" xs={12} md={10}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">작업지시 목록</span>
              <Button size="sm" variant="danger" onClick={delData}>선택 삭제</Button>
            </div>

            <GridExample
              columnDefs={columnDefs2}
              rowData={rowData2}
              onGridReady={onGridReady2} 
              loading={loading2}
              rowNum={true}
              rowSel={"multiRow"}
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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


  const pageRef = useRef(1);
  const totalPageRef = useRef(1);
  const scrollTopRef = useRef(0);
  const lastRowIndexRef = useRef(0);

  const gridRef = useRef();  
  const selectedRow = useRef(0);
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  const fetchData = useCallback(async () => {
    console.log("fetchData");
    console.log("page" , pageRef.current);
    console.log("totalPageRef" , totalPageRef.current);

    if (loading || pageRef.current >= totalPageRef.current) return;

    setLoading(true);

    pageRef.current += 1;
    props.current.intNowPage = pageRef.current;

    try {
      axiosInstance
        .post(`/api/getOsmOrderCustItemOrderList`, JSON.stringify(props.current))
        .then((res) => {


          setRowData(prev => [...prev, ...res.data]); // 기존 + 새 데이터 추가


        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
        })

    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  
  // 스크롤 바닥 감지
  const onBodyScroll = useCallback(() => {
    const gridBody = document.querySelector('.ag-body-viewport');
    if (!gridBody) return;

    const scrollTop = gridBody.scrollTop;
    const scrollHeight = gridBody.scrollHeight;
    const clientHeight = gridBody.clientHeight;

    scrollTopRef.current = scrollTop;

    console.log("scrollTop", scrollTop);
    console.log("scrollHeight", scrollHeight);
    console.log("clientHeight", clientHeight);
    // 바닥 감지 (여유값 10px)
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      console.log('바닥에 도달!');

      lastRowIndexRef.current = gridRef.current.getDisplayedRowCount() - 1;

      // 여기서 fetchData() 또는 setPage() 호출 가능
      fetchData();
    }
  }, []);




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
        modalFormChange({target:{name:"sel_row", value:selectedRows}});
      };
      
    });
    
    // 스크롤 종료 확인
    params.api.addEventListener("bodyScrollEnd", (ev) => {
      console.log("bodyScrollEnd");
      console.log(ev);

      if(ev.direction === "vertical"){
        onBodyScroll();
      }
    });

    // 모델 업데이트
    params.api.addEventListener("modelUpdated", (ev) => {
      console.log("modelUpdated");
      console.log(ev);

      console.log(pageRef.current);
      console.log(totalPageRef.current);
      if (pageRef.current > 1 && pageRef.current <= totalPageRef.current){
        gridRef.current.ensureIndexVisible( lastRowIndexRef.current , "bottom");
      }
    });


  };




  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      category: '',
      code: ['cd010', 'cd016','cd013']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      // 그리드 설정
      setColumnDefs([
        { headerName: "운영주문번호", field: "orderCode", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "수집일", field: "checkDate", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "주문일", field: "orderDate", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "출고일", field: "transDate", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
        { headerName: "배송일", field: "shipedDate", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "매입처사업자번호", field: "mediaBussNo", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "주문자", field: "orderName", sortable: false, editable: false, align:"left"},
        { headerName: "수추인", field: "shipName", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "수추인전화1", field: "shipTel", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "수추인전화2", field: "shipMobile", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "우편번호", field: "shipZipcode", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "주소", field: "shipAddress1", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "주소상세", field: "shipAddress2", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "주문메모", field: "orderMemo", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "출고택배", field: "carDriverName", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "송장번호", field: "inviuceNo", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "운영주문순번", field: "orderIdx", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "주문순번상세", field: "orderIdxSeq", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "취소여부", field: "cancelYn", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "운영창고코드", field: "storageCode", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "운영창고명", field: "storageName", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "운영상품코드", field: "itemCode", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "주문상품명1", field: "orderItemName01", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "주문상품명2", field: "orderItemName02", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "주문상품명3", field: "orderItemName03", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "주문수량", field: "orderQty", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "취소수량", field: "cancleQty", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "주문상태", field: "orderStatus", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "구성품운영상품코드", field: "itemCodeBom", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "구성품품번", field: "itemDotno", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "구성품상품명", field: "itemName", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "구성품주문수량", field: "bomQty", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "매출처주문번호1", field: "mediaOrderNo01", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "매출처주문번호2", field: "mediaOrderNo02", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "매출처주문번호3", field: "mediaOrderNo03", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "연동주문번호", field: "mediaOrderNo04", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
      ]);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);



  // 조회
  const getData = (params) => {
    console.log("getData");



    setRowData([]);
    setLoading(true);
    pageRef.current = modalForm.intNowPage;
    
    axiosInstance
    .post(`/api/getOsmOrderCustItemOrderList`, JSON.stringify(modalForm))
    .then((res) => {
      if(res.data.length > 0){
        totalPageRef.current = res.data[0].inttotalpage;
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
                  <th className="bg-light text-end align-middle">주문일자</th>
                  <td className="">
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control 
                        type="date"
                        name="stdate"
                        value={modalForm.stdate}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                      />
                      <span className="fw-bold"> ~ </span>
                      <Form.Control 
                        type="date"
                        name="endate"
                        value={modalForm.endate}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="NAME"
                      />
                    </div>
                  </td>
                  <th className="bg-light text-end align-middle">매출처 주문번호</th>
                  <td className="">
                      <Form.Control 
                        type="text"
                        name="mediaOrderNo01"
                        value={modalForm.mediaOrderNo01}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                      />
                  </td>
                  <th className="bg-light text-end align-middle">운영주문번호</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="orderCode"
                        value={modalForm.orderCode}
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
            <div className="mb-1 pt-2 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">주문 목록</span>
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={false}
              // pinnedBottomRowData={pinnedBottomRowData}  
            />
          </Col>
        </Row>

      </div>

      
    

    </div>
  );
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




const ModalStockItemComponent = ({ props={} }) => {

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


  const pageRef = useRef(1);
  const totalPageRef = useRef(1);
  const scrollTopRef = useRef(0);
  const lastRowIndexRef = useRef(0);

  const gridRef = useRef();  
  const selectedRow = useRef(0);
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  const fetchData = useCallback(async () => {
    console.log("fetchData");
    console.log("page" , pageRef.current);
    console.log("totalPageRef" , totalPageRef.current);

    if (loading || pageRef.current >= totalPageRef.current) return;

    setLoading(true);

    pageRef.current += 1;
    props.current.intNowPage = pageRef.current;

    try {
      axiosInstance
        .post(`/api/getOsmStockItemStorageList`, JSON.stringify(props.current))
        .then((res) => {


          setRowData(prev => [...prev, ...res.data]); // 기존 + 새 데이터 추가


        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
        })

    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  
  // 스크롤 바닥 감지
  const onBodyScroll = useCallback(() => {
    const gridBody = document.querySelector('.ag-body-viewport');
    if (!gridBody) return;

    const scrollTop = gridBody.scrollTop;
    const scrollHeight = gridBody.scrollHeight;
    const clientHeight = gridBody.clientHeight;

    scrollTopRef.current = scrollTop;

    console.log("scrollTop", scrollTop);
    console.log("scrollHeight", scrollHeight);
    console.log("clientHeight", clientHeight);
    // 바닥 감지 (여유값 10px)
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      console.log('바닥에 도달!');

      lastRowIndexRef.current = gridRef.current.getDisplayedRowCount() - 1;

      // 여기서 fetchData() 또는 setPage() 호출 가능
      fetchData();
    }
  }, []);


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
        modalFormChange({target:{name:"sel_row", value:selectedRows}});
      };

    });

    // 스크롤 종료 확인
    params.api.addEventListener("bodyScrollEnd", (ev) => {
      console.log("bodyScrollEnd");
      console.log(ev);

      if(ev.direction === "vertical"){
        onBodyScroll();
      }
    });

    // 모델 업데이트
    params.api.addEventListener("modelUpdated", (ev) => {
      console.log("modelUpdated");
      console.log(ev);

      console.log(pageRef.current);
      console.log(totalPageRef.current);
      if (pageRef.current > 1 && pageRef.current <= totalPageRef.current){
        gridRef.current.ensureIndexVisible( lastRowIndexRef.current , "bottom");
      }
    });

  };



  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      category: '',
      code: ['cd010', 'cd016','cd013']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      // 그리드 설정
      setColumnDefs([
        { headerName: "운영창고번호", field: "storageCode", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "운영창고명", field: "storageName", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "운영상품코드", field: "itemCode", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "품번", field: "itemDotno", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
        { headerName: "상품명", field: "itemName", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center", width:300 },
        { headerName: "과세여부", field: "taxTypeName", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "입수", field: "itemCount", sortable: false, editable: false, align:"left"},
        { headerName: "매입공급가", field: "buyprice", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "매입부과세", field: "taxBuyprice", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "매입가", field: "vTaxBuyprice", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "팩킹유형코드", field: "itemPlus", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "팩킹유형", field: "itemPlusName", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "재고", field: "endQty", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "할당수량", field: "shipQty", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "할당가능재고", field: "endShipQty", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "상품상태코드", field: "itemStatus", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "상품상태", field: "itemStatusName", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        
      ]);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);



  // 조회
  const getData = (params) => {
    console.log("getData");

    setRowData([]);
    setLoading(true);
    pageRef.current = modalForm.intNowPage;
    
    axiosInstance
      .post(`/api/getOsmStockItemStorageList`, JSON.stringify(modalForm))
      .then((res) => {
        if(res.data.length > 0){
          totalPageRef.current = res.data[0].inttotalpage;
        }

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
                  
                  <th className="bg-light text-end align-middle">운영상품코드</th>
                  <td className="">
                      <Form.Control 
                        type="text"
                        name="itemCode"
                        value={modalForm.itemCode}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                      />
                  </td>
                  <th className="bg-light text-end align-middle">품번</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="itemDotno"
                        value={modalForm.itemDotno}
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
            <div className="mb-1 pt-2 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">자재 목록</span>
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={false}
              // pinnedBottomRowData={pinnedBottomRowData}  
            />
          </Col>
        </Row>

      </div>

      
    

    </div>
  );
}

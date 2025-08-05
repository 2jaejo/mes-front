import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { MainContentStyle } from "css/CommonStyle";

import SearchItemComponent from "components/SearchItemComponent";
import SearchClientComponent from "components/SearchClientComponent";
import SearchUserComponent from "components/SearchUserComponent";


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
  const categoryAFormatter = (params) => {
    const arr_client_type = selectBox.current.category?.item_group_a || [];
    const item = arr_client_type.find(el => el.category_id === params.value);
    return item ? item.category_nm : params.value; 
  };

  // grid cell code_name 변환
  const categoryBFormatter = (params) => {
    
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
      
      selectedRow.current = ev.rowIndex; 

      const node = ev.node;
      if (!node.isSelected()) {
        node.setSelected(true);
      }
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
      setData(ev.data);

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

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
      setData2(ev.data);

      // const key = ev.colDef.field;
      // if(['received_qty'].includes(key)){
      //   const sum = rowPin(ev);
      //   const pin_row = ev.api.getGridOption('pinnedBottomRowData');
      //   pin_row[0][key] = sum;
      //   ev.api.setGridOption('pinnedBottomRowData', pin_row);
      // }
    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      
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
        { headerName: "수주번호", field: "order_id", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left", width:200},
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
        // { headerName: "수주상태", field: "status", sortable: true, editable: (params) => !params.node.rowPinned, filter: "agTextColumnFilter",  align:"center",
        //   cellEditor: "agSelectCellEditor",
        //   cellEditorParams: {
        //     values: selectBox.current.common?.['cd012']?.map((item) => item.code) ?? [],
        //   },
        //   valueFormatter: (params) => commonTypeFormatter(params, 'cd012'),
        // },
        // { headerName: "담당자", field: "request_id", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "수정일", field: "created_at", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "등록자", field: "created_by", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "수정일", field: "updated_at", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "수정자", field: "updated_by", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "비고", field: "comment", sortable: false, editable: (params) => !params.node.rowPinned, align:"left", width:300},
      ]);
      
      // 그리드 설정2
      setColumnDefs2([
        { headerName: "수주번호", field: "order_id", sortable: false, editable: false, align:"left", width:200},
        // { headerName: "진행상태", field: "status", sortable: false, editable: true, align:"center",
        //   cellEditor: "agSelectCellEditor",
        //   cellEditorParams: {
        //     values: selectBox.current.common?.['cd013']?.map((item) => item.code) ?? [],
        //   },
        //   valueFormatter: (params) => commonTypeFormatter(params, 'cd013'),
        // },
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
        // { headerName: "출고수량", field: "delivery_qty", sortable: false, 
        //   align:"right", 
        //   editable: (params) => !params.node.rowPinned, 
        //   cellRendererSelector: (params) => {
        //     if (params.node.rowPinned) {
        //       return {
        //         component: ()=>{
        //           return (
        //             <span>{ moneyFormatter({ value: rowPin(params) }) }</span>
        //           );
        //         },
                
        //       };
        //     }
        //     return undefined;
        //   },
        //   valueFormatter: (params) => moneyFormatter(params)
        // }, 
        { headerName: "납기일", field: "due_date", sortable: true, editable: (params) => !params.node.rowPinned, filter: "agDateColumnFilter",  align:"center", cellDataType:'dateString'},
        { headerName: "비고", field: "comment", sortable: false, editable: (params) => !params.node.rowPinned, align:"left", width:300}, 
      ]);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
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
    setRowData2([]);
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
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
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
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
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
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          });   


      }, 
    });

  };


  // 삭제
  const delData = (params) => {
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
        
        axiosInstance
          .post(`/api/delSalesOrder`, JSON.stringify(selectRows))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.close();
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
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
                        maxLength={50}
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
                        maxLength={50}
                      />
                    </div>
                  </td>
                  {/* <th className="bg-light text-end align-middle">수주상태</th>
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
                  </td> */}
                  
                {/* </tr>
              </tbody>
            </Table>
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr> */}
                  <th className="bg-light text-end align-middle">수주번호</th>
                  <td className="">
                      <Form.Control 
                        type="text"
                        name="purchase_id"
                        value={form.purchase_id}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        maxLength={50}
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
                        placeholder="거래처코드"
                        maxLength={50}
                      />
                      <Form.Control 
                        type="text"
                        name="client_name"
                        value={form.client_name}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="거래처명"
                        maxLength={50}
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
              // pageSize={10}
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
      
    });

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      

      const col = ev.colDef.field;
      if(col === "quantity" || col === "unit_price"){
        const supply = parseInt(ev.data.quantity) * parseInt(ev.data.unit_price);
        const tax = parseInt(supply * 0.1);
        const total = parseInt(supply + tax);

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
        { headerName: "품목코드", field: "item_code", sortable: false, editable: false, align:"center"},
        { headerName: "품목명", field: "item_name", sortable: false, editable: false, align:"left"},
        { headerName: "기준단위", field: "base_unit", sortable: false, editable: false, align:"center"},
        { headerName: "구매단위", field: "purchase_unit", sortable: false, editable: false, align:"center"},
        { headerName: "납기일", field: "due_date", sortable: false, editable: true, align:"center", cellDataType:'dateString',},
        { headerName: "수주수량", field: "quantity", sortable: false, editable: true, align:"right", cellDataType: 'number',
          valueFormatter: (params) => moneyFormatter(params)
        },
        { headerName: "단가", field: "unit_price", sortable: false, editable: true, align:"right", cellDataType: 'number',
          valueFormatter: (params) => moneyFormatter(params)
        },
        { headerName: "공급가", field: "supply_price", sortable: false, editable: false, align:"right", cellDataType: 'number',
          valueFormatter: (params) => moneyFormatter(params)
        },
        { headerName: "부가세", field: "tax", sortable: false, editable: true, align:"right", cellDataType: 'number',
          valueFormatter: (params) => moneyFormatter(params)
        },
        { headerName: "합계", field: "total_price", sortable: false, editable: false, align:"right", cellDataType: 'number',
          valueFormatter: (params) => moneyFormatter(params)
        },
      ]);

      // getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    });  

  },[]);
  

  // 그리드 데이터 변경 감지
  useEffect(()=>{
    form.current['sel_row'] = rowData;
  }, [rowData])



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


  // 모달 입력필드
  const formRef = useRef();
  const formRef2 = useRef();
  const formRef3 = useRef();


  // 조회
  const getData = (params) => {

    formRef.current = {
      user_id:'',
      user_nm:''
    };

    modalRef.current.open({
      title: "사용자 조회",
      content: <SearchUserComponent form={formRef} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        const row = formRef.current.sel_row;
        
        if(!row){
          modalRef2.current.open({ title:"알림", message:"사용자를 선택하세요.", cancelText:"" });
          return;
        }

        modalFormChange({target:{name:'user_id', value:row.user_id}});
        modalFormChange({target:{name:'user_nm', value:row.user_nm}});

        modalRef.current.close();
      }, 
    });
    
  };


  // 조회2
  const getData2 = (params) => {

    formRef2.current = {
      client_code:'',
      client_name:'',
      client_type:'',
      use_yn:'',
    };

    modalRef.current.open({
      title: "거래처 조회",
      content: <SearchClientComponent form={formRef2} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        const row = formRef2.current.sel_row;
        
        if(!row){
          modalRef2.current.open({ title:"알림", message:"거래처를 선택하세요.", cancelText:"" });
          return;
        }

        modalFormChange({target:{name:'client_code', value:row.client_code}});
        modalFormChange({target:{name:'client_name', value:row.client_name}});
        
        setRowData([]);

        modalRef.current.close();

      }, 
    });
    
  };


  // 조회3
  const getData3 = (params) => {

    formRef3.current = {
      item_type:'',
      item_code:'',
      item_name:'',
      client_code:'',
      client_name:'',
      item_group_a: '',
      item_group_b: '',
      use_yn:'',
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
        row.unit_price = parseInt(row.standard_price);

        if(!row){
          modalRef2.current.open({ title:"알림", message:"품목을 선택하세요.", cancelText:"" });
          return;
        }

        const chk = rowData.some(el => el.item_code === row.item_code);
        if(chk) {
          modalRef2.current.open({ title:"알림", message:"이미 추가된 품목입니다.", cancelText:"" });
          return;
        } 

        setRowData([...rowData, row]);
        
        modalRef.current.close();
      }, 
    });
    
  };



  return (
    <div style={{ height: '50vh', width:'70vw', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="d-flex gap-2 overflow-auto">
            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  {/* <th className="bg-light text-end align-middle">담당자</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="user_id"
                        value={modalForm.user_id}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="ID"
                        maxLength={50}
                        disabled
                        /> 
                      <Form.Control 
                        type="text"
                        name="user_nm"
                        value={modalForm.user_nm}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="NAME"
                        maxLength={50}
                        disabled
                      />
                      <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-search"></i></Button>
                    </div>
                  </td> */}
                  <th className="bg-light text-end align-middle">거래처</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="client_code"
                        value={modalForm.client_code}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                        maxLength={50}
                        disabled
                      />
                      <Form.Control 
                        type="text"
                        name="client_name"
                        value={modalForm.client_name}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="NAME"
                        maxLength={50}
                        disabled
                      />
                      <Button size="sm" variant="primary" onClick={getData2}><i className="bi bi-search"></i></Button>
                    </div>
                  </td>
                  <th className="bg-light text-end align-middle">등록일</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="date"
                        name="request_date"
                        value={modalForm.request_date}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        maxLength={50}
                      /> 
                    </div>
                  </td>
                </tr>
                <tr>
                  
                  
                </tr>
                <tr>
                  <th className="bg-light text-end align-middle">비고</th>
                  <td className="" colSpan={5}>
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="comment"
                        value={modalForm.comment}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-100"
                        maxLength={200}
                      /> 
                    </div>
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
              <span className="fw-bold my-2">상세 목록</span>
              <Button size="sm" variant="primary" onClick={getData3}>품목조회</Button>
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


    </div>
  );
};



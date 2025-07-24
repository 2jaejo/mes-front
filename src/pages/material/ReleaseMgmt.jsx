import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { MainContentStyle } from "css/CommonStyle";

import SearchUserComponent from "components/SearchUserComponent";
import InventoryComponent from "../inventory/InventoryLookup";

const Main = () => {

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
    const num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 6});
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
        { headerName: "출고번호", field: "return_id", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center", width: 200},
        { headerName: "출고일자", field: "return_date", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "품목(수)", field: "item_count", sortable: true, editable: false, align:"right",
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
        // { headerName: "담당자", field: "manager", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "등록일", field: "created_at", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
        { headerName: "등록자", field: "created_by", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "수정일", field: "updated_at", sortable: true, editable: false, filter: "agDateColumnFilter",  align:"center"},
        { headerName: "수정자", field: "updated_by", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "비고", field: "comment", sortable: false, editable: (params) => !params.node.rowPinned, align:"left",  width:300},
      ]);
      
      // 그리드 설정2
      setColumnDefs2([
        { headerName: "출고번호", field: "return_id", sortable: false, editable: false, align:"center", width: 200},
        { headerName: "진행상태", field: "status", sortable: false, editable: false, align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd013']?.map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => commonTypeFormatter(params, 'cd013'),
        },
        { headerName: "자재코드", field: "raw_code", sortable: false, editable: false, align:"center"},
        { headerName: "자재명", field: "raw_name", sortable: false, editable: false, align:"left", width:300}, 
        { headerName: "기준단위", field: "base_unit", sortable: false, editable: false, align:"center"},
        { headerName: "구매단위", field: "unit_size", sortable: false, editable: false, align:"center"}, 
        { headerName: "출고수량", field: "return_qty", sortable: false, 
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
    , return_id : ''
    , client_code : ''
    , client_name : ''
    , status : ''
    , type: 'release'
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
    .post(`/api/getReceiptReturn`, JSON.stringify(form))
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
    .post(`/api/getReceiptReturnDet`, JSON.stringify(params))
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
      .post("api/setReceiptReturn", JSON.stringify(params))
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
      .post("api/setReceiptReturnDet", JSON.stringify(params))
      .then((res) => {
        getData(selectedRow.current);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });   
    };
    

  // 수정3
  const setData3= (params) => {
    console.log("setData3");
    const sel_rows = gridRef2.current.getSelectedRows();
    if(sel_rows.length === 0){
      modalRef.current.open({ title:"알림", message:"출고 상세항목을 선택하세요.", cancelText:"" }); 
      return;
    }

    const exists = sel_rows.some(row => row.status === "complete");
    if( exists ){
      modalRef.current.open({ title:"알림", message:"이미 마감된 항목이 선택되었습니다.", cancelText:"" }); 
      return;
    }

    axiosInstance
      .post("api/setReceiptReturnClose", JSON.stringify(sel_rows))
      .then((res) => {
        getData2(gridRef.current.getSelectedRows()[0]);
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
      title: "출고 추가",
      content: <ModalComponent form={formRef}  />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        

      
        // if(!formRef.current.user_id){
        //   modalRef2.current.open({ title:"알림", message:"담당자를 선택하세요.", cancelText:"" });
        //   return;
        // }

        if(!formRef.current.request_date){
          modalRef2.current.open({ title:"알림", message:"출고일을 입력하세요.", cancelText:"" });
          return;
        }

        if(formRef.current.sel_row.length === 0){
          modalRef2.current.open({ title:"알림", message:"품목이 존재하지 않습니다.", cancelText:"" });
          return;
        }

        const key = "release_qty";
        const arr = formRef.current.sel_row;
        const chk = arr.some(item => !item.hasOwnProperty(key) || item[key] === '' || item[key] === null || item[key] === undefined || item[key] === NaN);
        if(chk){
          modalRef2.current.open({ title:"알림", message:"출고수량을 입력하세요.", cancelText:"" });
          return ;
        }
        
        const chk2 = arr.some( item => item.quantity < item.release_qty);
        if(chk2){
          modalRef2.current.open({ title:"알림", message:"재고수량보다 많이 출고 할 수 없습니다.", cancelText:"" });
          return ;

        }
   
        axiosInstance
          .post(`/api/addRelease`, JSON.stringify(formRef.current))
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

    const rows = gridRef.current.getSelectedRows();
    if (rows.length === 0) {
      modalRef2.current.open({ title:"알림", message:"선택하신 항목이 없습니다.", cancelText:"" });
    }
    
    modalRef.current.open({
      title: "출고 삭제",
      message: "삭제하시겠습니까?",
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"삭제",
      confirmClass:"btn btn-danger",
      onConfirm: (res) => {
       
        axiosInstance
          .post(`/api/delReceiptReturn`, JSON.stringify(rows))
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
                  <th className="bg-light text-end align-middle">출고 일자</th>
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
                  <th className="bg-light text-end align-middle">출고 번호</th>
                  <td className="">
                      <Form.Control 
                        type="text"
                        name="return_id"
                        value={form.return_id}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        maxLength={50}
                      />
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
              <span className="fw-bold">출고 목록</span>
              <Button size="sm" variant="success" onClick={addData}>추가</Button>
              {/* <Button size="sm" variant="danger" onClick={delData}>삭제</Button> */}
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pageSize={10}
              // pinnedBottomRowData={pinnedBottomRowData}  
            />
          </Col>
        </Row>

      </div>

      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">출고 상세</span>
              <Button size="sm" variant="danger" onClick={setData3}>마감</Button>
            </div>

            <GridExample 
              columnDefs={columnDefs2}
              rowData={rowData2}
              onGridReady={onGridReady2} 
              loading={loading2}
              rowNum={true}
              rowSel={"multiRow"}
              pagination={false}
              // pinnedBottomRowData={pinnedBottomRowData2}
            />
          </Col>
        </Row>

      </div>
    

    </div>
  );
}

export default Main;





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
        { headerName: "품번", field: "raw_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "품명", field: "raw_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", width:200 },
        { headerName: "단위", field: "base_unit", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "규격", field: "unit_size", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },       
        { headerName: "안전재고", field: "right_qty", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params)},
        { headerName: "재고수량", field: "quantity", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params)},
        // { headerName: "재고비율", field: "stock_ratio", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params, '%')},
        // { headerName: "부족수량", field: "chk_cnt", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params)},
        { headerName: "출고수량", field: "release_qty", sortable: false, editable: true, align:"right", cellDataType:'number'},
        { headerName: "비고", field: "comment", sortable: false, editable: false, align:"left", width:300},
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
  const moneyFormatter = (params) => {
    if (params.value == null) return '';
    const num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 6});
    return num;
  };


  // 모달 입력필드
  const formRef = useRef();
  const formRef2 = useRef();


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
      item_code:'',
      item_name:'',
      sel_rows:[]
    };

    modalRef.current.open({
      title: "재고 조회",
      content: <InventoryComponent props={formRef2} style_props={{height: '80vh', width:'80vw'}}/>,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        const sel_rows = formRef2.current.sel_rows;

        const exists = rowData.some(row => row.raw_code === sel_rows[0].raw_code);
        if (exists) {
          modalRef2.current.open({ title:"알림", message:"이미 추가된 품목입니다.", cancelText:"" });
          return;
        }

        if (sel_rows === undefined || sel_rows.length === 0){
          modalRef2.current.open({ title:"알림", message:"선택된 항목이 없습니다.", cancelText:"" });
          return;
        }
        
        const chk2 = sel_rows.some(el => el.quantity <= 0 );
        if( chk2 ){
          modalRef2.current.open({ title:"알림", message:"재고수량이 없습니다.", cancelText:"" });
          return;
        }

        setRowData(prevData => {
          const newData = [...prevData, ...sel_rows];
          const uniqueData = newData.filter(
            (row, index, self) =>
              index === self.findIndex(r => r.raw_code === row.raw_code)
          );
          return uniqueData;
        });

        // console.log("rowData", rowData);
        // modalRef.current.close();
      }, 
    });
    
  };




  return (
    <div style={{ height: '80vh', width:'80vw', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
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
                  <th className="bg-light text-end align-middle">출고일</th>
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
             
                  <th className="bg-light text-end align-middle">비고</th>
                  <td className="" colSpan={3}>
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="comment"
                        value={modalForm.comment}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-100"
                        style={{ minWidth: 800 }}
                        maxLength={200}
                      /> 
                    </div>
                  </td>
                </tr>
              </tbody>
            </Table>
            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                

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
              <Button size="sm" variant="primary" onClick={getData2}>재고조회</Button>
            </div>

            <GridExample
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={false}
              // pageSize={10}  
            />
          </Col>


        </Row>

      </div>


    </div>
  );
};

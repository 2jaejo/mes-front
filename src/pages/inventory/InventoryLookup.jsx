import React, { useState, useRef, useEffect, useMemo } from "react";

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';
import { MainContentStyle } from "css/CommonStyle";


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

  const [barcode, setBarcode] = useState('');

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && barcode.trim() !== '') {
      const params = {
        barcode: barcode,
      }

      setLoading(true);
      axiosInstance
        .post(`/api/getRaw`, JSON.stringify(params))
        .then((res) => {
          setRowData(res.data);
          
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
        })
        .finally(() =>{
          setLoading(false);
          setBarcode('');

        });
      
    }

  };

  const selectedRow = useRef(0);

  const formRef = useRef({
    raw_code : ''
    , raw_name : ''
  });
  // 검색창 입력필드
  const [form, setForm] = useState({
     raw_code : ''
    , raw_name : ''
  });

  // 검색창 입력필드 변경 저장
  const formChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if(formRef.current){
      formRef.current[name] = value;
    }
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

  const getRowClass = (params) => {
    const r_qty = params.data.right_qty;
    const ratio = params.data.stock_ratio;
    if(r_qty !== 0 && ratio < 30){
      return 'bg-red';
    }else if (r_qty !== 0 && ratio >= 30 && ratio < 60){
      return 'bg-orange';
    }else if (r_qty !== 0 && ratio >= 60 && ratio < 80){
      return 'bg-yellow';
    }else if (r_qty !== 0 && ratio >= 80 && ratio < 100){
      return 'bg-green';
    }

    return '';
  };

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
      
      
      const selectedRows = ev.api.getSelectedRows();
      // 모달사용시 선택 행 전달
      modalFormChange({target:{name:"sel_rows", value:selectedRows}});
      
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){

      };

    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
    });
  };

  // grid cell code_name 변환
  const moneyFormatter = (params, suffix = '') => {
    if (params.value == null) return '';
    let num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 6});
    if (suffix !== '') num += suffix;
    return num;
  };


  const propsRef = useRef({});

  // 셀 렌더러
  const ButtonRenderer = (props) => {

    const handleClick = (params) => {
      console.log("handleClick");
      console.log(props.colDef);
      console.log(props.data);
      console.log(params);

      propsRef.current = {
        raw_code: props.data.raw_code,
        quantity: "",
      }

      modalRef.current.open({
      title: "재고 조정",
      content: <ModalComponent props={propsRef} />,
      onCancel: ()=>{
        getData();
        modalRef.current.close();
      },
      cancelText:"",
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {

        getData();
        modalRef.current.close();
        
      },
    });
    };

    
  
  
  
    return (
      <div style={{ width:'100%', display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
        <Button size="sm" variant="primary" onClick={(e)=>handleClick()} >이력</Button>
      </div>
    ); 

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

      console.log(props.current);
      if(!props.current){
        setColumnDefs([
          // { headerName: "운영상품코드", field: "item_usr_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "바코드", field: "bar_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "품번", field: "raw_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:100 },
          { headerName: "품명", field: "raw_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:300 },
          { headerName: "단위", field: "base_unit", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "규격", field: "unit_size", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "매입가", field: "buyprice", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "분류", field: "type_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "상태", field: "status_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "매입처", field: "supply_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "재고조정", field: "stock_change", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center", cellRenderer: ButtonRenderer },
          { headerName: "재고수량", field: "quantity", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params)},
          { headerName: "안전재고", field: "right_qty", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params)},
          { headerName: "재고비율", field: "stock_ratio", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params, '%')},
          { headerName: "부족수량", field: "chk_cnt", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params)},
        ]);
        
      }
      else{
        setColumnDefs([
          { headerName: "바코드", field: "bar_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "품번", field: "raw_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:100 },
          { headerName: "품명", field: "raw_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:300 },
          { headerName: "단위", field: "base_unit", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "규격", field: "unit_size", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "매입가", field: "buyprice", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "분류", field: "type_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "상태", field: "status_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "매입처", field: "supply_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
          { headerName: "재고수량", field: "quantity", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params)},
          { headerName: "안전재고", field: "right_qty", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params)},
          { headerName: "재고비율", field: "stock_ratio", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params, '%')},
          { headerName: "부족수량", field: "chk_cnt", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params)},
        ]);

      }

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    });  

  },[]);
  

  // 그리드 데이터 변경 감지
  useEffect(()=>{

  }, [rowData])

  



  // 조회
  const getData = (params) => {
    console.log("getData");

    setRowData([]);
    setLoading(true);
    
    axiosInstance
    .post(`/api/getInventory`, JSON.stringify(formRef.current))
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
      // let sel = selectedRow.current;
      // if(typeof params === "number") sel = params;
      // gridRef.current.forEachNode((node) => {
      //   if (node.rowIndex === sel) {
      //     node.setSelected(true);
      //   }
      // });
    });
    
  };




  return (
    <div style={{...MainContentStyle, ...style_props}}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="bg-light">
        <Row className="">
          <Col className="">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">자재</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="raw_code"
                        value={form.raw_code}
                        onChange={formChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="품번"
                        maxLength={50}
                      />
                      <Form.Control 
                        type="text"
                        name="raw_name"
                        value={form.raw_name}
                        onChange={formChange}
                        onKeyUp={(e)=>{if(e.code === 'Enter') getData()}}
                        size="sm" 
                        className="w-auto"
                        placeholder="품명"
                        maxLength={50}
                      />
                    </div>
                  </td>
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-search"></i></Button>
                  </td>

                  <th className="bg-light text-end align-middle">바코드</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="barcode"
                        value={form.barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyUp={handleKeyPress}
                        size="sm" 
                        className="w-auto"
                        placeholder="바코드를 스캔하세요"
                        maxLength={50}
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
          <Col className="h-100 pe-0 d-flex flex-column" xs={12} md={12}>
            <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold">자재 목록</span>
              
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              // rowNum={true}
              rowSel={"multiRow"}
              pagination={true}
              // pageSize={10}
              // pinnedBottomRowData={pinnedBottomRowData}  
              rowClass={getRowClass}
            />
          </Col>

        </Row>
      </div>

    </div>
  );
};


export default Main;


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const ModalComponent = ({ props={} }) => {
  console.log("ModalComponent");

  // form
  const [modalForm, setModalForm] = useState(props.current);
  const modalFormChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
    props.current[name] = value;
  };

  // 모달 ref
  const modalRef = useRef();  
  const modalRef2 = useRef();  
  
  // selectbox
  const selectBox = useRef({}); 

  // btnLoading
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnLoading2, setBtnLoading2] = useState(false);
  
  // grid
  const gridRef = useRef();  
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      
      const selectedRows = ev.api.getSelectedRows();
      if(selectedRows.length > 0){
        props.current['sel_row'] = selectedRows[0];    
      }
    });
  };

  // grid cell code_name 변환
  const moneyFormatter = (params, suffix = '') => {
    if (params.value == null) return '';
    let num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 6});
    if (suffix !== '') num += suffix;
    return num;
  };


  // 초기화
  useEffect(()=>{ 
    let isMounted = true;

    const init = {
      code: []
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      if (isMounted) {
        selectBox.current = res.data;

        setColumnDefs([
          { headerName: "재고조정량", field: "changed_quantity", sortable: true, editable: false, filter: "agTextColumnFilter", align:"right", valueFormatter: (params) => moneyFormatter(params) },
          { headerName: "등록자", field: "created_by", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left" },
          { headerName: "등록일시", field: "created_at", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left"},
        ]);

        getData();
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    });  

    return () => {
      isMounted = false; 
    };
  },[]);



  // 조회
  const getData = (params) => {
    setLoading(true);
    axiosInstance
      .post(`/api/getInventoryDet`, JSON.stringify(modalForm))
      .then((res) => {
        setRowData(res.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      })
      .finally(() =>{
        setLoading(false);
      });
  };

  // 추가
  const addData = (params) => {

    if(!modalForm.quantity || isNaN(Number(modalForm.quantity))) {
      modalRef.current.open({ title:"알림", message:"수량을 입력하세요.", cancelText:"", autoCloseDelay:2000 });
      return;
    }

    setBtnLoading(true);
    
    axiosInstance
      .post(`/api/setInventoryDet`, JSON.stringify(modalForm))
      .then((res) => {
        modalFormChange({target:{name:"quantity", value:""}});
        getData();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      })
      .finally(() =>{
        setBtnLoading(false);
      });
  };


  const delData = (params) =>{
    console.log("delData");

    const rows = gridRef.current.getSelectedRows();
    if(rows.length === 0) {
      modalRef.current.open({ title:"알림", message:"선택된 항목이 없습니다.", cancelText:"" , autoCloseDelay:2000});
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
        
        setBtnLoading2(true);
        modalRef.current.update({ isLoading: true });
        axiosInstance
          .post(`/api/delInventoryDet`, JSON.stringify(rows[0]))
          .then((res) => {
            getData();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          })
          .finally(() =>{
            modalRef.current.update({ isLoading: false });
            modalRef.current.close();
            setBtnLoading2(false);

          });
      },
    });
  };


  return (
    <div style={{ height: '30vh', width:'24vw', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="d-flex gap-2">
            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">변경수량</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="number"
                        name="quantity"
                        value={modalForm.quantity}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        maxLength={50}
                      />
                    </div>
                  </td>
          
                  <td className="">
                    <Button size="sm" variant="success" onClick={addData} disabled={btnLoading}>
                      {btnLoading ? (
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : null}
                      적용
                    </Button>
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
              <span className="fw-bold my-2">조정 목록</span>
              <Button size="sm" variant="danger" onClick={delData} disabled={btnLoading2}>
                {btnLoading2 ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : null}
                선택삭제
              </Button>
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
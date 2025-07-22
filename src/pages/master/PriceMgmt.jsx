import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";


const Main = () => {
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  
  const gridRef = useRef();  
  const gridRef2 = useRef();
  const gridRef3 = useRef();
  

  // selectbox
  const selectBox = useRef({}); 

  // 초기화 selectbox list
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      category: '',
      code: ['cd001', 'cd006']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
        selectBox.current = res.data;
        getData();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });  
  },[]);

  // 그리드 행 선택값
  const [selectedRow, setSelectedRow] = useState(0); 

  const typeFormatter = (params, cd) => {
    const arr_client_type = selectBox.current.common?.[cd] || [];
    const item = arr_client_type.find(el => el.code === params.value);

    // 못 찾으면 원래 코드 출력
    return item ? item.code_name : params.value; 
  };
    
  // 거래처정보 그리드 설정
  const [rowData, setRowData] = useState([]);
  const [columnDefs] = useState([
    { headerName: "거래처코드", field: "client_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "거래처", field: "client_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left"},
    { headerName: "거래처유형", field: "client_type", sortable: true, editable: false, align:"center", valueFormatter:(params)=> typeFormatter(params,'cd001'),},
    { headerName: "사업자등록번호", field: "business_no", sortable: false, editable: false, align:"right"},
    
  ]);

  // 품목정보 그리드 설정
  const [rowData2, setRowData2] = useState([]);
  const [columnDefs2] = useState([
    { headerName: "품목코드", field: "item_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "품목명", field: "item_name", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
    { headerName: "구간시작", field: "quantity_min", sortable: true, editable: true, align:"right",
      valueFormatter: (params) => {
        if (params.value == null) return '';
        return Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
      },
    },
    { headerName: "구간종료", field: "quantity_max", sortable: true, editable: true, align:"right",
      valueFormatter: (params) => {
        if (params.value == null) return '';
        return Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
      },
    },
    { headerName: '단가', field: "price", sortable: true, editable: true, align:"right",
      valueFormatter: (params) => {
        if (params.value == null) return '';
        const num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
        return num + ' 원';
      },
    },
    { headerName: "할인율", field: "discount_rate", sortable: true, editable: true, align:"right",
      valueFormatter: (params) => {
        if (params.value == null) return '';
        const num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
        return num + ' %';
      },
    },
    { headerName: "적용시작일", field: "start_date", sortable: true, editable: true, align:"center"},
    { headerName: "적용종료일", field: "end_date", sortable: true, editable: true, align:"center"},
   
    { headerName: "비고", field: "comment", sortable: false, editable: true, align:"left"},
  ]);

  // 변경이력 그리드 설정
  const [rowData3, setRowData3] = useState();
  const [columnDefs3] = useState([
    { headerName: "품목코드", field: "item_code", sortable: false, editable: false, align:"center" },
    { headerName: "품목명", field: "item_name", sortable: false, editable: false, align:"left"},
    { headerName: "구간시작", field: "quantity_min", sortable: true, editable: false, align:"right",
      valueFormatter: (params) => {
        if (params.value == null) return '';
        return Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
      },
    },
    { headerName: "구간종료", field: "quantity_max", sortable: true, editable: false, align:"right",
      valueFormatter: (params) => {
        if (params.value == null) return '';
        return Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
      },
    },
    { headerName: "판매단가", field: "price", sortable: true, editable: false, align:"right",
      valueFormatter: (params) => {
        if (params.value == null) return '';
        const num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
        return num + ' 원';
      },
    },
    { headerName: "할인율", field: "discount_rate", sortable: true, editable: false, align:"right",
      valueFormatter: (params) => {
        if (params.value == null) return '';
        const num = Number(params.value).toLocaleString('ko-KR', {maximumFractionDigits: 0});
        return num + ' %';
      },
    },
    { headerName: "적용시작일", field: "start_date", sortable: true, editable: false, align:"center"},
    { headerName: "적용종료일", field: "end_date", sortable: true, editable: false, align:"center"},
   
    { headerName: "비고", field: "comment", sortable: false, editable: false, align:"left"},
    { headerName: "변경일시", field: "updated_at", sortable: true, editable: false, align:"left"},
  ]);


  

  


  // 검색창 입력필드
  const [form, setForm] = useState({
    client_code: '',
    client_name: '',
    client_type: '',
    use_yn: 'Y',
  });

  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // 품목정보 추가 모달
  const DEFAULT_FORM2 = (init={}) => ({
    item_type:'',
    item_group_a:'',
    item_group_b:'',
    use_yn: '',
    item_code:'',
    item_name:'',
    client_code:'',
    client_name:'',
    ...init
  });

  const formRef2 = useRef();
  const formRef3 = useRef();

  const formRefChange2 = (name, value) => {
    formRef2.current[name] = value;
  };

  const formRefChange3 = (params) => {
    formRef3.current = params;
  };

  const ModalForm2 = ({ form={}, onChangeHandler, onSelectRow }) => {
    console.log("ModalForm2");

    const [modalForm, setModalForm] = useState(form);

    const modalFormChange = (e) => {
      const { name, value } = e.target;
      setModalForm(prev => ({ ...prev, [name]: value }));
      onChangeHandler(name, value);
    };

    // 모달 품목 조회
    const getData4 = (params) => {
      console.log("getData4");

      setLoading4(true);

      axiosInstance
        .post(`/api/getItem`, JSON.stringify(formRef2.current))
        .then((res) => {
          setRowData4(res.data);
        
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
        })
        .finally(() =>{
          setLoading4(false);
        });
    };

    const gridRef4 = useRef();
    const [loading4, setLoading4] = useState(false);
    const [rowData4, setRowData4] = useState();
    const [columnDefs4] = useState([
      { headerName: "품목코드", field: "item_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
      { headerName: "품목명", field: "item_name", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
      { headerName: "품목유형", field: "item_type", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
      { headerName: "품목대분류", field: "item_group_a", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
      { headerName: "품목소분류", field: "item_group_b", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
      { headerName: "기준단위", field: "base_unit", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center"},
      { headerName: "거래처", field: "client_list", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
      { headerName: "비고", field: "comment", sortable: true, editable: false, align:"left"},
    ]);

    // 변경이력 그리드 onGridReady
    const onGridReady4 = (params) => {
      gridRef4.current = params.api; // Grid API 저장

      // 행 클릭 이벤트
      params.api.addEventListener("rowClicked", (ev) => {
        console.log("rowClicked");
        
        const selectedRows = ev.api.getSelectedRows();
        onSelectRow(selectedRows[0]);
      });

      // 셀 값 변경 이벤트
      params.api.addEventListener("cellValueChanged", (ev) => {
        console.log("cellValueChanged");
        
      });

      
      // 선택 변경 이벤트
      params.api.addEventListener("selectionChanged", (ev) => {
        console.log("selectionChanged");
        
      });

    };


    useEffect(() => {
      // 폼 초기화
      getData4();
    },[]);

    return (
      <div style={{ height: '50vh', display: 'flex', flexDirection: 'column' }}>
        <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
          <tbody>
            <tr>
              <th className="bg-light text-end align-middle">품목유형</th>
              <td>
                <Form.Select 
                  name="item_type" 
                  value={modalForm.item_type} 
                  onChange={modalFormChange}
                  size="sm"
                  className="w-100"
                >
                  <option value="">전체</option>
                  {(selectBox.current.common?.['cd006'] || [])
                    .filter(opt => opt.use_yn === 'Y')
                    .map(opt => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code_name}
                      </option>
                  ))}
                </Form.Select>
              </td>
              <th className="bg-light text-end align-middle">품목분류</th>
              <td>
                <div className="d-flex gap-2">
                  <Form.Select 
                    name="item_group_a" 
                    value={modalForm.item_group_a} 
                    onChange={modalFormChange}
                    size="sm"
                    className="w-100"
                  >
                    <option value="">전체</option>
                    {(selectBox.current.category?.item_group_a || [])
                      .filter(opt => opt.use_yn === 'Y')
                      .map(opt => (
                        <option key={opt.category_id} value={opt.category_id}>
                          {opt.category_nm}
                        </option>
                    ))}
                  </Form.Select>
                  <Form.Select 
                    name="item_group_b" 
                    value={modalForm.item_group_b} 
                    onChange={modalFormChange}
                    size="sm"
                    className="w-100"
                  >
                    <option value="">전체</option>
                    {(selectBox.current.category?.['item_group_b'][formRef2.current.item_group_a] || [])
                      .filter(opt => opt.use_yn === 'Y')
                      .map(opt => (
                        <option key={opt.category_id} value={opt.category_id}>
                          {opt.category_nm}
                        </option>
                    ))} 
                  </Form.Select>
                </div>
              </td>
              <th className="bg-light text-end align-middle">품목</th>
              <td className="">
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text"
                    name="item_code"
                    value={modalForm.item_code}
                    onChange={handleChange}
                    size="sm" 
                    className="w-auto"
                    placeholder="CODE"
                    maxLength={50}
                  />
                  <Form.Control 
                    type="text"
                    name="item_name"
                    value={modalForm.item_name}
                    onChange={handleChange}
                    size="sm" 
                    className="w-auto"
                    placeholder="NAME"
                    maxLength={50}
                  />
                </div>
              </td>                    
              <td className="">
                <Button size="sm" variant="primary" onClick={getData4}><i className="bi bi-search"></i></Button>
              </td>
            </tr>
           
          </tbody>
        </Table>

        <div className="h-100 d-flex flex-column gap-0">
          <div className="d-flex gap-2 justify-content-start align-items-center">
            <span className="fw-bold my-2">품목 목록</span>
          </div>

          <GridExample
            columnDefs={columnDefs4}
            rowData={rowData4}
            onGridReady={onGridReady4} 
            loading={loading4}
            rowNum={true}
            rowSel={"singleRow"}
            pageSize={10}  
          />
        </div>  

      </div>
    );
  };



  // 거래처정보 조회
  const getData = (params) => {
    console.log("getData");

    
    setRowData2([]);
    
    setLoading(true);
    
    axiosInstance
    .post(`/api/getClient`, JSON.stringify(form))
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

  

  // 품목정보 조회
  const getData2 = (params) => {
    console.log("getData2");

    setLoading2(true);

    axiosInstance
      .post(`/api/getPrice`, JSON.stringify(params))
      .then((res) => {
        setRowData2(res.data);
       
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      })
      .finally(() =>{
        setLoading2(false);
      });
  };


  // 품목정보 수정
  const setData2 = (params) => {
    console.log("setData2");

    axiosInstance
      .post("api/setPrice", JSON.stringify(params))
      .then((res) => {
       
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });   
  };


  // 품목정보 추가
  const addData2 = (params) => {
    console.log("addData2");

    const sel_rows = gridRef.current.getSelectedRows();
    if(sel_rows.length === 0) {
      modalRef.current.open({ title:"알림", message:"거래처를 선택하세요.", cancelText:"" });
      return;
    }

    formRef2.current = DEFAULT_FORM2();


    modalRef.current.open({
      title: "단가 추가",
      message: "추가하시겠습니까?",
      content: <ModalForm2 form={formRef2.current} onChangeHandler={formRefChange2} onSelectRow={formRefChange3} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        
        if(!formRef3.current){
          modalRef2.current.open({ title:"알림", message:"품목을 선택하세요.", cancelText:"" });
          return;
        }

        formRef3.current['client_code'] = sel_rows[0].client_code;

        axiosInstance
          .post(`/api/addPrice`, JSON.stringify(formRef3.current))
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


  // 품목정보 삭제
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
        
        axiosInstance
          .post(`/api/delPrice`, JSON.stringify(selectRows))
          .then((res) => {
            const selRows = gridRef.current.getSelectedRows();
            getData2(selRows[0]);
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


  
   // 변경이력 조회
   const getData3 = (params) => {
    console.log("getData3");

    setLoading3(true);

    axiosInstance
      .post(`/api/getPriceHistory`, JSON.stringify(params))
      .then((res) => {
        setRowData3(res.data);
       
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      })
      .finally(() =>{
        setLoading3(false);
      });
  };


  


  // 거래처정보 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    getData();

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      

      const selectedRows = ev.api.getSelectedRows();
      if(selectedRows.length > 0){
        setSelectedRow(ev.node.rowIndex); // 선택된 행의 데이터를 상태에 저장
      } 
      else {
        setSelectedRow(0); 
      }

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
        getData2(selectedRows[0]);
      };

    });

  };


  // 품목정보 그리드 onGridReady
  const onGridReady2 = (params) => {
    gridRef2.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      
      getData3(ev.data);
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
      setData2(ev.data);
    });

    
    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      
    });

  };

  // 변경이력 그리드 onGridReady
  const onGridReady3 = (params) => {
    gridRef3.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
    });

    
    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      

      
    });

  };

  

  
  return (
    <div style={{ height: '87vh', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="d-flex gap-2">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
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
                        maxLength={50}
                      />
                      <Form.Control 
                        type="text"
                        name="client_name"
                        value={form.client_name}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="NAME"
                        maxLength={50}
                      />
                    </div>
                
                  </td>  
                  <th className="bg-light text-end align-middle">거래처유형</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Select 
                        name="client_type" 
                        value={form.client_type} 
                        onChange={handleChange}
                        size="sm"
                        className="w-auto"
                      >
                        <option value="">전체</option>
                        {(selectBox.current.common?.['cd001'] || [])
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
          <Col className="h-100 pe-0 d-flex flex-column" xs={12} md={4}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">거래처 정보</span>
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
            />
          </Col>

          <Col className="h-100 d-flex flex-column" xs={12} md={8}>

            <div className="mb-2 h-100 d-flex flex-column gap-0">
              <div className="d-flex gap-2 justify-content-start align-items-center">
                <span className="fw-bold my-2">품목 정보</span>
                {/* <Button size="sm" variant="secondary" onClick={setData2}>적용</Button> */}
                <Button size="sm" variant="success" onClick={addData2}>추가</Button>
                <Button size="sm" variant="danger" onClick={delData2}>삭제</Button>
              </div>

              <GridExample
                columnDefs={columnDefs2}
                rowData={rowData2}
                onGridReady={onGridReady2} 
                loading={loading2}
                rowNum={true}
                rowSel={"multiRow"}
                pageSize={10}  
              />
            </div>  

            <div className="h-100 d-flex flex-column gap-0">
              <div className="d-flex gap-2 justify-content-start align-items-center">
                <span className="fw-bold my-2">변경 이력</span>
              </div>

              <GridExample
                columnDefs={columnDefs3}
                rowData={rowData3}
                onGridReady={onGridReady3} 
                loading={loading3}
                rowNum={true}
                rowSel={"singleRow"}
                pageSize={10}  
              />
            </div>  

          </Col>


        </Row>

      </div>


    </div>
  );
}

export default Main;





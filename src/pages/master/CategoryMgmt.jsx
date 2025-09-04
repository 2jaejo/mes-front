import React, { useState, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { MainContentStyle } from "css/CommonStyle";


const Main = () => {
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);

  // 대분류 그리드 레퍼
  const gridRef = useRef();  

  // 소분류 그리드 래퍼
  const gridRef2 = useRef();

  // 대분류 행 선택값
  const [selectedRow, setSelectedRow] = useState(0); 
    
  // 대분류 그리드 설정
  const [rowData, setRowData] = useState();
  const [columnDefs] = useState([
    { headerName: "대분류코드", field: "category_id", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "대분류명", field: "category_nm", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left"},
    { headerName: "정렬", field: "sort", sortable: true, editable: false, align:"right"},
    { 
      headerName: "사용여부", 
      field: "use_yn", 
      sortable: true, 
      editable: false, 
      align:"center",
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
  ]);

  // 소분류 그리드 설정
  const [rowData2, setRowData2] = useState();
  const [columnDefs2] = useState([
    { headerName: "소분류코드", field: "category_id", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "소분류명", field: "category_nm", sortable: true, editable: true, filter: "agTextColumnFilter",  align:"left"},
    { headerName: "정렬", field: "sort", sortable: true, editable: true, align:"right"},
    { 
      headerName: "사용여부", 
      field: "use_yn", 
      sortable: true, 
      editable: false,
      backgroundColor: "#a7d1ff29",
      align:"center",
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
    { headerName: "비고", field: "comment", sortable: true, editable: true, align:"left", width:300},
  ]);

  // 검색창 입력필드
  const [form, setForm] = useState({
    category_id: '',
    use_yn: '',
  });

  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 대분류 상세 입력필드
  const [form2, setForm2] = useState({
    category_id:'',
    category_nm:'',
    sort: '',
    use_yn: '',
    comment: '',
  });

  // 대분류 상세 변경 저장
  const handleChange2 = (e) => {
    setForm2({ ...form2, [e.target.name]: e.target.value });
  };


  // 대분류 추가 모달
  const DEFAULT_FORM = () => ({
    category_id:'',
    category_nm:'',
    sort: '',
    use_yn: '',
    comment: '',
    parent_id: '',
  });
  const formRef = useRef();
  const formRefChange = (name, value) => {
    formRef.current[name] = value;
  };

  const ModalForm = ({ form={}, onChangeHandler }) => {
    console.log("ModalForm");

    const [modalForm, setModalForm] = useState(form);

    const modalFormChange = (e) => {
      const { name, value } = e.target;
      setModalForm(prev => ({ ...prev, [name]: value }));
      onChangeHandler(name, value);
    };

    return (
      <div className={"p-2 overflow-auto"}>
        <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
          <tbody>
            <tr>
              <th className="bg-light text-end align-middle">대분류코드</th>
              <td>
                <Form.Control 
                  type="text"
                  name="category_id"
                  value={modalForm.category_id ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
              <th className="bg-light text-end align-middle">대분류명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="category_nm"
                  value={modalForm.category_nm ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">정렬</th>
              <td>
                <Form.Control 
                  type="number"
                  name="sort"
                  value={modalForm.sort ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
              <th className="bg-light text-end align-middle">사용여부</th>
              <td>
                <Form.Select 
                  name="use_yn" 
                  value={modalForm.use_yn} 
                  onChange={modalFormChange}
                  size="sm"
                  className="w-100"
                  maxLength={50}
                >
                  <option value="y">사용</option>
                  <option value="n">미사용</option>
                </Form.Select>
              </td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">비고</th>
              <td colSpan={3}>
                <Form.Control
                  type="text"
                  name="comment"
                  value={modalForm.comment ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-100"
                  maxLength={200}
                />
              </td>
              
            </tr>
          </tbody>
        </Table>
      </div>
    );
  };

  // 소분류 추가 모달
  const DEFAULT_FORM2 = () => ({
    category_id:'',
    category_nm:'',
    sort: '',
    use_yn: '',
    comment: '',
    parent_id: '',
    parent_nm: '',
  });
  const formRef2 = useRef();
  const formRefChange2 = (name, value) => {
    formRef2.current[name] = value;
  };

  const ModalForm2 = ({ form={}, onChangeHandler }) => {
    console.log("ModalForm2");

    const [modalForm, setModalForm] = useState(form);

    const modalFormChange = (e) => {
      const { name, value } = e.target;
      setModalForm(prev => ({ ...prev, [name]: value }));
      onChangeHandler(name, value);
    };

    return (
      <div className={"p-2"}>
        <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
          <tbody>
            <tr>
              <th className="bg-light text-end align-middle">대분류코드</th>
              <td>
                <Form.Control 
                  type="text"
                  name="parent_id"
                  value={modalForm.parent_id ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                  disabled
                />
              </td>
              <th className="bg-light text-end align-middle">대분류명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="parent_nm"
                  value={modalForm.parent_nm ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                  disabled
                />
              </td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">소분류코드</th>
              <td>
                <Form.Control 
                  type="text"
                  name="category_id"
                  value={modalForm.category_id ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
              <th className="bg-light text-end align-middle">소분류명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="category_nm"
                  value={modalForm.category_nm ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">정렬</th>
              <td>
                <Form.Control 
                  type="number"
                  name="sort"
                  value={modalForm.sort ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
              <th className="bg-light text-end align-middle">사용여부</th>
              <td>
                <Form.Select 
                  name="use_yn" 
                  value={modalForm.use_yn} 
                  onChange={modalFormChange}
                  size="sm"
                  className="w-100"
                  maxLength={50}
                >
                  <option value="y">사용</option>
                  <option value="n">미사용</option>
                </Form.Select>
              </td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">비고</th>
              <td colSpan={3}>
                <Form.Control
                  type="text"
                  name="comment"
                  value={modalForm.comment ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-100"
                  maxLength={200}
                />
              </td>
              
            </tr>
          </tbody>
        </Table>
      </div>
    );
  };



  // 대분류 조회
  const getData = (params) => {
    console.log("getData");

    let sel = selectedRow;
    if(typeof params === "number"){
      sel = params;
    }

    setRowData2([]);

    setLoading(true);
    const startTime = Date.now(); // 요청 전 시간 기록

    axiosInstance
    .post(`/api/getCategoryMst`, JSON.stringify(form))
    .then((res) => {
      const endTime = Date.now(); // 응답 시간을 측정
      const responseTime = endTime - startTime; // 응답 시간 (밀리초)
      const delay = responseTime < 300 ? 300 - responseTime : 0; // 응답 시간이 0.5초보다 빠르면 남은 시간만큼 지연
      
      // 지연 후 응답을 출력
      setTimeout(async () => {
        setRowData(res.data);
        setLoading(false);

        gridRef.current.forEachNode((node) => {
          if (node.rowIndex === sel) {
            node.setSelected(true);
          }
        });
      }, delay);
        
    })
    .catch((error) => console.error("Error fetching data:", error));
    
  };

  
  // 대분류 추가
  const addData = (params) => {
    console.log("addData");

    // 폼 초기화
    formRef.current = DEFAULT_FORM();

    modalRef.current.open({
      title: "대분류 추가",
      message: "추가하시겠습니까?",
      content: <ModalForm onChangeHandler={formRefChange} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {


        if(formRef.current.category_id === "" || formRef.current.category_id === undefined){
          modalRef2.current.open({ title:"알림", message:"분류코드를 입력하세요.", cancelText:"" });
          return;
        }

        if(formRef.current.category_nm === ""){
          modalRef2.current.open({ title:"알림", message:"분류명을 입력하세요.", cancelText:"" });
          return;
        }

        axiosInstance
          .post(`/api/addCategory`, JSON.stringify(formRef.current))
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


  // 대분류 삭제
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
      message:`${selectRows[0].category_id}(${selectRows[0].category_nm}) - 삭제하시겠습니까?`,
      confirmText:"삭제",
      confirmClass:"btn btn-danger",
      onCancel:()=>{
        modalRef.current.close();
      },
      onConfirm:(res) => {
        
        axiosInstance
          .post(`/api/delCategory`, JSON.stringify(selectRows))
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

  

  // 대분류 상세 적용
  const setData = (params) => {
    console.log("setData");

    if (form2.category_id === ""){
      modalRef.current.open({ title:"알림", message:"대분류를 선택하세요.", cancelText:"" });
      return;
    }
    
    axiosInstance
      .post("api/setCategory", JSON.stringify(form2))
      .then((res) => {
        modalRef.current.open({ title:"알림", message:"적용되었습니다.", cancelText:"" });
        getData();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });   
  };




  // 소분류 조회
  const getData2 = (params) => {
    console.log("getData2");

    setForm2({...params});
    setLoading2(true);

    const startTime = Date.now(); // 요청 전 시간 기록
    axiosInstance
      .post(`/api/getCategoryDet`, JSON.stringify(params))
      .then((res) => {
        const endTime = Date.now(); // 응답 시간을 측정
        const responseTime = endTime - startTime; // 응답 시간 (밀리초)
        const delay = responseTime < 300 ? 300 - responseTime : 0; // 응답 시간이 남은 시간만큼 지연
        
        // 지연 후 응답을 출력
        setTimeout(async () => {
          setRowData2(res.data);
          setLoading2(false);
        }, delay);
          
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });   
  };


  // 소분류 수정
  const setData2 = (params) => {
    console.log("setData2");

    // const selRows = gridRef2.current.getSelectedRows();
    // console.log(selRows);
    // const node = gridRef2.current.getRowNode(String(1));
    // console.log(node);
    // console.log(node.data);
    // node.updateData(selRows[0]);
    // node.setData(selRows[0]);

    axiosInstance
      .post("api/setCategory", JSON.stringify(params))
      .then((res) => {
        const selectedRows = gridRef.current.getSelectedRows();
        if( selectedRows.length > 0 ){
          getData2(selectedRows[0]);
        };
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });   
  };


  // 소분류 추가
  const addData2 = (params) => {
    console.log("addData2");

    // 폼 초기화

    formRef2.current = DEFAULT_FORM2();
    formRef2.current["parent_id"] = form2.category_id;
    formRef2.current["parent_nm"] = form2.category_nm;

    modalRef.current.open({
      title: "소분류 추가",
      message: "추가하시겠습니까?",
      content: <ModalForm2 form={{parent_id:form2.category_id, parent_nm:form2.category_nm}} onChangeHandler={formRefChange2} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        
        if(formRef2.current.category_id === "" || formRef2.current.category_id === undefined){
          modalRef2.current.open({ title:"알림", message:"분류코드를 입력하세요.", cancelText:"" });
          return;
        }
        
        if(formRef2.current.category_nm === ""){
          modalRef2.current.open({ title:"알림", message:"분류명을 입력하세요.", cancelText:"" });
          return;
        }
        
        // 소분류 아이디 조합
        formRef2.current["category_id"] = formRef2.current["parent_id"] + '-' + formRef2.current["category_id"];

        axiosInstance
          .post(`/api/addCategory`, JSON.stringify(formRef2.current))
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


  // 소분류 삭제
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
          .post(`/api/delCategory`, JSON.stringify(selectRows))
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


  



  // 대분류 그리드 onGridReady
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


  // 소분류 그리드 onGridReady
  const onGridReady2 = (params) => {
    gridRef2.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
      setData2(ev.data);
    });

    
    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      

      const selectedRows = params.api.getSelectedRows();
      console.log(selectedRows);
    });

  };

  
  return (
    <div style={MainContentStyle}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="d-flex gap-2">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">대분류코드</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                    />
                
                  </td>
                  <th className="bg-light text-end align-middle">사용여부</th>
                  <td className="">
                    <Form.Select 
                      name="use_yn" 
                      value={form.use_yn} 
                      onChange={handleChange}
                      size="sm"
                      className="w-auto"
                    >
                      <option value="">전체</option>
                      <option value="y">사용</option>
                      <option value="n">미사용</option>
                    </Form.Select>
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
              <span className="fw-bold my-2">품목 대분류</span>
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
            />
          </Col>

          <Col className="h-100 d-flex flex-column" xs={12} md={8}>

            <div className="h-100 d-flex flex-column gap-0">

              <div className="d-flex gap-2 justify-content-start align-items-center">
                <span className="fw-bold my-2">대분류 상세</span>
                <Button size="sm" variant="secondary" onClick={setData}>적용</Button>
              </div>

              <div className="mb-2 p-2 border bg-light">
                <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
                  <tbody>
                    <tr>
                      <th className="bg-light text-end align-middle">대분류코드</th>
                      <td>
                        <Form.Control 
                          type="text"
                          name="category_id"
                          value={form2.category_id ?? ''}
                          size="sm" 
                          className="w-auto"
                          disabled
                        />
                      </td>
                      <th className="bg-light text-end align-middle">대분류명</th>
                      <td>
                        <Form.Control 
                          type="text"
                          name="category_nm"
                          value={form2.category_nm ?? ''}
                          onChange={handleChange2}
                          size="sm" 
                          className="w-auto"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light text-end align-middle">정렬</th>
                      <td>
                        <Form.Control 
                          type="text"
                          name="sort"
                          value={form2.sort ?? ''}
                          onChange={handleChange2}
                          size="sm" 
                          className="w-auto"
                        />
                      </td>
                      <th className="bg-light text-end align-middle">사용여부</th>
                      <td>
                        <Form.Select 
                          name="use_yn" 
                          value={form2.use_yn} 
                          onChange={handleChange2}
                          size="sm"
                          className="w-100"
                        >
                          <option value="y">사용</option>
                          <option value="n">미사용</option>
                        </Form.Select>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light text-end align-middle">비고</th>
                      <td colSpan={3}>
                        <Form.Control
                          type="text"
                          name="comment"
                          value={form2.comment ?? ''}
                          onChange={handleChange2}
                          size="sm" 
                          className="w-100"
                          maxLength={200}
                        />
                      </td>
                      
                    </tr>
                  </tbody>
                </Table>
              </div>

              <div className="d-flex gap-2 justify-content-start align-items-center">
                <span className="fw-bold my-2">품목 소분류</span>
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
                pageSize={15}  
              />
            </div>  

          </Col>


        </Row>

      </div>


    </div>
  );
}

export default Main;





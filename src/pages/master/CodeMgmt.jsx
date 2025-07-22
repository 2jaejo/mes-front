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

  // 그리드 레퍼
  const gridRef = useRef();  
  const gridRef2 = useRef();

  // 그리드 행 선택값
  const [selectedRow, setSelectedRow] = useState(0); 
    
  // 그리드 설정
  const [rowData, setRowData] = useState();
  const [columnDefs] = useState([
    { headerName: "그룹", field: "group_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "그룹명", field: "group_name", sortable: false, editable: true, filter: "agTextColumnFilter", align:"left"},
    { 
      headerName: "사용여부", 
      field: "use_yn", 
      sortable: true, 
      editable: true, 
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
    { headerName: "정렬", field: "sort", sortable: true, editable: true, align:"center"},
    { headerName: "비고", field: "comment", sortable: false, editable: true, align:"left"},
  ]);

  // 그리드2 설정
  const [rowData2, setRowData2] = useState();
  const [columnDefs2] = useState([
    { headerName: "코드", field: "code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
    { headerName: "코드명", field: "code_name", sortable: true, editable: true, filter: "agTextColumnFilter",  align:"left"},
    { 
      headerName: "사용여부", 
      field: "use_yn", 
      sortable: true, 
      editable: true, 
      align:"center",
      cellRenderer: 'agCheckboxCellRenderer',
      backgroundColor: "#a7d1ff29",
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
    { headerName: "정렬", field: "sort", sortable: true, editable: true, align:"center"},
    { headerName: "비고", field: "comment", sortable: true, editable: true, align:"left"},
    { headerName: "옵션1", field: "opt1", sortable: true, editable: true, align:"center"},
    { headerName: "옵션2", field: "opt2", sortable: true, editable: true, align:"center"},
    { headerName: "옵션3", field: "opt3", sortable: true, editable: true, align:"center"},
  ]);


  // 검색창 입력필드
  const [form, setForm] = useState({
    group_code: '',
    group_name: '',
  });

  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };



  // 추가 모달
  const DEFAULT_FORM = (init = {}) => ({
    group_code: '',
    group_name: '',
    sort: '',
    use_yn: '',
    comment: '',
    ...init, // 주어진 초기값을 덮어씌움
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
      <div className={"p-2"}>
        <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
          <tbody>
            <tr>
              <th className="bg-light text-end align-middle">그룹</th>
              <td>
                <Form.Control 
                  type="text"
                  name="group_code"
                  value={modalForm.group_code ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
              <th className="bg-light text-end align-middle">그룹명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="group_name"
                  value={modalForm.group_name ?? ''}
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


  // 추가2 모달
  const DEFAULT_FORM2 = (init = {}) => ({
    group_code:'',
    group_name:'',
    code:'',
    code_name:'',
    sort: '',
    use_yn: '',
    comment: '',
    opt1: '',
    opt2: '',
    opt3: '',
    ...init, // 주어진 초기값을 덮어씌움
  });
  const formRef2 = useRef();
  const formRefChange2 = (name, value) => {
    formRef2.current[name] = value;
  };

  const ModalForm2 = ({ form={}, onChangeHandler }) => {
    console.log("ModalForm2");

    const [modalForm, setModalForm] = useState(form);

    // 초기값(form)이 바뀔 때 modalForm에도 반영
    useEffect(() => {
      setModalForm(form);
    }, [form]);

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
              <th className="bg-light text-end align-middle">그룹</th>
              <td>
                <Form.Control 
                  type="text"
                  name="group_code"
                  value={modalForm.group_code ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                  disabled
                />
              </td>
              <th className="bg-light text-end align-middle">그룹명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="group_name"
                  value={modalForm.group_name ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                  disabled
                />
              </td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">코드</th>
              <td>
                <Form.Control 
                  type="text"
                  name="code"
                  value={modalForm.code ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
              <th className="bg-light text-end align-middle">코드명</th>
              <td>
                <Form.Control 
                  type="text"
                  name="code_name"
                  value={modalForm.code_name ?? ''}
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
                  <option value="Y">사용</option>
                  <option value="N">미사용</option>
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
            <tr>
              <th className="bg-light text-end align-middle">옵션</th>
              <td colSpan={3}>
                <Form.Control
                  type="text"
                  name="opt1"
                  value={modalForm.opt1 ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto mb-2"
                  placeholder="옵션1"
                  maxLength={50}
                />
                <Form.Control
                  type="text"
                  name="opt2"
                  value={modalForm.opt2 ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto mb-2"
                  placeholder="옵션2"
                  maxLength={50}

                />
                <Form.Control
                  type="text"
                  name="opt3"
                  value={modalForm.opt3 ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  placeholder="옵션3"
                  maxLength={50}

                />
              </td>
              
            </tr>
          </tbody>
        </Table>
      </div>
    );
  };



  // 조회
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
    .post(`/api/getCodeMst`, JSON.stringify(form))
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

  
  // 추가
  const addData = (params) => {
    console.log("addData");

    // 폼 초기화
    formRef.current = DEFAULT_FORM({use_yn:'Y'});

    modalRef.current.open({
      title: "그룹 추가",
      message: "추가하시겠습니까?",
      content: <ModalForm onChangeHandler={formRefChange} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {

        if(formRef.current.group_code === "" || formRef.current.group_code === undefined){
          modalRef2.current.open({ title:"알림", message:"분류코드를 입력하세요.", cancelText:"" });
          return;
        }

        if(formRef.current.group_name === ""){
          modalRef2.current.open({ title:"알림", message:"분류명을 입력하세요.", cancelText:"" });
          return;
        }

        if(formRef.current.sort === ""){
          modalRef2.current.open({ title:"알림", message:"정렬순서를 입력하세요.", cancelText:"" });
          return;
        }

        axiosInstance
          .post(`/api/addCodeMst`, JSON.stringify(formRef.current))
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
      message:`${selectRows[0].group_code}(${selectRows[0].group_name}) - 삭제하시겠습니까?`,
      confirmText:"삭제",
      confirmClass:"btn btn-danger",
      onCancel:()=>{
        modalRef.current.close();
      },
      onConfirm:(res) => {
        
        
        axiosInstance
          .post(`/api/delCodeMst`, JSON.stringify(selectRows))
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

  

  // 수정
  const setData = (params) => {
    console.log("setData");
    
    axiosInstance
      .post("api/setCodeMst", JSON.stringify(params))
      .then((res) => {
        modalRef.current.open({ title:"알림", message:"적용되었습니다.", cancelText:"" });
        getData();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      });   
  };




  // 조회2
  const getData2 = (params) => {
    console.log("getData2");

    setLoading2(true);

    const startTime = Date.now(); // 요청 전 시간 기록
    axiosInstance
      .post(`/api/getCodeDet`, JSON.stringify(params))
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


  // 수정2
  const setData2 = (params) => {
    console.log("setData2");

    axiosInstance
      .post("api/setCodeDet", JSON.stringify(params))
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


  // 추가2
  const addData2 = (params) => {
    console.log("addData2");

    const selectedRows = gridRef.current.getSelectedRows();

    const init = {
      group_code: selectedRows[0].group_code,
      group_name: selectedRows[0].group_name,
      use_yn: selectedRows[0].use_yn,
    };

    // 폼 초기화
    formRef2.current = DEFAULT_FORM2(init);

    modalRef.current.open({
      title: "코드 추가",
      message: "추가하시겠습니까?",
      content: <ModalForm2 form={init} onChangeHandler={formRefChange2} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        
        if(formRef2.current.code === "" || formRef2.current.code === undefined){
          modalRef2.current.open({ title:"알림", message:"코드를 입력하세요.", cancelText:"" });
          return;
        }
        
        if(formRef2.current.code_name === ""){
          modalRef2.current.open({ title:"알림", message:"코드명을 입력하세요.", cancelText:"" });
          return;
        }

        if(formRef2.current.sort === ""){
          modalRef2.current.open({ title:"알림", message:"정렬순서를 입력하세요.", cancelText:"" });
          return;
        }
        
        axiosInstance
          .post(`/api/addCodeDet`, JSON.stringify(formRef2.current))
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
        
        axiosInstance
          .post(`/api/delCodeDet`, JSON.stringify(selectRows))
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


  



  // 그리드 onGridReady
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


  // 그리드2 onGridReady
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
    });

  };

  
  return (
    <div style={{ height: '87vh', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="d-flex gap-2">
            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">그룹</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="group_code"
                      value={form.group_code}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                      maxLength={50}
                    />
                
                  </td>
                  <th className="bg-light text-end align-middle">그룹명</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="group_name"
                      value={form.group_name}
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
          <Col className="h-100 pe-0 d-flex flex-column" xs={12} md={4}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">그룹</span>
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
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">코드</span>
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

          </Col>


        </Row>

      </div>


    </div>
  );
}

export default Main;





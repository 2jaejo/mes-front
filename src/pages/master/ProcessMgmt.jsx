import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";


const Main = () => {

  // 모달 ref
  const modalRef = useRef();  
  const modalRef2 = useRef();  


  // 그리드 설정 시작 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  const gridRef = useRef();  
  const [selectedRow, setSelectedRow] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState([]);
  

  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      
      setSelectedRow(ev.rowIndex); 

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
      
   
    });

  };

  

  // 그리드 설정 종료 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  // selectbox
  const selectBox = useRef({}); 

  // grid cell code_name 변환
  const typeFormatter = (params, cd) => {
    const arr_client_type = selectBox.current.common?.[cd] || [];
    const item = arr_client_type.find(el => el.code === params.value);
    return item ? item.code_name : params.value; 
  };



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

      // 공정목록 그리드 설정
      setColumnDefs([
        { headerName: "공정코드", field: "process_code", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter"},
        { headerName: "공정명", field: "process_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter", width:300 },
        { headerName: "공정유형", field: "process_type", sortable: true, editable: true, align:"center", filter: "agTextColumnFilter", 
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd011'].map((item) => item.code) ?? [],
          },
          valueFormatter:(params)=> typeFormatter(params,'cd011'),
          cellRenderer: (params) => { return (<div className="d-flex gap-2">{params.valueFormatted} <i className="bi bi-caret-down-fill"></i></div>)}, 
        },
       
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
    process_type: '',
    process_code: '',
    process_name: '',
    use_yn: '',
  });

  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // 추가 모달 폼 초기화
  const DEFAULT_FORM = (init={}) => ({
    process_code : ''
    , process_name : ''
    , process_type : ''
    , check_yn : ''
    , use_yn : ''
    , comment : ''
    , ...init
  });
  // 추가 모달 폼 ref
  const formRef = useRef();

  // 추가 모달 폼 ref 변경
  const formRefChange = (name, value) => {
    formRef.current[name] = value;
  };

  // 추가 모달 폼
  const ModalForm = ({ form={}, onChangeHandler }) => {
    console.log("ModalForm2");

    const [modalForm, setModalForm] = useState(form);

    const modalFormChange = (e) => {
      const { name, value } = e.target;
      setModalForm(prev => ({ ...prev, [name]: value }));
      onChangeHandler(name, value);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
          <tbody>
            <tr>
              
              <th className="bg-light text-end align-middle">공정코드</th>
              <td className="">
                <Form.Control 
                  type="text"
                  name="process_code"
                  value={modalForm.process_code}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>                    
              <th className="bg-light text-end align-middle">공정명</th>
              <td className="">
                <Form.Control 
                  type="text"
                  name="process_name"
                  value={modalForm.process_name}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
            </tr>
            
            <tr>
              <th className="bg-light text-end align-middle">공정유형</th>
              <td className="">
                <Form.Select 
                  name="process_type" 
                  value={modalForm.process_type} 
                  onChange={modalFormChange}
                  size="sm"
                  className="w-100"
                >
                  {(selectBox.current.common?.['cd011'] || [])
                    .filter(opt => opt.use_yn === 'Y')
                    .map(opt => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code_name}
                      </option>
                  ))}
                </Form.Select>
              </td>

              <th className="bg-light text-end align-middle"></th>
              <td className="">
              </td>
            </tr>
            
            <tr>
              <th className="bg-light text-end align-middle">검사여부</th>
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
                  maxLength={200}
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

    setRowData([]);

    setLoading(true);

    axiosInstance
    .post(`/api/getProcess`, JSON.stringify(form))
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


  // 수정
  const setData = (params) => {
    console.log("setData");

    axiosInstance
      .post("api/setProcess", JSON.stringify(params))
      .then((res) => {
       
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
      process_type: selectBox.current.common?.['cd011'][0].code,
      check_yn: 'Y',
      use_yn: 'Y',
    });

    modalRef.current.open({
      title: "추가",
      message: "추가하시겠습니까?",
      content: <ModalForm form={formRef.current} onChangeHandler={formRefChange} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        
        if(formRef.current.process_code === "" || formRef.current.process_code === undefined){
          modalRef2.current.open({ title:"알림", message:"공정코드를 입력하세요.", cancelText:"" });
          return;
        }
        
        if(formRef.current.process_name === ""){
          modalRef2.current.open({ title:"알림", message:"공정명을 입력하세요.", cancelText:"" });
          return;
        }

        modalRef.current.update({ isLoading: true });
        axiosInstance
          .post(`/api/addProcess`, JSON.stringify(formRef.current))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.close();
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          })
          .finally(() => {
            modalRef.current.update({ isLoading: false });
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
        
        
        axiosInstance
          .post(`/api/delProcess`, JSON.stringify(sel_rows))
          .then((res) => {
            getData();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          })
          .finally(() =>{
            modalRef.current.close();
            setLoading(false);
          });
      },
    });
    
  };

  
  return (
    <div style={{ height: '87vh', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="bg-light">
        <Row className="">
          <Col className="d-flex gap-2">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">공정유형</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Select 
                        name="process_type" 
                        value={form.process_type} 
                        onChange={handleChange}
                        size="sm"
                        className="w-auto"
                        style={{minWidth: '100px'}}
                      >
                        <option value="">전체</option>
                        {(selectBox.current.common?.['cd011'] || [])
                          .filter(opt => opt.use_yn === 'Y')
                          .map(opt => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code_name}
                            </option>
                        ))}
                      </Form.Select>
                    </div>
                  </td>

                  <th className="bg-light text-end align-middle">공정코드</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="process_code"
                      value={form.process_code}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                      maxLength={50}
                    />
                  </td>     
                  <th className="bg-light text-end align-middle">공정명</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="process_name"
                      value={form.process_name}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                      maxLength={50}
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
              <span className="fw-bold">공정 목록</span>
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
        </Row>

      </div>

      
    

    </div>
  );
}

export default Main;





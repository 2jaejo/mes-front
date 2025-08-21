import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import dayjs from "dayjs";

const Main = () => {
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  const [loading, setLoading] = useState(false);

  const gridRef = useRef();  

  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState([]);

  // selectbox
  const selectBox = useRef({}); 

  // 행 선택값
  const [selectedRow, setSelectedRow] = useState(0); 

  // grid cell code_name 변환
  const typeFormatter = (params, cd) => {
    const arr_client_type = selectBox.current.common?.[cd] || [];
    const item = arr_client_type.find(el => el.code === params.value);
    return item ? item.code_name : params.value; 
  };

  // 초기화 selectbox list
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      category: '',
      code: ['cd007', 'cd008', 'cd009', 'cd010','cd011']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      // 설비목록 그리드 설정
      setColumnDefs([
        { headerName: "설비코드", field: "equipment_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left"},
        { headerName: "설비명", field: "equipment_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left"},
        { headerName: "설비유형", field: "equipment_type", sortable: true, editable: false, align:"center", valueFormatter:(params)=> typeFormatter(params,'cd011')},
        { headerName: "제조사", field: "manufacturer", sortable: false, editable: false, align:"center"},
        { headerName: "모델명", field: "model", sortable: false, editable: false, align:"left"},
        { headerName: "설치일", field: "install_date", sortable: false, editable: true, align:"center"},
        { headerName: "상태", 
          field: "status", 
          sortable: false, 
          editable: true, 
          align:"center", 
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd007'].map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => typeFormatter(params,'cd007'),
        },
        { headerName: "사용여부", 
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
        { headerName: "비고", field: "comment", sortable: false, editable: true, align:"left", width:300},
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
    equipment_type: '',
    equipment_code: '',
    equipment_name: '',
    use_yn: '',
  });

  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // 추가 모달 폼 초기화
  const DEFAULT_FORM = (init={}) => ({
    equipment_code : ''
    , equipment_name : ''
    , equipment_type : ''
    , manufacturer : ''
    , model : ''
    , install_date : ''
    , location : ''
    , status : ''
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
              <th className="bg-light text-end align-middle">설비코드</th>
              <td className="">
                <Form.Control 
                  type="text"
                  name="equipment_code"
                  value={modalForm.equipment_code}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>                    
              <th className="bg-light text-end align-middle">설비명</th>
              <td className="">
                <Form.Control 
                  type="text"
                  name="equipment_name"
                  value={modalForm.equipment_name}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
              <th className="bg-light text-end align-middle">설비유형</th>
              <td>
                <Form.Select 
                  name="equipment_type" 
                  value={modalForm.equipment_type} 
                  onChange={modalFormChange}
                  size="sm"
                  className="w-100"
                  maxLength={50}
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
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">제조사</th>
              <td className="">
                <Form.Control 
                  type="text"
                  name="manufacturer"
                  value={modalForm.manufacturer}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>                    
              <th className="bg-light text-end align-middle">모델명</th>
              <td className="">
                <Form.Control 
                  type="text"
                  name="model"
                  value={modalForm.model}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>
              <th className="bg-light text-end align-middle">설치일</th>
              <td className="">
                <Form.Control 
                  type="date"
                  name="install_date"
                  value={modalForm.install_date}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                  maxLength={50}
                />
              </td>                    
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">설치위치</th>
              <td>
                <Form.Select 
                  name="location" 
                  value={modalForm.location} 
                  onChange={modalFormChange}
                  size="sm"
                  className="w-100"
                >
                  {(selectBox.current.common?.['cd009'] || [])
                    .filter(opt => opt.use_yn === 'Y')
                    .map(opt => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code_name}
                      </option>
                  ))}
                </Form.Select>
              </td>
              <th className="bg-light text-end align-middle">상태</th>
              <td>
                <Form.Select 
                  name="status" 
                  value={modalForm.status} 
                  onChange={modalFormChange}
                  size="sm"
                  className="w-100"
                >
                  {(selectBox.current.common?.['cd007'] || [])
                    .filter(opt => opt.use_yn === 'Y')
                    .map(opt => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code_name}
                      </option>
                  ))}
                </Form.Select>
              </td>
              <th className="bg-light text-end align-middle">사용여부</th>
              <td>
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

    let sel = selectedRow;
    if(typeof params === "number"){
      sel = params;
    }

    setRowData([]);

    setLoading(true);

    axiosInstance
    .post(`/api/getEquipment`, JSON.stringify(form))
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




  // 수정
  const setData = (params) => {
    console.log("setData");

    axiosInstance
      .post("api/setEquipment", JSON.stringify(params))
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
      equipment_type : selectBox.current.common?.['cd008'][0].code || '',
      install_date : dayjs().format('YYYY-MM-DD'),
      location : selectBox.current.common?.['cd009'][0].code || '',
      status : selectBox.current.common?.['cd007'][0].code || '',
      use_yn : selectBox.current.common?.['cd010'][0].code || '',
    });

    modalRef.current.open({
      title: "설비 추가",
      message: "추가하시겠습니까?",
      content: <ModalForm form={formRef.current} onChangeHandler={formRefChange} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        
        if(formRef.current.equipment_code === "" || formRef.current.equipment_code === undefined){
          modalRef2.current.open({ title:"알림", message:"설비코드를 입력하세요.", cancelText:"" });
          return;
        }
        
        if(formRef.current.equipment_name === ""){
          modalRef2.current.open({ title:"알림", message:"설비명을 입력하세요.", cancelText:"" });
          return;
        }

        axiosInstance
          .post(`/api/addEquipment`, JSON.stringify(formRef.current))
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
      message:`선택된 행을 삭제하시겠습니까?`,
      confirmText:"삭제",
      confirmClass:"btn btn-danger",
      onCancel:()=>{
        modalRef.current.close();
      },
      onConfirm:(res) => {
        
        axiosInstance
          .post(`/api/delEquipment`, JSON.stringify(selectRows))
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


  
   

  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

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
        // getData(selectedRows[0]);
      };

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
                  <th className="bg-light text-end align-middle">설비유형</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Select 
                        name="equipment_type" 
                        value={form.equipment_type} 
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

                  <th className="bg-light text-end align-middle">설비코드</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="equipment_code"
                      value={form.equipment_code}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                    />
                  </td>     
                  <th className="bg-light text-end align-middle">설비명</th>
                  <td className="">
                    <Form.Control 
                      type="text"
                      name="equipment_name"
                      value={form.equipment_name}
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
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">설비 목록</span>
              <Button size="sm" variant="success" onClick={addData}>추가</Button>
              <Button size="sm" variant="danger" onClick={delData}>삭제</Button>
            </div>

            <GridExample 
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"multiRow"}
            />
          </Col>

        </Row>

      </div>


    </div>
  );
}

export default Main;





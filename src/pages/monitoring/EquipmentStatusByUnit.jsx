import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { ContentSteeringController } from "hls.js";


const Main = () => {
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const gridRef = useRef();  
  const gridRef2 = useRef();  

  const [selectedRow, setSelectedRow] = useState(0); 
  const [selectedRow2, setSelectedRow2] = useState(0); 
  

  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState([]);

  const [rowData2, setRowData2] = useState();
  const [columnDefs2, setColumnDefs2] = useState([
    { headerName: "점검코드", field: "check_code", sortable: true, editable: false, align:"center"},
    { headerName: "점검명", field: "check_name", sortable: true, editable: false, align:"left" },
    { headerName: "점검방법", field: "method", sortable: true, editable: true, align:"left" },
    { headerName: "점검기준", field: "standard", sortable: true, editable: true, align:"left" },
    { headerName: "점검주기", field: "cycle", sortable: true, editable: true, align:"center" },
    { headerName: "비고", field: "comment", sortable: true, editable: true, align:"left" },
    
  ]);

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
      code: ['cd007', 'cd008', 'cd009', 'cd010']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      // 설비목록 그리드 설정
      setColumnDefs([
        { headerName: "설비코드", field: "equipment_code", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter"},
        { headerName: "설비명", field: "equipment_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter" },
        { headerName: "설비유형", field: "equipment_type", sortable: true, editable: false, align:"center", filter: "agTextColumnFilter", 
          valueFormatter:(params)=> typeFormatter(params,'cd008')
        },
        { headerName: "상태", field: "status", sortable: true, editable: false, align:"center", 
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd007'].map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => typeFormatter(params,'cd007'),
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
    , check_code : ''
    , check_name : ''
    , method : ''
    , standard : ''
    , cycle : ''
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
              <th className="bg-light text-end align-middle">점검코드</th>
              <td className="">
                <Form.Control 
                  type="text"
                  name="check_code"
                  value={modalForm.check_code}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                />
              </td>                    
              <th className="bg-light text-end align-middle">점검명</th>
              <td className="">
                <Form.Control 
                  type="text"
                  name="check_name"
                  value={modalForm.check_name}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                />
              </td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">점검방법</th>
              <td className="">
                <Form.Control 
                  type="text"
                  name="method"
                  value={modalForm.method}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                />
              </td>                    
              <th className="bg-light text-end align-middle">점검기준</th>
              <td className="">
                <Form.Control 
                  type="text"
                  name="standard"
                  value={modalForm.standard}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-auto"
                />
              </td>
            </tr>
            
            <tr>
              <th className="bg-light text-end align-middle">점검주기</th>
              <td className="">
                <Form.Control 
                  type="text"
                  name="cycle"
                  value={modalForm.cycle}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-100"
                />
              </td>
              <th className="bg-light text-end align-middle">비고</th>
              <td className="">
                <Form.Control 
                  type="text"
                  name="comment"
                  value={modalForm.comment}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-100"
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
    .post(`/api/getEquipment`, JSON.stringify(form))
    .then((res) => {
      setRowData(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
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

  // 조회2
  const getData2 = (params) => {
    console.log("getData2");

    setRowData2([]);
    setLoading2(true);

    axiosInstance
    .post(`/api/getEquipmentCheck`, JSON.stringify(params))
    .then((res) => {
      setRowData2(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    })
    .finally(() =>{
      setLoading2(false);
    });
    
  };




  // 수정
  const setData2 = (params) => {
    console.log("setData2");

    axiosInstance
      .post("api/setEquipmentCheck", JSON.stringify(params))
      .then((res) => {
       
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
      });   
  };


  // 추가
  const addData2 = (params) => {
    console.log("addData");

    // 폼 초기화
    formRef.current = DEFAULT_FORM({
      equipment_code : gridRef.current.getSelectedRows()[0].equipment_code,
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
        
        if(formRef.current.equipment_code === "" || formRef.current.equipment_code === undefined){
          modalRef2.current.open({ title:"알림", message:"설비코드를 입력하세요.", cancelText:"" });
          return;
        }
        
        if(formRef.current.equipment_name === ""){
          modalRef2.current.open({ title:"알림", message:"설비명을 입력하세요.", cancelText:"" });
          return;
        }

        axiosInstance
          .post(`/api/addEquipmentCheck`, JSON.stringify(formRef.current))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.close();
            modalRef2.current.open({ title:"알림", message:error.response.data.message, cancelText:"" });
          });    

      }, 
    });

  };


  // 삭제
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
          .post(`/api/delEquipmentCheck`, JSON.stringify(selectRows))
          .then((res) => {
            getData();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef2.current.open({ title:"알림", message:error.response.data.message, cancelText:"" });
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
      console.log(ev);
      setSelectedRow(ev.rowIndex); 
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
      console.log("rowClicked2");
      console.log(ev);

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
      console.log("cellValueChanged2");
      console.log(ev);
      setData2(ev.data);
    });

    
    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged2");
      console.log(ev);
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
                        {(selectBox.current.common?.['cd008'] || [])
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
          <Col className="pe-0 h-100 d-flex flex-column" xs={12} md={12}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">설비 목록</span>
              
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





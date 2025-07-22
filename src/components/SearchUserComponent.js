import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";

const Main = ({ form }) => {
  console.log("SearchUserComponent");

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
    gridRef.current = params.api; // Grid API 저장

    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      
      const selectedRows = ev.api.getSelectedRows();
      form.current['sel_row'] = selectedRows[0];    
    });
  };


  // 초기화
  useEffect(()=>{      
    const init = {
      category: '',
      code: ['cd001', 'cd010']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      setColumnDefs([
        { headerName: "아이디", field: "user_id", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left" },
        { headerName: "이름", field: "user_nm", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left"},
      ]);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    });  

  },[]);



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


  // 조회
  const getData = (params) => {
    setLoading(true);
    axiosInstance
      .post(`/users/getUsers`, JSON.stringify(modalForm))
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


  return (
    <div style={{ height: '50vh', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="d-flex gap-2">
            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">아이디</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="user_id"
                        value={form.user_id}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        maxLength={50}
                      />
                    </div>
                  </td>

                  <th className="bg-light text-end align-middle">이름</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        name="user_nm"
                        value={form.user_nm}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
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
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">사용자 목록</span>
            </div>

            <GridExample
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pageSize={10}  
            />
          </Col>


        </Row>

      </div>


    </div>
  );
};

export default Main;
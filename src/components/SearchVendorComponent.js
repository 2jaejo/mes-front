import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";

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
      props.current['sel_row'] = selectedRows[0];
    });
  };


  // 초기화
  useEffect(()=>{
    const init = {
      category: '',
      code: ['']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      setColumnDefs([
          { headerName: "매입처코드", field: "client_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"left" },
          { headerName: "매입처명", field: "client_name", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left", flex:1},
        ]);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    });  

  },[]);



  // 조회
  const getData = (params) => {
    setLoading(true);
    axiosInstance
      .post(`/api/getClient`, JSON.stringify(modalForm))
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
    <div style={{ height: '50vh',width:'50vw', display: 'flex', flexDirection: 'column' }}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="mb-2 bg-light">
        <Row className="">
          <Col className="overflow-auto">
            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">매입처코드</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="client_code"
                        value={modalForm.client_code}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        maxLength={50}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </Table>
            <Table bordered style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">매입처명</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="client_name"
                        value={modalForm.client_name}
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
              <span className="fw-bold my-2">매입처 목록</span>
            </div>

            <GridExample
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={false}
            />
          </Col>


        </Row>

      </div>


    </div>
  );
};
  

export default Main;
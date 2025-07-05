import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";

const Main = ({ form }) => {
  console.log("SearchClientComponent");

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
      console.log(ev);
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
        { headerName: "거래처코드", field: "client_code", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "거래처명", field: "client_name", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "거래처유형", field: "client_type", sortable: true, editable: false, align:"center", 
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd001'].map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => commonTypeFormatter(params,'cd001'),
        },
        { headerName: "사업자등록번호", field: "business_no", sortable: true, editable: false, align:"center"},
        { headerName: "업태", field: "business_type", sortable: true, editable: false, align:"left"},
        { headerName: "업종", field: "business_item", sortable: true, editable: false, align:"left"},
        { headerName: "대표자", field: "ceo_name", sortable: true, editable: false, align:"left"},
        { headerName: "담당자", field: "contact_name", sortable: true, editable: false, align:"left"},
        { headerName: "연락처", field: "contact_phone", sortable: true, editable: false, align:"center"},
        { headerName: "팩스", field: "contact_fax", sortable: true, editable: false, align:"center"},
        { headerName: "이메일", field: "contact_email", sortable: true, editable: false, align:"left"},
        { 
          headerName: "사용여부", 
          field: "use_yn", 
          sortable: true, 
          editable: false,
          // backgroundColor: "#a7d1ff29",
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
        { headerName: "비고", field: "comment", sortable: true, editable: false, align:"left", minWidth:300},
      ]);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
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
      .post(`/api/getClient`, JSON.stringify(modalForm))
      .then((res) => {
        setRowData(res.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
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
                  <th className="bg-light text-end align-middle">거래처코드</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="client_code"
                        value={form.client_code}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                      />
                    </div>
                  </td>

                  <th className="bg-light text-end align-middle">거래처명</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="client_name"
                        value={form.client_name}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
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
              <span className="fw-bold my-2">거래처 목록</span>
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
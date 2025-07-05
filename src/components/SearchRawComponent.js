import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";

const Main = ({ form }) => {
  console.log("SearchRawComponent");

  // 모달 ref
  const modalRef = useRef();  

  // selectbox
  const selectBox = useRef({}); 

  const [modalForm, setModalForm] = useState(form.current);

  const modalFormChange = (e) => {
    console.log(e);
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
    form.current[name] = value;
  };

  // 바코드 스캔
  const handleKeyPress = async (e) => {

    if (e.key === 'Enter' && form.current.barcode.trim() !== '') {
      
      const params = {
        barcode: form.current.barcode,
      }

      setLoading(true);

      axiosInstance
        .post(`/api/getRaw`, JSON.stringify(params))
        .then((res) => {
          setRowData(res.data);
          
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
        })
        .finally(() =>{
          setLoading(false);
          modalFormChange({ target: { name: 'barcode', value: '' } });

        });
      
    }

  };

  const gridRef = useRef();  
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);


  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    const init = {
      category: '',
      code: ['']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      setColumnDefs([
        { headerName: "운영상품코드", field: "item_usr_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "바코드", field: "bar_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "품번", field: "raw_code", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:150 },
        { headerName: "품명", field: "raw_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"left", minWidth:200 },
        { headerName: "단위", field: "base_unit", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "규격", field: "unit_size", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "매입가", field: "buyprice", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "분류", field: "type_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "상태", field: "status_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "안전재고", field: "right_qty", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "매입처", field: "supply_name", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "등록일", field: "created_at", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "등록자", field: "created_by", sortable: true, editable: false, filter: "agTextColumnFilter", align:"center" },
        
      ]);

      getData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.response.data.message, cancelText:"" });
    });  

  },[]);


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


  // 조회
  const getData = () => {
    setRowData([]);
    setLoading(true);

    axiosInstance
    .post(`/api/getRaw`, JSON.stringify(modalForm))
    .then((res) => {
      setRowData(res.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
    })
    .finally(() =>{
      setLoading(false);
    });
    
  };


  return (
    <div style={{ height: '50vh', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <Modal ref={modalRef} />

      <div className="bg-light">
        <Row className="">
          <Col className="">
          
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>

                  <th className="bg-light text-end align-middle">품목</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="raw_code"
                        value={modalForm.raw_code}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="품번"
                      />
                      <Form.Control 
                        type="text"
                        name="raw_name"
                        value={modalForm.raw_name}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="품명"
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
                        value={modalForm.barcode}
                        onChange={modalFormChange}
                        onKeyDown={handleKeyPress}
                        size="sm" 
                        className="w-auto"
                        placeholder="바코드를 스캔하세요"
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
        <Col className="h-100 d-flex flex-column" xs={12} md={12}>
          <div className="mb-1 d-flex gap-2 justify-content-start align-items-center">
            <span className="fw-bold">품목 목록</span>
          </div>

          <GridExample 
            columnDefs={columnDefs}
            rowData={rowData}
            onGridReady={onGridReady} 
            loading={loading}
            rowNum={true}
            rowSel={"singleRow"}
            pagination={true}
            pageSize={10}
            // rowDrag={true}
          />
        </Col>
      </Row>

    </div>

    </div>
  );
};

export default Main;
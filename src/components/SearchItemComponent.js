import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";

const Main = ({ form }) => {
  console.log("SearchItemComponent");

  // 모달 ref
  const modalRef = useRef();  
  
  // selectbox
  const selectBox = useRef({}); 

  const [modalForm, setModalForm] = useState(form.current);

  const modalFormChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
    form.current[name] = value;
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
      code: ['cd006', 'cd010', 'cd011']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      setColumnDefs([
        
        { headerName: "품목코드", field: "item_dotno", sortable: false, editable: false, filter: "agTextColumnFilter", align:"center" },
        { headerName: "품목명", field: "item_name", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "품목유형", field: "item_type", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd006']?.map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => commonTypeFormatter(params, 'cd006'),
        },
        { headerName: "기준단위", field: "base_unit", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd004']?.map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => commonTypeFormatter(params, 'cd004'),
        },
        { headerName: "거래처", field: "client_list", sortable: true, editable: false, filter: "agTextColumnFilter",  align:"left"},
        { headerName: "단가", field: "standard_price", sortable: true, editable: false, align:"right", 
          valueFormatter: (params) => {
            const value = parseFloat(params.value);
            return isNaN(value) ? '' : `${value.toLocaleString()}`;
          },
        },
        { 
          headerName: "사용여부", 
          field: "use_yn", 
          sortable: false, 
          editable: false,
          align:"center",
          maxWidth:80,
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
        { headerName: "비고", field: "comment", sortable: true, editable: false, align:"left", minWidth:300},
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


  // 조회
  const getData = () => {
    setRowData([]);
    setLoading(true);

    axiosInstance
    .post(`/api/getItem`, JSON.stringify(modalForm))
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
                        name="item_dotno"
                        value={form.item_dotno}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                        maxLength={50}
                      />
                      <Form.Control 
                        type="text"
                        name="item_name"
                        value={form.item_name}
                        onChange={modalFormChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="NAME"
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
            // pageSize={10}
            // rowDrag={true}
          />
        </Col>
      </Row>

    </div>

    </div>
  );
};

export default Main;